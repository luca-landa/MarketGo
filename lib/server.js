"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');
const mqtt = require('mqtt');

const Shelf = require("./devices/shelf").Shelf;
const StaffPalmar = require("./devices/staff_palmar").StaffPalmar;

const MQTT_TOPIC_BASE = 'MarketGo';


class Server {
    constructor(config) {
        this.config = config;
        this.devices = this.createDevices();
        this.httpServer = this.createHTTPServer();
        this.mqttClient = this.createMQTTClient();
        this.webSocketServer = null;
        this.webSocketConnections = [];
    }

    createMQTTClient() {
        let topicsToAudit = ['/staff/action/new', '/staff/action/delete'];
        let client = mqtt.connect(this.config["mqtt_broker_url"]);

        client.on('connect', () => {
            topicsToAudit.forEach((topic) => {
                client.subscribe(MQTT_TOPIC_BASE + topic);
                console.log('MQTT subscribing on ' + MQTT_TOPIC_BASE + topic);
            });
        });

        client.on('message', (topic, message) => {
            console.log(`MQTT on topic ${topic} with message ${message}`);

            if (topic === MQTT_TOPIC_BASE + '/staff/action/new') {
                let notification = JSON.parse(message);
                this.updateDevice('staffPalmars', notification, 'addData');

            } else if (topic === MQTT_TOPIC_BASE + '/staff/action/delete') {
                let notification = JSON.parse(message).notification;
                this.updateDevice('staffPalmars', notification, 'removeData');
            }
        });

        return client;
    }

    createDevices() {
        return {
            shelves: this.createShelves(),
            staffPalmars: this.createStaffPalmars()
        }
    }

    createShelves() {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 2;

        return devicesIdxs.map((idx) => {
            return new Shelf(idx, defaultQuantity);
        });
    }

    createStaffPalmars() {
        let devicesIdxs = [0, 1];

        return devicesIdxs.map((idx) => {
            return new StaffPalmar(idx, []);
        });
    }

    start() {
        this.webSocketServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        this.webSocketServer.on('request', (request) => {
            let connection = request.accept(this.config['web_socket_protocol'], request.origin);
            this.webSocketConnections.push(connection);
            console.log('WebSocket: connection accepted');
            connection.on('message', (message) => this.handleWebSocketMessage(connection, message));
        });

        this.httpServer.listen(this.config['server_port']);
        console.log('listening on ' + this.config['server_port']);
    }

    handleWebSocketMessage(connection, wsMessage) {
        if (wsMessage.type === 'utf8') {
            console.log('WebSocket msg from client: ' + wsMessage.utf8Data);
            try {
                let message = JSON.parse(wsMessage.utf8Data);
                if (message.event === 'deviceStatusUpdate') {
                    let updateData = {
                        idx: message.idx,
                        quantity: message.quantity
                    };

                    this.updateDevice(message.deviceType, updateData);
                    this.mqttClient.publish(MQTT_TOPIC_BASE + '/' + message.deviceType, JSON.stringify(updateData));
                } else if (message.event === 'setDoneAction') {
                    let mqttMsg = {
                        idx: message.idx,
                        action: message.action
                    };

                    this.mqttClient.publish(MQTT_TOPIC_BASE + '/staff/action/completed', JSON.stringify(mqttMsg));
                }
            } catch (err) {
                console.log('invalid message received via websocket');
            }

        }
    }

    createHTTPServer() {
        return http.createServer((req, res) => {
            let preprocessorParams = this.getPreprocessorParams();
            let reqPath = url.parse(req.url).pathname;
            console.log('HTTP request received: ' + reqPath);

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
                        console.log('Invalid HTTP request received: ' + reqPath);
                        res.writeHead(500);
                        res.end();
                    } else {
                        console.log('HTTP serving: public' + reqPath);
                        let pageData = this.filePreprocessRequired(reqPath) ?
                            preprocessor.preprocess(data, preprocessorParams) : data;

                        res.writeHead(200);
                        res.write(pageData);
                        res.end();
                    }
                });
            } else {
                console.log('HTTP invalid request path: ' + reqPath);
                this.showCats(res);
            }
        });
    }

    filePreprocessRequired(filePath) {
        return this.config['files_to_preprocess'].includes(filePath);
    }

    permittedFileReq(filePath) {
        return this.config['permitted_file_requests'].includes(filePath);
    }

    showCats(res) {
        res.writeHead(301, {location: 'https://http.cat/404'});
        res.end();
    }

    updateDevice(deviceType, data, updateType) {
        const permittedDeviceTypes = ['shelves', 'staffPalmars'];

        if (permittedDeviceTypes.includes(deviceType)) {
            let devices = this.devices[deviceType];

            if (deviceType === 'shelves') {
                devices.find((device) => device.idx === data.idx)
                    .setQuantity(data.quantity);

            } else if (deviceType === 'staffPalmars') {
                if (updateType === 'addData') {
                    devices.forEach((device) => device.pushNotification(data));

                } else if (updateType === 'removeData') {
                    devices.forEach((device) => device.removeNotification(data));
                }

            }

            this.sendWebSocketMessage(JSON.stringify({
                event: 'devicesUpdate',
                deviceType: deviceType,
                devices: this.devices[deviceType]
            }));

        } else {
            console.log(`unknown device type: "${deviceType}"`);
        }

    }

    getPreprocessorParams() {
        return {
            webSocketConfig: JSON.stringify({
                protocol: this.config['web_socket_protocol'],
                port: this.config['server_port']
            }),
            devices: JSON.stringify(this.devices)
        };
    }

    sendWebSocketMessage(string) {
        this.webSocketConnections.forEach((connection) => {
            try {
                connection.sendUTF(string);
            } catch (err) {

            }
        });
    }
}

exports.Server = Server;