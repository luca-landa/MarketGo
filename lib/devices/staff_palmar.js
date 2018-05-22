"use strict";

const Device = require("./device").Device;

class StaffPalmar extends Device {
    constructor(idx, notifications) {
        super(idx);
        this.notifications = notifications || [];
    }
}

exports.StaffPalmar = StaffPalmar;