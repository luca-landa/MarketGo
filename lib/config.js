"use strict";

let fs = require('fs');
exports.config = JSON.parse(
    fs.readFileSync('config/parameters.json', 'utf8')
);