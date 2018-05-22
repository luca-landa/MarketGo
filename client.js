"use strict";

const config = require('./lib/config').config;
const Server = require('./lib/server').Server;

require('./lib/retrocompatibility').setup();

new Server(config).start();