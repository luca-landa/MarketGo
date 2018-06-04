"use strict";

const eventEmitter = require('../event_emitter').eventEmitter;
const Device = require('./device').Device;
const mqtt = require('mqtt');


class Cart extends Device {
    constructor(idx, products, maxQuantity, mqttBrokerUrl, mqttTopicBase) {
        super(idx);
        this.clientIdx = idx;
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

            //TODO refactor put the method in the Device class
            eventEmitter.emit('updateGUIDevices', 'cart');
        }
    }

    removeProduct(product) {
        for (let i = 0; i < this.products.length; i++) {
            let p = this.products[i];
            if (JSON.stringify(p) === JSON.stringify(product)) {
                this.products.splice(i, 1);
                eventEmitter.emit('updateGUIDevices', 'cart');
                return;
            }
        }
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