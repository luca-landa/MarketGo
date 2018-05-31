"use strict";

const Device = require("../device").Device;


class Palmar extends Device {
    constructor(idx, notifications) {
        super(idx);
        this.notifications = notifications || [];
    }

    pushNotification(notification) {
        let included = false;
        let notificationStringified = JSON.stringify(notification);

        this.notifications.forEach((_notification) => {
            if (JSON.stringify(_notification) === notificationStringified) {
                included = true;
            }
        });

        if (!included) {
            this.notifications.push(notification);
        }
    }

    removeNotification(notification) {
        for (let i = 0; i < this.notifications.length; i++) {
            let n = this.notifications[i];
            if (JSON.stringify(n) === JSON.stringify(notification)) {
                this.notifications.splice(i, 1);
                return;
            }
        }
    }
}

exports.Palmar = Palmar;