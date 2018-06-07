"use strict";

const debug = require('../../debug').debug;

const eventEmitter = require('../../event_emitter').eventEmitter;
const Palmar = require("./palmar").Palmar;
const mqtt = require('mqtt');
const TcpClient = require('../../tcp_client').TcpClient;


class ClientPalmar extends Palmar {
    constructor(idx, notifications, username, clientIdx, mqttBrokerUrl, mqttTopicBase, tcpData) {
        super(idx, notifications);
        this.username = username;
        this.clientIdx = clientIdx;
        this.cartProducts = [];
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, mqttTopicBase);
        this.tcpClient = new TcpClient(tcpData.address, tcpData.port);

        this.pushNotification({type: 'message', data: `Logged in as ${username}`});
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
            event: 'productInformationRequest',
            multiple: false,
            idx: message.idx,
            clientIdx: this.clientIdx
        };

        let callback = (message) => {
            let productData = message.productData;

            let notification = {
                type: 'productInformation',
                data: productData,
                warnings: message.warnings || []
            };

            this.pushNotification(notification);
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
        if(this.cartProducts.length === 0) {
            this.pushNotification({type: 'message', data: 'You have no products in your cart!'});
        } else {
            let cartData = this.getCartData();

            let tcpMsg = {
                event: 'paymentRequest',
                data: {
                    clientIdx: this.clientIdx,
                    cartData: cartData
                }
            };


            let callback = (data) => {
                debug.log('TCP client paymentRequest: received back data');

                // this.pushNotification(data.notification);
                // eventEmitter.emit('purchaseComplete');
            };

            this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
        }

    }

    pushNotification(message) {
        super.pushNotification(message);
        eventEmitter.emit('updateGUIDevices', 'clientPalmar');
    }

    removeNotification(message) {
        super.removeNotification(message);
        eventEmitter.emit('updateGUIDevices', 'clientPalmar');
    }

    createMQTTClient(mqttBrokerUrl, mqttTopicBase) {
        let productAddedTopic = `${mqttTopicBase}/clients/${this.idx}/productAdded`;
        let productRemovedTopic = `${mqttTopicBase}/clients/${this.idx}/productRemoved`;

        let client = mqtt.connect(mqttBrokerUrl);
        client.on('connect', () => {
            client.subscribe(productAddedTopic);
            client.subscribe(productRemovedTopic);
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) subscribing to ${productAddedTopic}`);
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) subscribing to ${productRemovedTopic}`);
        });

        client.on('message', (topic, data) => {
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) received message on ${topic} with content ${data}`);

            let message = JSON.parse(data.toString());

            if (topic === productAddedTopic) {
                this.cartProducts.push(message.product);
                this.pushNotification(message.notification);
                eventEmitter.emit('updateGUIDevices', 'clientPalmar');
            } else if (topic === productRemovedTopic) {
                let index = this.cartProducts.find((product) => product.idx === message.productIdx);
                if (index !== -1) {
                    this.cartProducts.splice(index, 1);
                }
                eventEmitter.emit('updateGUIDevices', 'clientPalmar');
            }
        });

        return client;
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
}

exports.ClientPalmar = ClientPalmar;