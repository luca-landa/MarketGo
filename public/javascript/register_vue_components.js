"use strict";

const vueComponents = {
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
                    <h4 v-if="palmar.notifications.length === 0">No notifications to display</h4>
                    <div v-for="notification in palmar.notifications">
                        <transition appear appear-active-class="new-notification-animation">
                            <div class="notification">
                                <div v-if="notification.type === 'message'" >
                                    <p class="palmar-message">
                                        <span class="x-close" @click="removeNotification(notification)">&#10006;</span>   
                                        {{notification.data}}
                                    </p>
                                </div>
                                <div v-else-if="notification.type === 'productInformation'">
                                    <h4 class="palmar-message"><span class="x-close" @click="removeNotification(notification)">&#10006;</span> Product info</h4>
                                    <div v-for="warning in notification.warnings">
                                        <p class="palmar-message palmar-warning">{{warning}}</p>
                                    </div>
                                    <ul class="palmar-info-list">
                                        <li>{{notification.data.name}}</li>
                                        <li>Price: {{notification.data.price}}</li>
                                    </ul>
                                    <p class="palmar-message">Ingredients:</p>
                                    <ul class="palmar-info-list">
                                        <li v-for="ingredient in notification.data.data.ingredients">{{ingredient}}</li>
                                    </ul>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <button class="palmar-gui-button error" @click="sendHelpRequest()">
                        ask for help
                    </button>
                </div>
                <div class="home-button"></div>
            </div>`,
        updated() {
            let display = this.$el.querySelector('.display');
            display.scrollTop = display.scrollHeight;
        },
        methods: {
            sendHelpRequest() {
                app.sendHelpRequest(this.palmar);
            },
            removeNotification(notification) {
                app.removeClientPalmarNotification(notification);
            },
            dragStart(event) {
                app.phoneDragging = true;
                event.dataTransfer.setData("text", event.target.id);
                event.target.classList.add('dragging');
            },
            dragEnd(event) {
                app.phoneDragging = false;
                event.target.classList.remove('dragging');
            }
        }
    },
    'product': {
        props: ['product'],
        template: `
            <div class="product" draggable="true"
                 @dragstart="dragStart($event)" @dragend="dragEnd()"
                 @dragenter="dragEnter($event, product.idx)" @dragleave="dragLeave($event)">
                <img :src="product.img" draggable="false"/>
                <!--<span>{{product.name}}</span>-->
            </div>
        `,
        methods: {
            dragEnter(event, productIdx) {
                if (app.phoneDragging) {
                    event.target.classList.add('dragover');
                    event.preventDefault();
                    app.sendProductInformationRequest(productIdx);
                }
            },
            dragLeave(event) {
                if (app.phoneDragging) {
                    event.target.classList.remove('dragover');
                    event.preventDefault();
                }
            },
            dragStart(event) {
                app.productDragging = true;
                event.dataTransfer.setData("text", event.target.id);
            },
            dragEnd() {
                app.productDragging = false;
            }
        }
    },
    'shelf': {
        props: ['shelf', 'visibleTab'],
        template: `
            <div class="device shelf">
                <label class="device-label">Shelf {{shelf.idx}}: {{shelf.product.name}}</label>
                
                <div class="products">
                    <product v-for="index in shelf.quantity" :product="shelf.product" :key="index">
                    </product>
                </div>
                
                <button class="shelf-button" @click="updateShelf(shelf, shelf.quantity + 1)" v-show="visibleTab === 'staff-view'">+</button>
                <button class="shelf-button" @click="updateShelf(shelf, shelf.quantity - 1)" v-show="visibleTab === 'client-view'">-</button>
            </div>`,
        methods: {
            updateShelf(shelf, newQuantity) {
                app.updateShelf(shelf, newQuantity);
            }
        }
    },
    'cart': {
        template: `
                <div class="cart device" @dragenter="dragEnter($event)" 
                    @dragend="dragEnd($event)" @dragleave="dragEnd($event)" 
                    @dragover="allowDrop($event)" @drop="productDropped($event)">
                </div>`,
        methods: {
            dragEnter(event) {
                if (app.productDragging) {
                    event.target.classList.add('hovered');
                }
            },
            dragEnd(event) {
                if (app.productDragging) {
                    event.target.classList.remove('hovered');
                }
            },
            productDropped(event) {
                this.dragEnd(event);
            },
            allowDrop(event) {
                if (app.productDragging) {
                    event.preventDefault();
                }
            }
        }
    }
};

function registerVueComponents() {
    for (let name in vueComponents) {
        Vue.component(name, vueComponents[name]);
    }
}
