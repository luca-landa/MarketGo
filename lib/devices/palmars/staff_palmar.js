"use strict";

const debug = require('../../debug').debug;

const eventEmitter = require('../../event_emitter').eventEmitter;
const Palmar = require("./palmar").Palmar;
const mqtt = require('mqtt');


class StaffPalmar extends Palmar {
    constructor(idx, notifications, mqttBrokerUrl, mqttTopicBase) {
        super(idx, notifications);
        this.mqttTopicBase = mqttTopicBase;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, mqttTopicBase);
    }

    completedActionClick(message) {
        let mqttMsg = {
            idx: this.idx,
            action: message.action
        };

        this.mqttClient.publish(this.mqttTopicBase + '/staff/action/completed', JSON.stringify(mqttMsg));
    }

    createMQTTClient(mqttBrokerUrl, mqttTopicBase) {
        const topicsToAudit = ['/staff/newAction', '/staff/deleteAction'];

        let client = mqtt.connect(mqttBrokerUrl);

        client.on('connect', () => {
            topicsToAudit.forEach((topic) => {
                client.subscribe(mqttTopicBase + topic);
                debug.log(`MQTT: palmar (idx:${this.idx}) subscribing to ${mqttTopicBase + topic}`);
            });
        });

        client.on('message', (topic, message) => {
            debug.log(`MQTT: palmar (idx:${this.idx}) received message on ${topic} with content ${message}`);

            if (topic === mqttTopicBase + '/staff/newAction') {
                let notification = JSON.parse(message.toString());
                this.pushNotification(notification);
                eventEmitter.emit('updateGUIDevices', 'staffPalmars');

            } else if (topic === mqttTopicBase + '/staff/deleteAction') {
                let notification = JSON.parse(message.toString()).notification;
                this.removeNotification(notification);
                eventEmitter.emit('updateGUIDevices', 'staffPalmars');
            }
        });

        return client;
    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications
        }
    }
}

exports.StaffPalmar = StaffPalmar;