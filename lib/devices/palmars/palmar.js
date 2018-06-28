"use strict";

const Device = require("../device").Device;


class Palmar extends Device {
    constructor(idx, type, notifications) {
        super(idx, type);
        this.notifications = notifications || [];
    }

    pushNotification(notification) {
        this.removeNotification(notification);
        this.notifications.push(notification);
        this.updateGUI();
    }

    removeNotification(notification) {
        for (let i = 0; i < this.notifications.length; i++) {
            let n = this.notifications[i];
            if (JSON.stringify(n) === JSON.stringify(notification)) {
                this.notifications.splice(i, 1);
                this.updateGUI();
                return;
            }
        }
    }
}

exports.Palmar = Palmar;