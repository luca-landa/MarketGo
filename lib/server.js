"use strict";

const debug = require('./debug').debug;

const fs = require('fs');
const http = require('http');
const url = require('url');
const WebSocketServer = require('websocket').server;
const preprocessor = require('preprocess');

const TcpClient = require('./tcp_client').TcpClient;
const DevicesGroup = require('./devices/devices_group').DevicesGroup;
const eventEmitter = require('./event_emitter').eventEmitter;


class Server {
    constructor(config) {
        this.config = config;
        this.httpServer = this.createHTTPServer();
        this.webSocketServer = this.createWsServer();
        this.webSocketConnections = [];
        this.devicesGroup = new DevicesGroup(this.webSocketConnections,
            this.config['mqtt_broker_url'], this.config['mqtt_topic_base'], this.config['default_client_idx']);
        this.registerOnEventEmitter();
        this.tcpClient = new TcpClient('127.0.0.1', config['tcp_port'], this.updateProducts, this);
    }

    updateProducts() {
        let productsIdxs = this.devicesGroup.devices.products.map((product) => product.idx);

        let message = {
            event: 'productInformationRequest',
            multiple: true,
            idx: productsIdxs
        };

        let callback = (data) => {
            let products = data.productData;
            products.forEach((product) => {
                delete product.price;
            });
            this.devicesGroup.updateStaticDevice('products', {products: products, action: 'refreshData'});
        };

        this.tcpClient.sendAndRegisterCallback(message, callback, this);
    }

    handleWebSocketMessage(connection, wsMessage) {
        if (wsMessage.type === 'utf8') {
            debug.log('WebSocket msg from client: ' + wsMessage.utf8Data);
            try {
                let message = JSON.parse(wsMessage.utf8Data);
                this.devicesGroup.updateDevice(message);
            } catch (err) {
                debug.log(`Error thrown on received msg via websocket: ${wsMessage.utf8Data}`);
            }

        }
    }

    createHTTPServer() {
        let server = http.createServer((req, res) => {
            let preprocessorParams = this.getPreprocessorParams();
            let reqPath = url.parse(req.url).pathname;
            debug.log('HTTP request received: ' + reqPath);

            if (['/market', '/'].includes(reqPath)) {
                fs.readFile(`views/market.html`, 'utf8', (err, data) => {
                    let pageData = preprocessor.preprocess(data, preprocessorParams);
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(pageData);
                    res.end();
                });
            } else if (this.permittedFileReq(reqPath)) {
                fs.readFile('public' + reqPath, (err, data) => {
                    if (err) {
                        debug.log('Invalid HTTP request received: ' + reqPath);
                        res.writeHead(500);
                        res.end();
                    } else {
                        debug.log('HTTP serving: public' + reqPath);
                        let pageData = this.filePreprocessRequired(reqPath) ?
                            preprocessor.preprocess(data, preprocessorParams) : data;

                        res.writeHead(200);
                        res.write(pageData);
                        res.end();
                    }
                });
            } else {
                debug.log('HTTP invalid request path: ' + reqPath);
                this.showCats(res);
            }
        });

        server.listen(this.config['server_port']);
        console.log('GUI client: listening on ' + this.config['server_port']);

        return server;
    }

    createWsServer() {
        let wsServer = new WebSocketServer({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });

        wsServer.on('request', (request) => {
            let connection = request.accept(this.config['web_socket_protocol'], request.origin);
            this.webSocketConnections.push(connection);
            debug.log('WebSocket: connection accepted');
            connection.on('message', (message) => this.handleWebSocketMessage(connection, message));
        });

        return wsServer;
    }

    registerOnEventEmitter() {
        eventEmitter.on('updateGUIDevices', (deviceType) => this.devicesGroup.updateGUIDevices(deviceType));
        eventEmitter.on('purchaseComplete', () => this.devicesGroup.clearPurchasedProducts());
    }

    filePreprocessRequired(filePath) {
        return this.config['files_to_preprocess'].includes(filePath);
    }

    permittedFileReq(filePath) {
        return this.config['permitted_file_requests'].includes(filePath);
    }

    showCats(res) {
        fs.readFile(`views/404.html`, 'utf8', (err, data) => {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end(data);
        });
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