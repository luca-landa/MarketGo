"use strict";

const Palmar = require("./palmar").Palmar;

//TODO split hierarchy in (clientPalmar, staffPalmar) < palmar
//staffpalmar has mqttClient, clientPalmar has not!

class ClientPalmar extends Palmar {
    constructor(idx, notifications, username) {
        super(idx, notifications);
        this.username = username;

        this.pushNotification({type: 'message', data: `Logged in as ${username}`});
    }

    createMQTTClient() {
        return null;
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