"use strict";

const Shelf = require("./shelf").Shelf;
const Palmar = require("./palmar").Palmar;
const ClientPalmar = require('./client_palmar').ClientPalmar;


class DevicesGroup {
    constructor(wsConnections) {
        this.wsConnections = wsConnections;

        let products = [{idx: 0}, {idx: 1}, {idx: 2}];

        this.devices = {
            shelves: this.createShelves(products),
            staffPalmars: this.createStaffPalmars(),
            clientPalmar: new ClientPalmar(0, [], 'Pippo'),
            products: products
        };

    }

    updateDevice(deviceType, data, updateType) {
        const permittedDeviceTypes = ['shelves', 'staffPalmars', 'clientPalmar', 'products'];

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

            } else if (deviceType === 'clientPalmar') {

                if (updateType === 'addData') {
                    this.devices.clientPalmar.pushNotification(data);
                } else if (updateType === 'removeNotification') {
                    this.devices.clientPalmar.removeNotification(data);
                }

            } else if (deviceType === 'products') {

                if(updateType === 'refreshData') {
                    this.devices[deviceType].splice(0);
                    data.forEach((el) => {
                        this.devices[deviceType].push(el);
                        this.devices.shelves.find((shelf) => shelf.product.idx === el.idx)
                            .setProduct(el);
                    });
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

    sendWebSocketMessage(string) {
        this.wsConnections.forEach((connection) => {
            try {
                connection.sendUTF(string);
            } catch (err) {

            }
        });
    }

    getDevicesJSON() {
        return JSON.stringify(this.devices);
    }

    createShelves(products) {
        let devicesIdxs = [0, 1, 2];
        let defaultQuantity = 2;
        let minQuantity = 0;
        let maxQuantity = 5;

        return devicesIdxs.map((idx, index) => {
            return new Shelf(idx, defaultQuantity, minQuantity, maxQuantity, products[index]);
        });
    }

    createStaffPalmars() {
        let devicesIdxs = [0, 1];

        return devicesIdxs.map((idx) => {
            return new Palmar(idx, []);
        });
    }
}

exports.DevicesGroup = DevicesGroup;