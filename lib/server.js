"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');


class Server {
    constructor(config) {
        this.config = config;
        this.devices = this.createDevices();
        this.preprocessorParams = {
            webSocketConfig: JSON.stringify({
                protocol: config['web_socket_protocol'],
                port: config['server_port']
            }),
            devices: JSON.stringify(this.devices)
        };
        this.httpServer = this.createHTTPServer(this.preprocessorParams);
    }

    createDevices() {
        return {
            shelves: this.createShelves()
        }
    }

    createShelves() {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 7;

        return devicesIdxs.map((idx) => {
            return {
                idx: idx,
                quantity: defaultQuantity
            }
        });
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

    createHTTPServer(preprocessorParams) {
        return http.createServer((req, res) => {
            let reqPath = url.parse(req.url).pathname;
            console.log('received: ' + reqPath);

            if (reqPath === '/' || reqPath === '/home') {
                fs.readFile('views/home.html', 'utf8', (err, data) => {
                    let pageData = preprocessor.preprocess(data, preprocessorParams);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(pageData);
                    res.end();
                });
            } else if (this.permittedFileReq(reqPath)) {
                fs.readFile('public' + reqPath, (err, data) => {
                    if (err) {
                        console.log('invalid request received: ' + reqPath);
                        res.writeHead(500);
                        res.end();
                    } else {
                        console.log('serving: public' + reqPath);
                        let pageData = this.filePreprocessRequired(reqPath) ?
                            preprocessor.preprocess(data, preprocessorParams) : data;

                        res.writeHead(200);
                        res.write(pageData);
                        res.end();
                    }
                });
            } else {
                console.log('invalid request path: ' + reqPath);
                this.showCats(res);
            }
        });
    }

    filePreprocessRequired(filePath) {
        let required = false;
        let filesToPreprocess = this.config['files_to_preprocess'];
        for (let i in filesToPreprocess) {
            if (filesToPreprocess[i] === filePath) {
                required = true;
            }
        }
        return required;
    }

    permittedFileReq(filePath) {
        let permitted = false;
        let permittedFiles = this.config['permitted_file_requests'];
        for (let i in permittedFiles) {
            if (permittedFiles[i] === filePath) {
                permitted = true;
            }
        }
        return permitted;
    }

    showCats(res) {
        res.writeHead(301, {location: 'https://http.cat/404'});
        res.end();
    }
}

exports.Server = Server;