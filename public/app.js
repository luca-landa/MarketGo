"use strict";

let devices, webSocketConfig;
let app;

function setupPage() {
    setTimeout(()=> document.querySelector('.waiting-spinner').style.display = 'none', 800);

    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = new WebSocket('ws://localhost:' + webSocketConfig.port, webSocketConfig.protocol);

    app = new Vue({
        el: '#app',
        data: {
            devices: devices
        },
        methods: {
            updateShelf(shelf, newQuantity) {
                if(newQuantity < 0) newQuantity = 0;

                shelf.quantity = newQuantity;
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
}

window.onload = setupPage;
