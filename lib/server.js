"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');
const mqtt = require('mqtt');
const net = require('net');

const TcpClient = require('./tcp_client').TcpClient;

const Shelf = require("./devices/shelf").Shelf;
const StaffPalmar = require("./devices/staff_palmar").StaffPalmar;

class Server {
    constructor(config) {
        this.config = config;
        this.devices = this.createDevices();
        this.tcpClient = new TcpClient('127.0.0.1', config['tcp_port'], this.updateProducts, this);
        this.httpServer = this.createHTTPServer();
        this.mqttClient = this.createMQTTClient();
        this.webSocketServer = null;
        this.webSocketConnections = [];
    }

    updateProducts() {
        let productsIdxs = this.devices.products.map((product) => product.idx);

        let message = {
            event: 'productInformationRequest',
            multiple: true,
            idx: productsIdxs
        };

        let callback = (data) => {
            let productsData = data.map((product) =>
                ({
                    idx: product.idx,
                    name: product.name
                })
            );
            this.updateDevice('products', productsData, 'refreshData');
        };

        this.tcpClient.sendAndRegisterCallback(message, callback, this);
    }

    createMQTTClient() {
        let topicsToAudit = ['/staff/action/new', '/staff/action/delete'];
        let client = mqtt.connect(this.config["mqtt_broker_url"]);
        let mqttTopicBase = this.config['mqtt_topic_base'];

        client.on('connect', () => {
            topicsToAudit.forEach((topic) => {
                client.subscribe(mqttTopicBase + topic);
                console.log('MQTT subscribing on ' + mqttTopicBase + topic);
            });
        });

        client.on('message', (topic, message) => {
            console.log(`MQTT on topic ${topic} with message ${message}`);

            if (topic === mqttTopicBase + '/staff/action/new') {
                let notification = JSON.parse(message);
                this.updateDevice('staffPalmars', notification, 'addData');

            } else if (topic === mqttTopicBase + '/staff/action/delete') {
                let notification = JSON.parse(message).notification;
                this.updateDevice('staffPalmars', notification, 'removeData');
            }
        });

        return client;
    }

    createDevices() {
        return {
            shelves: this.createShelves(),
            staffPalmars: this.createStaffPalmars(),
            clientPalmar: {idx: 0, name: 'Pippo'},
            products: [{idx: 0}, {idx: 1}, {idx: 2}]
        }
    }

    createShelves() {
        let devicesIdxs = [0, 1];
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
        let mqttTopicBase = this.config['mqtt_topic_base'];
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
                    this.mqttClient.publish(mqttTopicBase + '/' + message.deviceType, JSON.stringify(updateData));

                } else if (message.event === 'completedAction') {
                    let mqttMsg = {
                        idx: message.idx,
                        action: message.action
                    };

                    this.mqttClient.publish(mqttTopicBase + '/staff/action/completed', JSON.stringify(mqttMsg));

                } else if (message.event === 'clientHelpRequest') {
                    let mqttMsg = {
                        idx: message.idx,
                        name: message.name
                    };

                    this.mqttClient.publish(mqttTopicBase + '/client/action/help', JSON.stringify(mqttMsg));
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
        const permittedDeviceTypes = ['shelves', 'staffPalmars', 'products'];

        if (permittedDeviceTypes.includes(deviceType)) {
            if (deviceType === 'shelves') {
                this.devices[deviceType].find((device) => device.idx === data.idx)
                    .setQuantity(data.quantity);

            } else if (deviceType === 'staffPalmars') {
                if (updateType === 'addData') {
                    this.devices[deviceType].forEach((device) => device.pushNotification(data));

                } else if (updateType === 'removeData') {
                    this.devices[deviceType].forEach((device) => device.removeNotification(data));
                }

            } else if (deviceType === 'products') {

                if(updateType === 'refreshData') {
                    this.devices[deviceType] = data;
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