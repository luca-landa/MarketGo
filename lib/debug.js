"use strict";

const config = require('./config').config;

const debugMode = config['debug_mode'];

const debug = {
    log(msg) {
        if (debugMode) {
            console.log(msg);
        }
    }
};

exports.debug = debug;