"use strict";

let devices, webSocketConfig;
let app;

const defaultTab = 'client-view';

function setupPage() {
    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = createWebSocket(webSocketConfig.port, webSocketConfig.protocol);

    registerVueComponents();

    app = new Vue({
        el: '#app',
        data: {
            devices: devices,
            visibleTab: defaultTab,
            phoneDragging: false,
            productDragging: false
        },
        methods: {
            updateShelf(shelf, newQuantity) {
                if (newQuantity < shelf.minQuantity) {
                    newQuantity = shelf.minQuantity;
                } else if (newQuantity > shelf.maxQuantity) {
                    newQuantity = shelf.maxQuantity;
                }

                let msg = JSON.stringify({
                    event: 'deviceStatusUpdate',
                    deviceType: 'shelves',
                    idx: shelf.idx,
                    quantity: newQuantity
                });

                webSocket.send(msg);
            },
            sendCompletedAction(staffPalmar, action) {
                let msg = JSON.stringify({
                    event: 'completedAction',
                    idx: staffPalmar.idx,
                    action: action
                });

                webSocket.send(msg);
            },
            sendHelpRequest(clientPalmar) {
                let msg = JSON.stringify({
                    event: 'clientHelpRequest',
                    idx: clientPalmar.idx,
                    username: clientPalmar.username
                });

                webSocket.send(msg);
            },
            sendProductInformationRequest(productIdx) {
                let msg = JSON.stringify({
                    event: 'productInformationRequest',
                    idx: productIdx,
                    clientIdx: this.devices.clientPalmar.idx
                });

                webSocket.send(msg);
            },
            removeClientPalmarNotification(notification) {
                let msg = JSON.stringify({
                    event: 'deviceStatusUpdate',
                    deviceType: 'clientPalmar',
                    action: 'removeNotification',
                    notification: notification
                });

                webSocket.send(msg);
            },
            addToCart(product) {
                let msg = JSON.stringify({
                    event: 'deviceStatusUpdate',
                    deviceType: 'cart',
                    action: 'addProduct',
                    product: product
                });

                webSocket.send(msg);
            }
        }
    });

    document.querySelector('.waiting-spinner').remove();
}

function createWebSocket(port, protocol) {
    let webSocket = new WebSocket('ws://localhost:' + port, protocol);

    webSocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        if (message.event === 'devicesUpdate') {
            devices[message.deviceType] = message.devices;
        }
    };

    return webSocket;
}

window.onload = setupPage;