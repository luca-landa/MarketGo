"use strict";

const debug = require('../../debug').debug;

const eventEmitter = require('../../event_emitter').eventEmitter;
const Palmar = require("./palmar").Palmar;
const mqtt = require('mqtt');
const TcpClient = require('../../tcp_client').TcpClient;


class ClientPalmar extends Palmar {
    constructor(idx, notifications, username, mqttBrokerUrl, mqttTopicBase, tcpAddress) {
        super(idx, notifications);
        this.username = username;
        this.clientIdx = 0; //TODO get clientIdx as a constructor parameter
        this.clientAllergies = [];
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl);
        //TODO pass ports as parameters
        this.productInformationTcpClient = new TcpClient(tcpAddress, 1337, null);
        this.clientAllergiesRequestTcpClient = new TcpClient(tcpAddress, 1338, this.setClientAllergies, this);

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
                type: 'productInfo',
                data: productData
            };

            let warnings = this.checkProductCompatibility(productData);
            if(warnings.length > 0) {
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
            if(this.clientAllergies.includes(allergen.toLowerCase())) {
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

    createMQTTClient(mqttBrokerUrl) {
        return mqtt.connect(mqttBrokerUrl);
    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications,
            username: this.username
        }
    }
}

exports.ClientPalmar = ClientPalmar;