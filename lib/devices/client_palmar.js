"use strict";

const Palmar = require("./palmar").Palmar;

class ClientPalmar extends Palmar {
    constructor(idx, notifications, username) {
        super(idx, notifications);
        this.username = username;

        this.pushNotification({message: `Logged in as ${username}`});
    }

}

exports.ClientPalmar = ClientPalmar;