"use strict";

const Device = require("./device").Device;
const mqtt = require('mqtt');


class Shelf extends Device {
    constructor(idx, quantity, product, mqttBrokerUrl, mqttTopicBase) {
        super(idx, 'shelves');
        this.minQuantity = 0;
        this.maxQuantity = 6;
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
        this.oldQuantity = this.quantity;
        this.quantity = quantity;

        let mqttMsg = {
            idx: this.idx,
            oldQuantity: this.oldQuantity,
            quantity: this.quantity
        };

        this.updateGUI();
        this.mqttClient.publish(this.mqttTopicBase + '/shelves', JSON.stringify(mqttMsg));
    }

    setProduct(product) {
        this.product = product;
    }
}

exports.Shelf = Shelf;