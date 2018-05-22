"use strict";

const Device = require("./device").Device;

class Shelf extends Device {
    constructor(idx, quantity) {
        super(idx);
        this.quantity = quantity;
    }
}

exports.Shelf = Shelf;