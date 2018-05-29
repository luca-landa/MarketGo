"use strict";

class Device {
    constructor(idx) {
        this.idx = idx;
    }

    getDataClone() {
        throw new Error('not implemented');
    }
}

exports.Device = Device;