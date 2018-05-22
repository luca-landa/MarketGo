"use strict";

let devices, webSocketConfig;
let app;

const defaultTab = 'staff-view';

function setupPage() {
    setTimeout(()=> document.querySelector('.waiting-spinner').style.display = 'none', 1000);

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

    document.querySelector(`#${defaultTab}-button`).click();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((el) => el.style.display = 'none');
    document.querySelector(`#${tabId}`).style.display = 'block';

    document.querySelectorAll('.tab-link').forEach((el) => el.classList.remove('active'));
    document.querySelector(`#${tabId}-button`).classList.add('active');
}

window.onload = setupPage;