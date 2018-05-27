"use strict";

const config = require('./lib/config').config;
const Server = require('./lib/server').Server;

require('./lib/javascript_compatibility').setup();

new Server(config);