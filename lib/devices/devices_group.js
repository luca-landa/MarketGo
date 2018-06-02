"use strict";

const debug = require('../debug').debug;

const Shelf = require("./shelf").Shelf;
const StaffPalmar = require("./palmars/staff_palmar").StaffPalmar;
const ClientPalmar = require('./palmars/client_palmar').ClientPalmar;
const Cart = require('./cart').Cart;

class DevicesGroup {
    constructor(wsConnections, mqttBrokerUrl, mqttTopicBase) {
        this.wsConnections = wsConnections;

        let products = [{idx: 0}, {idx: 1}, {idx: 2}];

        let clientTCPData = {
            address: '127.0.0.1',
            productInformationRequestPort: 1337,
            clientAllergiesRequestPort: 1338
        };

        this.devices = {
            shelves: this.createShelves(products, mqttBrokerUrl, mqttTopicBase),
            products: products,
            staffPalmars: this.createStaffPalmars(mqttBrokerUrl, mqttTopicBase),
            clientPalmar: new ClientPalmar(0, [], 'Pippo', 0, mqttBrokerUrl, mqttTopicBase, clientTCPData),
            cart: new Cart(0, [], 6)
        };

    }

    updateDevice(deviceType, data, updateType) {
        const permittedDeviceTypes = ['shelves', 'staffPalmars', 'clientPalmar', 'products', 'cart'];

        if (permittedDeviceTypes.includes(deviceType)) {
            //TODO switch case
            if (deviceType === 'shelves') {
                this.devices[deviceType].find((device) => device.idx === data.idx)
                    .setQuantity(data.quantity);

            } else if (deviceType === 'staffPalmars') {
                if (updateType === 'addData') {
                    this.devices[deviceType].forEach((device) => device.pushNotification(data));

                } else if (updateType === 'removeData') {
                    this.devices[deviceType].forEach((device) => device.removeNotification(data));
                }

            } else if (deviceType === 'clientPalmar') {

                if (updateType === 'addData') {
                    this.devices.clientPalmar.pushNotification(data);
                } else if (updateType === 'removeNotification') {
                    this.devices.clientPalmar.removeNotification(data);
                }

            } else if (deviceType === 'products') {

                if (updateType === 'refreshData') {
                    this.devices[deviceType].splice(0);
                    data.forEach((el) => {
                        this.devices[deviceType].push(el);
                        this.devices.shelves.find((shelf) => shelf.product.idx === el.idx)
                            .setProduct(el);
                    });
                }

                this.updateGUIDevices(deviceType);
            } else if (deviceType === 'cart') {

                if(updateType === 'addProduct') {
                    this.devices.cart.addProduct(data);
                }
            }

        } else {
            debug.log(`unknown device type: "${deviceType}"`);
        }

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