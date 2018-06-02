"use strict";

const eventEmitter = require('../event_emitter').eventEmitter;
const Device = require('./device').Device;


class Cart extends Device {
    constructor(idx, products, maxQuantity) {
        super(idx);
        this.products = products || [];
        this.maxQuantity = maxQuantity || 6;
    }

    addProduct(product) {
        if (this.products.length < this.maxQuantity) {
            this.products.push(product);
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
            products: this.products
        }
    }
}


exports.Cart = Cart;