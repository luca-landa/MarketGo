"use strict";

let devices, webSocketConfig;
let app;

const defaultTab = 'client-view';

function setupPage() {
    setTimeout(()=> document.querySelector('.waiting-spinner').style.display = 'none', 1000);

    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = createWebSocket(webSocketConfig.port, webSocketConfig.protocol);

    app = new Vue({
        el: '#app',
        data: {
            devices: devices
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

    document.querySelector(`#${defaultTab}-button`).click();
}

function createWebSocket(port, protocol) {
    let webSocket = new WebSocket('ws://localhost:' + port, protocol);
    webSocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        if (message.event === 'deviceStatusUpdate') {
            if(message.deviceType === 'shelves') {
                let device = devices[message.deviceType].find((device) => device.idx === message.idx);
                device.quantity = message.quantity;
            } else if (message.deviceType === 'staffPalmars') {
                if(message.dataType === 'newAction') {
                    console.log('updating actions');
                    devices[message.deviceType].forEach((device) =>
                        device.notifications.push(message.newAction));
                }
            }
        }
    };
    return webSocket;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.style.display = 'none');
    document.querySelector(`#${tabId}`).style.display = 'block';

    document.querySelectorAll('.tab-link').forEach((el) => el.classList.remove('active'));
    document.querySelector(`#${tabId}-button`).classList.add('active');
}

window.onload = setupPage;