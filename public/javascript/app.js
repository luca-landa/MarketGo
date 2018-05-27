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
                    username: clientPalmar.username
                });

                webSocket.send(msg);
            },
            sendProductInformationRequest(productIdx) {
                let msg = JSON.stringify({
                    event: 'productInformationRequest',
                    idx: productIdx
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
            dragEnter(event, productIdx) {
                event.preventDefault();
                this.sendProductInformationRequest(productIdx);
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
                        <button class="palmar-gui-button success" @click="sendCompletedAction(notification)">done</button>
                    </div>
                </div>
                <div class="home-button" @click="alert('not implemented yet')"></div>
            </div>`,
            methods: {
                sendCompletedAction(notification) {
                    app.sendCompletedAction(this.palmar, notification);
                }
            }
        },
        'client-palmar': {
            props: ['palmar'],
            template: `
                <div id="client-palmar" class="device palmar" draggable="true" @dragstart="dragStart($event)"
                 @dragend="dragEnd($event)">
                <label class="palmar-label">{{palmar.username}}'s phone</label>
                <div class="display">
                    
                    <div v-for="notification in palmar.notifications">
                        <transition appear appear-active-class="new-notification-animation">
                            <div class="notification">
                                <p class="palmar-message">
                                    <span class="x-close" @click="removeNotification(notification)">&#10006;</span>   
                                    {{notification.message}}
                                </p>
                            </div>
                        </transition>
                    </div>

                    <button class="palmar-gui-button error" @click="sendHelpRequest()">
                        ask for help
                    </button>
                </div>
                <div class="home-button"></div>
            </div>`,
            methods: {
                sendHelpRequest() {
                    app.sendHelpRequest(this.palmar);
                },
                removeNotification(notification) {
                    app.removeClientPalmarNotification(notification);
                },
                dragStart(event) {
                    event.dataTransfer.setData("text", event.target.id);
                    event.target.classList.add('dragging');
                },
                dragEnd(event) {
                    event.target.classList.remove('dragging');
                }
            }
        }
    };
}

window.onload = setupPage;