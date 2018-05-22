"use strict";

const Device = require("./device").Device;

class StaffPalmar extends Device {
    constructor(idx, pendingActions) {
        super(idx);
        this.pendingActions = pendingActions || [];
    }
}

exports.StaffPalmar = StaffPalmar;