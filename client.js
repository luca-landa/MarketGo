"use strict";

const config = require('./lib/config').config;
const Server = require('./lib/server').Server;

new Server(config);