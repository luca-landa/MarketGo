"use strict";

let devices, webSocketConfig;
let app;

const defaultTab = 'client-view';

function setupPage() {
    webSocketConfig = JSON.parse('<!-- @echo webSocketConfig -->');
    devices = JSON.parse('<!-- @echo devices -->');

    let webSocket = createWebSocket(webSocketConfig.port, webSocketConfig.protocol);

    app = new Vue({
        el: '#app',
        data: {
            devices: devices,
            visibleTab: defaultTab,
        },
        components: getVueComponents(),
        methods: {
            updateShelf(shelf, newQuantity) {
                if (newQuantity < 0) newQuantity = 0;

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
                    name: clientPalmar.name
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

function getVueComponents() {
    return {
        'palmar': {
            props: ['palmar'],
            template: `
            <div class="device palmar">
                <label class="palmar-label">Palmar {{palmar.idx}}</label>
                <div class="display">
                    <h4 v-if="palmar.notifications.length === 0">No notifications to display</h4>
                    <div class="notification" v-for="notification in palmar.notifications">
                        <p class="palmar-message">{{notification.action}} (idx "{{notification.idx}}")</p>
                        <button class="palmar-gui-button success" @click="app.sendCompletedAction(palmar, notification)">done</button>
                    </div>
                </div>
                <div class="home-button" @click="alert('not implemented yet')"></div>
            </div>
        `
        }
    };
}

// function drag(event) {
//     // Set variable to true on mousedown
//     $moving = true;
//     // Increase z-index so last clicked always on top
//     $z = $z+1;
//     // Select the item that was clicked
//     $this = event.target;
//     // Positions cursor in center of element when being dragged, as oposed to the top left
//     $width = $this.offsetWidth / 2;
//     $height = $this.offsetHeight / 2;
//     // Element follows mouse cursor
//     document.addEventListener('mousemove',function(e) {
//         // Only run if variable is true (this is destroyed on mouseup)
//         if($moving === true){
//             // Postion element, minus half width/height as above
//             var x = e.clientX - $width;
//             var y = e.clientY - $height;
//
//             // Store left, top, and z-index in variable
//             var position = 'left:' + x + 'px;top:' + y + 'px;z-index:'+$z+';cursor:move;';
//             // Set style
//             $this.setAttribute('style', position);
//         };
//     });
// };
//
// // Destroy drag on mouse up
// function end() {
//     $moving = false;
// };

window.onload = setupPage;