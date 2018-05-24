"use strict";

const net = require('net');

let msg = JSON.stringify({event: 'productInformationRequest', idx: 0});

let client = new net.Socket();
client.connect(1337, '127.0.0.1', () => client.write(msg + "\n"));