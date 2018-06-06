"use strict";

const mqtt = require('mqtt');
const net = require('net');

const debug = require('../debug').debug;
const eventEmitter = require('../event_emitter').eventEmitter;
const Device = require('./device').Device;

class Cart extends Device {
    constructor(idx, products, maxQuantity, mqttBrokerUrl, mqttTopicBase, httpPort) {
        super(idx);
        this.clientIdx = idx;
        this.products = products || [];
        this.maxQuantity = maxQuantity || 6;
        this.mqttClient = mqtt.connect(mqttBrokerUrl);
        this.mqttTopicBase = mqttTopicBase;
        this.tcpServer = this.createTcpServer(httpPort);
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

                let topic = `${this.mqttTopicBase}/clients/${this.clientIdx}/productRemoved`;
                let msg = {productIdx: product.idx};
                this.mqttClient.publish(topic, JSON.stringify(msg));

                eventEmitter.emit('updateGUIDevices', 'cart');
                return;
            }
        }
    }

    createTcpServer() {
        net.createServer((socket) => {
            socket.on('data', (data) => {
                debug.log('TCP - cart received: ' + data.toString());

                let msg = JSON.parse(data.toString());
                if(msg.type === 'productsList') {
                    let response = {};
                    this.products.forEach((product) => {
                        if(response[product.idx] == null) {
                            response[product.idx] = 0;
                        }

                        response[product.idx] += 1;
                    });
                    debug.log('TCP - cart sending ' + JSON.stringify(response));
                    socket.write(JSON.stringify(response));
                }

            });
        }).listen(1350);
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