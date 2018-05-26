"use strict";

const Device = require("./device").Device;

class Shelf extends Device {
    constructor(idx, quantity, product) {
        super(idx);
        this.quantity = quantity;
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