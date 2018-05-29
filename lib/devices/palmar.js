"use strict";

const eventEmitter = require('./../event_emitter').eventEmitter;
const Device = require("./device").Device;
const mqtt = require('mqtt');


class Palmar extends Device {
    constructor(idx, notifications, mqttBrokerUrl, mqttTopicBase) {
        super(idx);
        this.notifications = notifications || [];
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, mqttTopicBase);
    }

    createMQTTClient(mqttBrokerUrl, mqttTopicBase) {
        const topicsToAudit = ['/staff/action/new', '/staff/action/delete'];

        let client = mqtt.connect(mqttBrokerUrl);

        client.on('connect', () => {
            topicsToAudit.forEach((topic) => {
                client.subscribe(mqttTopicBase + topic);
                console.log(`MQTT: palmar (idx:${this.idx}) subscribing to ${mqttTopicBase + topic}`);
            });
        });

        client.on('message', (topic, message) => {
            console.log(`MQTT: palmar (idx:${this.idx}) received message on ${topic} with content ${message}`);

            if (topic === mqttTopicBase + '/staff/action/new') {
                let notification = JSON.parse(message.toString());
                this.pushNotification(notification);
                eventEmitter.emit('updateGUIDevices', 'staffPalmars');

            } else if (topic === mqttTopicBase + '/staff/action/delete') {
                let notification = JSON.parse(message.toString()).notification;
                this.removeNotification(notification);
                eventEmitter.emit('updateGUIDevices', 'staffPalmars');
            }
        });

        return client;
    }

    pushNotification(notification) {
        if (!this.notifications.includes(notification)) {
            this.notifications.push(notification);
        }
    }

    removeNotification(notification) {
        if(this.notifications.includes(notification)) {
            for(let i = 0; i < this.notifications.length; i++) {
                let n = this.notifications[i];
                if(JSON.stringify(n) === JSON.stringify(notification)) {
                    this.notifications.splice(i, 1);
                    return;
                }
            }
        }
    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications
        }
    }
}

exports.Palmar = Palmar;