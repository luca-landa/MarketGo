"use strict";

const config = require('./lib/config').config;
const Server = require('./lib/server').Server;

if(config['seed_db_on_startup']) {
    require('./seed_marketgo_db').seed(config['mongodb_url']);
    console.log('MarketGo db seeded');
}

new Server(config);