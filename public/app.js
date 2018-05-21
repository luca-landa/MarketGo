"use strict";

let devices, webSocketConfig;

function setupPage() {
    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let app = new Vue({
        el: '#app',
        data: {
            devices: devices
        }
    });

    let webSocket = new WebSocket('ws://localhost:' + webSocketConfig.port, webSocketConfig.protocol);

    // $('#shelf-0').on('change', (ev) => {
    //     let newVal = ev.target.value;
    //     let msg = {
    //         idx: 0,
    //         quantity: newVal
    //     };
    //     webSocket.send(JSON.stringify(msg));
    // });
}

window.onload = setupPage;
