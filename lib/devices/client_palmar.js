"use strict";

const Palmar = require("./palmar").Palmar;

class ClientPalmar extends Palmar {
    constructor(idx, notifications, username) {
        super(idx, notifications);
        this.username = username;

        this.pushNotification({type: 'message', data: `Logged in as ${username}`});

    }

    getDataClone() {
        return {
            idx: this.idx,
            notifications: this.notifications,
            username: this.username
        }
    }

}

exports.ClientPalmar = ClientPalmar;