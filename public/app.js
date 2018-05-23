"use strict";

let devices, webSocketConfig;
let app;

const defaultTab = 'staff-view';

function setupPage() {
    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = createWebSocket(webSocketConfig.port, webSocketConfig.protocol);

    app = new Vue({
        el: '#app',
        data: {
            devices: devices,
            visibleTab: defaultTab
        },
        methods: {
            updateShelf(shelf, newQuantity) {
                if(newQuantity < 0) newQuantity = 0;

                let msg = JSON.stringify({
                    event: 'deviceStatusUpdate',
                    deviceType: 'shelves',
                    idx: shelf.idx,
                    quantity: newQuantity
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