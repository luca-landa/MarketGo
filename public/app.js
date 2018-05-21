"use strict";

let devices, webSocketConfig;
let app;

function setupPage() {
    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = new WebSocket('ws://localhost:' + webSocketConfig.port, webSocketConfig.protocol);

    app = new Vue({
        el: '#app',
        data: {
            devices: devices
        },
        methods: {
            updateShelf(idx, newQuantity) {
                let msg = JSON.stringify({
                    idx: idx,
                    quantity: newQuantity
                });
                alert(msg);
                webSocket.send(msg);
            }
        }
    });
}

window.onload = setupPage;
