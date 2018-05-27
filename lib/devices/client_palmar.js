"use strict";

const Palmar = require("./palmar").Palmar;

class ClientPalmar extends Palmar {
    constructor(idx, notifications, name) {
        super(idx, notifications);
        this.name = name;
    }

}

exports.ClientPalmar = ClientPalmar;