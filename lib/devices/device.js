"use strict";

const eventEmitter = require('../event_emitter').eventEmitter;


class Device {
    constructor(idx) {
        this.idx = idx;
        this.type = undefined;
    }

    updateGUI(event = 'updateGUIDevices') {
        eventEmitter.emit(event, this.type);
    }

    getDataClone() {
        throw new Error('not implemented');
    }
}

exports.Device = Device;