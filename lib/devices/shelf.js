"use strict";

const Device = require("./device").Device;

class Shelf extends Device {
    constructor(idx, quantity, minQuantity, maxQuantity, product) {
        super(idx);
        this.quantity = quantity;
        this.minQuantity = minQuantity;
        this.maxQuantity = maxQuantity;
        this.product = product;
    }

    setQuantity(quantity) {
        this.quantity = quantity;
    }

    setProduct(product) {
        this.product = product;
    }
}

exports.Shelf = Shelf;