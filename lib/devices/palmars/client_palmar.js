"use strict";

const eventEmitter = require('../../event_emitter').eventEmitter;
const Palmar = require("./palmar").Palmar;
const mqtt = require('mqtt');
const TcpClient = require('../../tcp_client').TcpClient;


class ClientPalmar extends Palmar {
    constructor(idx, notifications, username, mqttBrokerUrl, mqttTopicBase, tcpAddress, tcpPort) {
        super(idx, notifications);
        this.username = username;
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl);
        this.tcpClient = new TcpClient(tcpAddress, tcpPort, null, this);

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
            clientIdx: message.clientIdx
        };

        let callback = (productData) => {
            delete productData['_id'];
            delete productData['idx'];

            let notification = {
                type: 'productInfo',
                data: productData
            };

            this.pushNotification(notification);
        };

        this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
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