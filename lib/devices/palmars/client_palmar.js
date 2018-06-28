"use strict";

const debug = require('../../debug').debug;
const Palmar = require("./palmar").Palmar;
const mqtt = require('mqtt');
const TcpClient = require('../../tcp_client').TcpClient;
const NodeRSA = require('node-rsa');

const SIGN_VERIFICATION_STRING = 'signatureVerified';
const SIGN_ENCODING = 'base64';

const PRIVATE_KEY =
    'MIICWwIBAAKBgHw69Qdomr+rgUSKIOvlmAXEAsPKoUUV8ek/JFPAk+h4dUSEZIfn\n' +
    'Ru0MvFtDupM9s/eAveaR2DLJ+LAaqZRGL7PbMjQe1sJNUd3hgcjF46MijDdfD/Mh\n' +
    'E/4xmeVMj4B69lNrkNfx6mjxXz92GG02K8yx8hWtpxqkgkTi8xhAb5gzAgMBAAEC\n' +
    'gYB0pG64fBEAcim3jvIGS9aHY1ktOK5fTZGL7UtQj/rQRXnl0WEK8a54mIKqNleS\n' +
    'NFcrxmeHe9zBIz4rK32ZyKS0KA1QMUPpTM/J3zU7EPVwuqQAD+B94TDG16e03Pk7\n' +
    'yzuolrvu6UKuauGL870vTZdEeue5xfqAfBpjHzYmqwv1AQJBANcT8WqB3mkJi0qy\n' +
    'LfoR/Mj+JJP6wL4S+knom5cnYhH78TyEAgxw/vl58evrt6vNKfMaozSVHFfRwtkC\n' +
    'boyiLMECQQCT3f2/yeRlcnBMPtVW0iI6BFCIXauYIvi0JwW1ttQYyU8xzVWLzgkr\n' +
    'E23I+UzUr9pTjgxdHKZudY0oJZt+fV3zAkBklHb5j/IqvMPfEqRdpbvJYtBIQ6OP\n' +
    'P+C8X4MjlM9QCbouyq0KlG0ozdZMtdcXCMLtZS+dj33Js9ajFXgNXGoBAkBEnLuD\n' +
    '5OCwGhv1pSpFMRhkp1/fBuf6ni+dGIZTvVRJdA/lYgwR5Tbn4AoPOW7nOfoqzzz5\n' +
    'b7PiiXVIbbrrRKz1AkEAr2mAi9vLR30F8CmHnUzLJQ4up2Eh8WW+WR2/t0C4Akap\n' +
    'KBHxlG5mVygFzp9/4wjqiBrIH4hSMbSn2Z+1O26s/Q==';


class ClientPalmar extends Palmar {
    constructor(idx, notifications, clientIdx, mqttBrokerUrl, mqttTopicBase, tcpData) {
        super(idx, 'clientPalmar', notifications);
        this.clientIdx = clientIdx;
        this.cartProducts = [];
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, mqttTopicBase);
        this.tcpClient = new TcpClient(tcpData.address, tcpData.port, this.setClientName, this);
        this.privateKey = new NodeRSA(PRIVATE_KEY, 'private');
    }

    setClientName() {
        let tcpMsg = {
            event: 'clientInformationRequest',
            idx: this.clientIdx
        };

        let callback = (data) => {
            this.username = data.name;
            this.pushNotification({type: 'message', title: 'Logged in', data: `Logged in as ${this.username}`});
        };

        this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
    }

    helpRequestClick(message) {
        let mqttMsg = {
            idx: message.idx,
            name: message.username
        };

        this.mqttClient.publish(this.mqttTopicBase + '/client/action/help', JSON.stringify(mqttMsg));
    }

    productInformationRequest(message) {
        let tcpMsg = {
            event: 'clientProductInformationRequest',
            multiple: false,
            idx: message.idx,
            clientIdx: this.clientIdx
        };

        let callback = (message) => {
            this.pushNotification(message.notification);
        };

        this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
    }

    cartTotalRequest() {
        let cartData = this.getCartData();

        let tcpMsg = {
            event: 'cartTotalRequest',
            cartData: cartData
        };

        let callback = (cartData) => {
            debug.log('TCP - client palmar received: ' + JSON.stringify(cartData));

            let notification = {
                type: 'cartTotal',
                total: cartData.total,
                list: cartData.list
            };
            this.pushNotification(notification);
        };

        this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
    }

    paymentRequest() {
        if (this.cartProducts.length === 0) {
            this.pushNotification({type: 'message', title: 'Payment', warnings: ['Your cart is empty!']});
        } else {
            let cartData = this.getCartData();

            let tcpMsg = {
                event: 'paymentRequest',
                data: {
                    clientIdx: this.clientIdx,
                    cartData: cartData,
                    signature: this.generateSignature()
                }
            };

            let callback = (data) => {
                this.pushNotification(data.notification);
                if (data.success) {
                    this.updateGUI('purchaseComplete');
                }
            };

            this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
        }

    }

    ratingGiven(value) {
        let mqttMsg = {
            clientIdx: this.clientIdx,
            value: value
        };

        this.mqttClient.publish(this.mqttTopicBase + '/client/ratingGiven', JSON.stringify(mqttMsg));
    }

    clearProducts() {
        this.cartProducts = [];
    }

    pushNotification(message) {
        super.pushNotification(message);
        this.updateGUI();
    }

    removeNotification(message) {
        super.removeNotification(message);
        this.updateGUI();
    }

    createMQTTClient(mqttBrokerUrl, mqttTopicBase) {
        let productAddedTopic = `${mqttTopicBase}/clients/${this.clientIdx}/productAdded`;
        let productRemovedTopic = `${mqttTopicBase}/clients/${this.clientIdx}/productRemoved`;
        let ratingRequestTopic = `${mqttTopicBase}/clients/${this.clientIdx}/ratingRequest`;
        let ratingReceivedTopic = `${mqttTopicBase}/clients/${this.clientIdx}/ratingReceived`;

        let topics = [productAddedTopic, productRemovedTopic, ratingRequestTopic, ratingReceivedTopic];

        let client = mqtt.connect(mqttBrokerUrl);
        client.on('connect', () => {
            topics.forEach((topic) => {
                client.subscribe(topic);
                debug.log(`MQTT: clientPalmar (idx:${this.idx}) subscribing to ${topic}`);
            });
        });

        client.on('message', (topic, data) => {
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) received message on ${topic} with content ${data}`);

            let message = JSON.parse(data.toString());

            if (topic === productAddedTopic) {
                this.cartProducts.push(message.product);
                this.pushNotification(message.notification);

            } else if (topic === productRemovedTopic) {
                let index = this.cartProducts.find((product) => product.idx === message.productIdx);
                if (index !== -1) {
                    this.cartProducts.splice(index, 1);
                }
                this.updateGUI();

            } else if (topic === ratingRequestTopic) {
                this.pushNotification(message.notification);

            } else if (topic === ratingReceivedTopic) {
                this.removeRatingRequestNotification();
                this.pushNotification(message.notification);
            }
        });

        return client;
    }

    removeRatingRequestNotification() {
        this.removeNotification(
            this.notifications.find((n) => n.type === 'ratingRequest')
        );
    }

    getCartData() {
        let result = {};

        this.cartProducts.forEach((product) => {
            if (result[product.idx] == null) {
                result[product.idx] = 0;
            }

            result[product.idx] += 1;
        });

        return result;
    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications,
            username: this.username,
            cartProducts: this.cartProducts
        }
    }

    generateSignature() {
        return this.privateKey.sign(SIGN_VERIFICATION_STRING, SIGN_ENCODING, 'utf8');
    }
}

exports.ClientPalmar = ClientPalmar;