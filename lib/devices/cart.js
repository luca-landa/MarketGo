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
        this.products.push(product);
        eventEmitter.emit('updateGUIDevices', 'cart');
    }

    removeProduct(product) {
        for (let i = 0; i < this.products.length; i++) {
            let p = this.products[i];
            if (JSON.stringify(p) === JSON.stringify(product)) {
                this.products.splice(i, 1);
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