"use strict";

const fs = require('fs');
const http = require('http');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');

class Server {
    constructor(config) {
        this.config = config;
        this.devices = this.createDevices();
        this.httpServer = this.createHTTPServer(this.config, this.devices);
    }

    start() {
        this.wsServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        this.wsServer.on('request', (request) => {
            let connection = request.accept(this.config['web_socket_protocol'], request.origin);
            console.log('connection accepted');
            connection.on('message', (message) => {
                if (message.type === 'utf8') {
                    console.log('Received message: ' + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                }
            });
        });

        this.httpServer.listen(this.config['server_port']);
        console.log('listening on ' + this.config['server_port']);
    }

    createDevices() {
        return {
            shelves: this.createShelves()
        }
    }

    createShelves() {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 5;

        let result = {};
        devicesIdxs.forEach((idx) => {
            result[idx] = {
                quantity: defaultQuantity
            }
        });

        return result;
    }

    createHTTPServer(config, devices) {
        return http.createServer((req, res) => {
            fs.readFile('views/home.html', 'utf8', (err, data) => {
                let pageData = preprocessor.preprocess(data,
                    {
                        webSocketConfig: JSON.stringify({
                          protocol: config['web_socket_protocol'],
                          port: config['server_port']
                        }),
                        devices: JSON.stringify(devices)
                    }
                );
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(pageData);
                res.end();
            });
        });
    }
}

exports.Server = Server;