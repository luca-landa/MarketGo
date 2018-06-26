"use strict";

const mqtt = require('mqtt');
const Device = require('./device').Device;


class Cart extends Device {
    constructor(idx, clientIdx, products, maxQuantity, mqttBrokerUrl, mqttTopicBase) {
        super(idx);
        this.type = 'cart';
        this.clientIdx = clientIdx;
        this.products = products || [];
        this.maxQuantity = maxQuantity || 6;
        this.mqttClient = mqtt.connect(mqttBrokerUrl);
        this.mqttTopicBase = mqttTopicBase;
    }

    addProduct(product) {
        if (this.products.length < this.maxQuantity) {
            this.products.push(product);
            let topic = `${this.mqttTopicBase}/carts/productAdded`;
            let msg = {productIdx: product.idx, clientIdx: this.clientIdx};
            this.mqttClient.publish(topic, JSON.stringify(msg));

            this.updateGUI();
        }
    }

    removeProduct(product) {
        for (let i = 0; i < this.products.length; i++) {
            let p = this.products[i];
            if (JSON.stringify(p) === JSON.stringify(product)) {
                this.products.splice(i, 1);

                let topic = `${this.mqttTopicBase}/clients/${this.clientIdx}/productRemoved`;
                let msg = {productIdx: product.idx};
                this.mqttClient.publish(topic, JSON.stringify(msg));

                this.updateGUI();
                return;
            }
        }
    }

    clearProducts() {
        this.products = [];
        this.updateGUI();
    }

    getDataClone() {
        return {
            idx: this.idx,
            products: this.products,
            maxQuantity: this.maxQuantity
        }
    }
}


exports.Cart = Cart;