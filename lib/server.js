"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');
const mqtt = require('mqtt');

const Shelf = require("./shelf").Shelf;
const StaffPalmar = require("./staff_palmar").StaffPalmar;

const MQTT_TOPIC_BASE = 'MarketGo';


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
        this.mqttClient = mqtt.connect(this.config["mqtt_broker_url"]);
        this.webSocketServer = null;
    }

    createDevices() {
        return {
            shelves: this.createShelves(),
            staffPalmars: this.createStaffPalmars()
        }
    }

    createShelves() {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 7;

        return devicesIdxs.map((idx) => {
            return new Shelf(idx, defaultQuantity);
        });
    }

    createStaffPalmars() {
        // let devicesIdxs = [0, 1, 2];
        let devicesIdxs = [0];

        return devicesIdxs.map((idx) => {
            return new StaffPalmar(idx);
        });
    }

    start() {
        this.webSocketServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        this.webSocketServer.on('request', (request) => {
            let connection = request.accept(this.config['web_socket_protocol'], request.origin);
            console.log('connection accepted');
            connection.on('message', (message) => this.handleWebSocketMessage(connection, message));
        });

        this.httpServer.listen(this.config['server_port']);
        console.log('listening on ' + this.config['server_port']);
    }

    handleWebSocketMessage(connection, wsMessage) {
        if (wsMessage.type === 'utf8') {
            console.log('Received message: ' + wsMessage.utf8Data);
            let message = JSON.parse(wsMessage.utf8Data);
            if(message.event === 'deviceStatusUpdate') {
                let mqttMessage = JSON.stringify({
                    idx: message.idx,
                    quantity: message.quantity
                });
                this.mqttClient.publish(MQTT_TOPIC_BASE + '/' + message.deviceType, mqttMessage);
            }
        }
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