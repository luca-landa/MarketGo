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
        this.clientAllergies = [];
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, mqttTopicBase);
        this.productInformationTcpClient = new TcpClient(tcpData.address, tcpData.productInformationRequestPort, null);
        this.clientAllergiesRequestTcpClient = new TcpClient(tcpData.address, tcpData.clientAllergiesRequestPort, this.setClientAllergies, this);

        this.pushNotification({type: 'message', data: `Logged in as ${username}`});
    }

    setClientAllergies() {
        let mqttMsg = {
            event: 'clientAllergiesRequest',
            idx: this.clientIdx
        };

        let callback = (data) => this.clientAllergies = data.allergies;

        this.clientAllergiesRequestTcpClient.sendAndRegisterCallback(mqttMsg, callback, this);
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
            clientIdx: message.clientIdx
        };

        let callback = (productData) => {
            delete productData['_id'];
            delete productData['idx'];

            let notification = {
                type: 'productInformation',
                data: productData
            };

            let warnings = this.checkProductCompatibility(productData);
            if (warnings.length > 0) {
                notification.warnings = warnings;
            }

            this.pushNotification(notification);
        };

        this.productInformationTcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
    }

    checkProductCompatibility(productData) {
        let warnings = [];
        let allergens = productData.data.allergens;

        allergens.forEach((allergen) => {
            if (this.clientAllergies.includes(allergen.toLowerCase())) {
                warnings.push(`It contains ${allergen}`);
            }
        });

        return warnings;
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
        let notificationsTopic = `${mqttTopicBase}/clients/${this.idx}/notifications`;

        let client = mqtt.connect(mqttBrokerUrl);
        client.on('connect', () => {
            client.subscribe(notificationsTopic);
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) subscribing to ${notificationsTopic}`);
        });

        client.on('message', (topic, message) => {
            debug.log(`MQTT: clientPalmar (idx:${this.idx}) received message on ${topic} with content ${message}`);

            if (topic === notificationsTopic) {
                let notification = JSON.parse(message.toString());
                this.pushNotification(notification);
                eventEmitter.emit('updateGUIDevices', 'clientPalmar');
            }
        });

        return client;
    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications,
            username: this.username,
            clientAllergies: this.clientAllergies
        }
    }
}

exports.ClientPalmar = ClientPalmar;