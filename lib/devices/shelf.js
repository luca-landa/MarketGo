"use strict";

const Device = require("./device").Device;
const mqtt = require('mqtt');


class Shelf extends Device {
    constructor(idx, quantity, minQuantity, maxQuantity, product, mqttBrokerUrl, mqttTopicBase) {
        super(idx);
        this.quantity = quantity;
        this.minQuantity = minQuantity;
        this.maxQuantity = maxQuantity;
        this.product = product;
        this.mqttClient = this.createMQTTClient(mqttBrokerUrl);
        this.mqttTopicBase = mqttTopicBase;
    }

    createMQTTClient(mqttBrokerUrl) {
        return mqtt.connect(mqttBrokerUrl);
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

        this.mqttClient.publish(this.mqttTopicBase + '/shelves', JSON.stringify(mqttMsg));
    }

    setProduct(product) {
        this.product = product;
    }
}

exports.Shelf = Shelf;