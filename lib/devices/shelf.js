"use strict";

const eventEmitter = require('../event_emitter').eventEmitter;
const Device = require("./device").Device;
const mqtt = require('mqtt');


class Shelf extends Device {
    constructor(idx, quantity, minQuantity, maxQuantity, product, mqttBrokerUrl, mqttTopicBase) {
        super(idx);
        this.minQuantity = minQuantity;
        this.maxQuantity = maxQuantity;
        this.product = product;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl, quantity);
        this.mqttTopicBase = mqttTopicBase;
    }

    createMQTTClient(mqttBrokerUrl, quantity) {
        let client = mqtt.connect(mqttBrokerUrl);

        client.on('connect', () => this.setQuantity(quantity));

        return client;
    }

    getDataClone() {
        return {
            idx: this.idx,
            quantity: this.quantity,
            minQuantity: this.minQuantity,
            maxQuantity: this.maxQuantity,
            product: this.product
        }
    }

    setQuantity(quantity) {
        this.quantity = quantity;

        let mqttMsg = {
            idx: this.idx,
            quantity: this.quantity
        };

        eventEmitter.emit('updateGUIDevices', 'shelves');
        this.mqttClient.publish(this.mqttTopicBase + '/shelves', JSON.stringify(mqttMsg));
    }

    setProduct(product) {
        this.product = product;
    }
}

exports.Shelf = Shelf;