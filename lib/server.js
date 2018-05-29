"use strict";

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');
const mqtt = require('mqtt');

const TcpClient = require('./tcp_client').TcpClient;
const DevicesGroup = require('./devices/devices_group').DevicesGroup;
const eventEmitter = require('./event_emitter').eventEmitter;


class Server {
    constructor(config) {
        this.config = config;
        this.httpServer = this.createHTTPServer();
        this.webSocketServer = this.createWsServer();
        this.webSocketConnections = [];
        this.devicesGroup = new DevicesGroup(this.webSocketConnections, this.config['mqtt_broker_url'], this.config['mqtt_topic_base']);
        this.registerOnEventEmitter();
        this.tcpClient = new TcpClient('127.0.0.1', config['tcp_port'], this.updateProducts, this);
        this.mqttClient = this.createMQTTClient();
    }

    registerOnEventEmitter() {
        eventEmitter.on('updateGUIDevices', (deviceType) => this.devicesGroup.updateGUIDevices(deviceType));
    }

    updateProducts() {
        let productsIdxs = this.devicesGroup.devices.products.map((product) => product.idx);

        let message = {
            event: 'productInformationRequest',
            multiple: true,
            idx: productsIdxs
        };

        let callback = (data) => {
            let productsData = data.map((product) => ({
                    idx: product.idx,
                    name: product.name
                }
            ));
            this.devicesGroup.updateDevice('products', productsData, 'refreshData');
        };

        this.tcpClient.sendAndRegisterCallback(message, callback, this);
    }

    createMQTTClient() {
        return mqtt.connect(this.config["mqtt_broker_url"]);
    }

    createWsServer() {
        let wsServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        wsServer.on('request', (request) => {
            let connection = request.accept(this.config['web_socket_protocol'], request.origin);
            this.webSocketConnections.push(connection);
            console.log('WebSocket: connection accepted');
            connection.on('message', (message) => this.handleWebSocketMessage(connection, message));
        });

        return wsServer;
    }

    handleWebSocketMessage(connection, wsMessage) {
        let mqttTopicBase = this.config['mqtt_topic_base'];

        if (wsMessage.type === 'utf8') {
            console.log('WebSocket msg from client: ' + wsMessage.utf8Data);
            try {
                let message = JSON.parse(wsMessage.utf8Data);
                if (message.event === 'deviceStatusUpdate') {

                    if (message.deviceType === 'shelves') {
                        this.devicesGroup.updateDevice(message.deviceType, message);

                    } else if (message.deviceType === 'clientPalmar') {

                        if (message.action === 'removeNotification') {
                            this.devicesGroup.updateDevice(message.deviceType, message.notification, message.action);
                        }
                    }

                } else if (message.event === 'completedAction') {
                    let palmar = this.devicesGroup.devices.staffPalmars.find((device) => device.idx === message.idx);
                    palmar.completedActionClick(message);

                } else if (message.event === 'clientHelpRequest') {
                    let mqttMsg = {
                        idx: message.idx,
                        name: message.username
                    };

                    this.mqttClient.publish(mqttTopicBase + '/client/action/help', JSON.stringify(mqttMsg));
                } else if (message.event === 'productInformationRequest') {

                    let tcpMsg = {
                        event: 'productInformationRequest',
                        multiple: false,
                        idx: message.idx,
                        clientIdx: message.clientIdx
                    };

                    let callback = (productData) => {
                        delete productData['_id'];
                        delete productData['idx'];

                        let notification = {
                            type: 'productInfo',
                            data: productData
                        };

                        this.devicesGroup.updateDevice('clientPalmar', notification, 'addData');
                    };

                    this.tcpClient.sendAndRegisterCallback(tcpMsg, callback, this);
                }

            } catch (err) {
                console.log(wsMessage);
                throw err;
                // console.log('invalid message received via websocket');
            }

        }
    }

    createHTTPServer() {
        let server = http.createServer((req, res) => {
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

        server.listen(this.config['server_port']);
        console.log('listening on ' + this.config['server_port']);

        return server;
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

    getPreprocessorParams() {
        return {
            webSocketConfig: JSON.stringify({
                protocol: this.config['web_socket_protocol'],
                port: this.config['server_port']
            }),
            devices: JSON.stringify(this.devicesGroup.getDevicesDataClone())
        };
    }

}

exports.Server = Server;