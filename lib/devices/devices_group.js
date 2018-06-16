"use strict";

const debug = require('../debug').debug;

const Shelf = require("./shelf").Shelf;
const StaffPalmar = require("./palmars/staff_palmar").StaffPalmar;
const ClientPalmar = require('./palmars/client_palmar').ClientPalmar;
const Cart = require('./cart').Cart;

class DevicesGroup {
    constructor(wsConnections, mqttBrokerUrl, mqttTopicBase, clientIdx) {
        this.wsConnections = wsConnections;

        let products = [{idx: 0}, {idx: 1}, {idx: 2}];

        let clientTCPData = {
            address: '127.0.0.1',
            port: 1337
        };

        this.devices = {
            shelves: this.createShelves(products, mqttBrokerUrl, mqttTopicBase),
            products: products,
            staffPalmars: this.createStaffPalmars(mqttBrokerUrl, mqttTopicBase),
            clientPalmar: new ClientPalmar(0, [], clientIdx, mqttBrokerUrl, mqttTopicBase, clientTCPData),
            cart: new Cart(0, clientIdx, [], 6, mqttBrokerUrl, mqttTopicBase)
        };

    }
    
    updateDevice(message) {
        if (message.event === 'deviceStatusUpdate') {
            this.updateStaticDevice(message.deviceType, message);

        } else if (message.event === 'completedAction') {
            let staffPalmar = this.devices.staffPalmars.find((device) => device.idx === message.idx);
            staffPalmar.completedActionClick(message);

        } else if (message.event === 'clientHelpRequest') {
            this.devices.clientPalmar.helpRequestClick(message);

        } else if (message.event === 'productInformationRequest') {
            this.devices.clientPalmar.productInformationRequest(message);

        } else if (message.event === 'cartTotalRequest') {
            this.devices.clientPalmar.cartTotalRequest(message);

        } else if (message.event === 'paymentRequest') {
            this.devices.clientPalmar.paymentRequest();

        } else if (message.event === 'ratingGiven') {
            this.devices.clientPalmar.ratingGiven(message.data);
        }
    }

    updateStaticDevice(deviceType, data) {
        switch (deviceType) {
            case 'shelves':
                this.devices.shelves.find((device) => device.idx === data.idx)
                    .setQuantity(data.quantity);
                break;

            case 'products':
                if (data.action === 'refreshData') {
                    this.devices.products.splice(0);
                    data.products.forEach((product) => {
                        this.devices.products.push(product);
                        this.devices.shelves.find((shelf) => shelf.product.idx === product.idx)
                            .setProduct(product);
                    });
                }

                this.updateGUIDevices('products');
                break;

            case 'cart':
                if (data.action === 'addProduct') {
                    this.devices.cart.addProduct(data.product);
                } else if (data.action === 'removeProduct') {
                    this.devices.cart.removeProduct(data.product);
                }
                break;

            default:
                debug.log(`unknown device type: "${deviceType}"`);
        }
    }

    clearPurchasedProducts() {
        this.devices.cart.clearProducts();
        this.devices.clientPalmar.clearProducts();

    }

    updateGUIDevices(deviceType) {
        this.sendWebSocketMessage(JSON.stringify({
            event: 'devicesUpdate',
            deviceType: deviceType,
            devices: this.getDevicesDataClone()[deviceType]
        }));
    }

    sendWebSocketMessage(string) {
        this.wsConnections.forEach((connection) => {
            try {
                connection.sendUTF(string);
            } catch (err) {

            }
        });
    }

    getDevicesDataClone() {
        let shelves = this.devices.shelves.map((shelf) => shelf.getDataClone());
        let staffPalmars = this.devices.staffPalmars.map((palmar) => palmar.getDataClone());
        let clientPalmar = this.devices.clientPalmar.getDataClone();

        return {
            shelves: shelves,
            staffPalmars: staffPalmars,
            clientPalmar: clientPalmar,
            products: this.devices.products,
            cart: this.devices.cart.getDataClone()
        };
    }

    createShelves(products, mqttBrokerUrl, mqttTopicBase) {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 2;
        let minQuantity = 0;
        let maxQuantity = 6;

        return devicesIdxs.map((idx, index) =>
            new Shelf(idx, defaultQuantity, minQuantity, maxQuantity, products[index], mqttBrokerUrl, mqttTopicBase)
        );
    }

    createStaffPalmars(mqttBrokerUrl, mqttTopicBase) {
        let devicesIdxs = [0, 1];

        return devicesIdxs.map((idx) => new StaffPalmar(idx, [], mqttBrokerUrl, mqttTopicBase));
    }
}

exports.DevicesGroup = DevicesGroup;