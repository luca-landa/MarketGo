"use strict";

const fs = require('fs');
const http = require('http');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');

class Server {
    constructor(config) {
        this.config = config;
        this.httpServer = this.createHTTPServer();
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

    createHTTPServer() {
        let config = this.config;
        return http.createServer((req, res) => {
            fs.readFile('views/home.html', 'utf8', (err, data) => {
                let pageData = preprocessor.preprocess(data,
                    {
                        webSocketConfig: JSON.stringify({
                          protocol: config['web_socket_protocol'],
                          port: config['server_port']
                        })
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