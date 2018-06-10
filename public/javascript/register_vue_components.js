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
                        <p class="palmar-message">{{notification.message}}</p>
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
    'star-rating': {
        props: {
            'name': String,
            'value': null,
            'id': String,
            'disabled': Boolean,
            'required': Boolean
        },
        template: `<div class="star-rating palmar-message">
            <label class="star-rating__star" v-for="rating in ratings"
                :class="{\'is-selected\': ((value >= rating) && value != null), \'is-disabled\': disabled}"
                v-on:click="set(rating)" v-on:mouseover="star_over(rating)" v-on:mouseout="star_out">
        
            <input class="star-rating star-rating__checkbox" type="radio" :value="rating" :name="name"
                v-model="value" :disabled="disabled">★</label>
                
            <button class="palmar-gui-button warning" @click="sendRating()"">Send</button>
            </div>`,
        data: function () {
            return {
                temp_value: null,
                ratings: [1, 2, 3, 4, 5]
            };
        },
        methods: {
            sendRating() {
                this.$emit('send-rating', this.value);
            },
            star_over(index) {
                if (!this.disabled) {
                    this.temp_value = this.value;
                    return this.value = index;
                }
            },
            star_out() {
                if (!this.disabled) {
                    return this.value = this.temp_value;
                }
            },
            set(value) {
                if (!this.disabled) {
                    this.temp_value = value;
                    return this.value = value;
                }
            }
        }
    },
    'client-palmar': {
        props: {
            palmar: {
                type: Object
            }
        },
        template: `
                <div id="client-palmar" class="device palmar" draggable="true" @dragstart="dragStart($event)"
                 @dragend="dragEnd($event)">
                <label class="palmar-label">{{palmar.username}}'s phone</label>
                <div class="display">
                    <h4 v-if="palmar.notifications.length === 0">No notifications to display</h4>
                    <div v-for="notification in palmar.notifications">
                        <transition appear appear-active-class="new-notification-animation">
                            <div class="notification">
                                <div v-if="notification.type === 'message'">
                                    <div v-if="notification.title">
                                        <h4 class="palmar-message"><span class="x-close" @click="removeNotification(notification)">&#10006;</span> {{notification.title}}</h4>                                    
                                        <p class="palmar-message">{{notification.data}}</p>
                                        <p v-for="warning in notification.warnings" class="palmar-message palmar-warning">{{warning}}</p>
                                    </div>
                                    <div v-else>
                                        <p class="palmar-message">
                                            <span class="x-close" @click="removeNotification(notification)">&#10006;</span>   
                                            {{notification.data}}
                                            <p v-for="warning in notification.warnings" class="palmar-message palmar-warning">{{warning}}</p>
                                        </p>
                                    </div>
                                </div>
                                
                                <div v-else-if="notification.type === 'productInformation'">
                                    <h4 class="palmar-message"><span class="x-close" @click="removeNotification(notification)">&#10006;</span> Product info</h4>
                                    <p v-for="warning in notification.warnings" class="palmar-message palmar-warning">{{warning}}</p>
                                    <ul class="palmar-info-list">
                                        <li>{{notification.data.name}}</li>
                                        <li>Price: {{notification.data.price}}</li>
                                    </ul>
                                    <p class="palmar-message">Ingredients:</p>
                                    <ul class="palmar-info-list">
                                        <li v-for="ingredient in notification.data.data.ingredients">{{ingredient}}</li>
                                    </ul>
                                </div>
                                
                                <div v-else-if="notification.type === 'cartTotal'">
                                    <h4 class="palmar-message"><span class="x-close" @click="removeNotification(notification)">&#10006;</span> Cart total</h4>
                                    <ul class="palmar-info-list">
                                        <li>Total price: {{notification.total}}</li>
                                    </ul>
                                    <p class="palmar-message">List:</p>
                                    <ul class="palmar-info-list">
                                        <li v-for="product in notification.list">
                                            {{product.quantity}}x {{product.name}} ({{product.subTotal}})
                                        </li>
                                    </ul>
                                </div>
                                
                                <div v-else-if="notification.type=== 'ratingRequest'">
                                    <h4 class="palmar-message">{{notification.title}}</h4>
                                    <p class="palmar-message">{{notification.data}}</p>
                                    <star-rating value="3" @send-rating="sendRating($event)"></star-rating>
                                </div>
                            </div>
                        </transition>
                    </div>

                    <button class="palmar-gui-button error" @click="sendHelpRequest()">
                        Ask for help
                    </button>
                    <button class="palmar-gui-button success" @click="sendCartTotalRequest()">
                        Cart summary
                    </button>
                    <button class="palmar-gui-button pay" @click="sendPaymentRequest()">
                        Pay
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
            sendCartTotalRequest() {
                app.sendCartTotalRequest(this.palmar);
            },
            sendPaymentRequest() {
                app.sendPaymentRequest(this.palmar);
            },
            sendRating(value) {
                app.sendRating(this.palmar, value);
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
        props: ['product', 'dragsource'],
        template: `
            <div class="product" draggable="true"
                 @dragstart="dragStart($event)" @dragend="dragEnd($event)"
                 @dragenter="dragEnter($event, product.idx)" @dragleave="dragLeave($event)">
                <img :src="product.img" draggable="false"/>
            </div>`,
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
                app.productDragged = this;
                event.dataTransfer.setData("text", event.target.id);
            },
            dragEnd(event) {
                app.productDragging = false;
                app.productDragged = null;
                app.productDragFromShelf = false;
            }
        }
    },
    'shelf': {
        props: ['shelf', 'visibleTab'],
        template: `
            <div class="device shelf" @dragover="allowDrop($event)" @drop="productDropped($event)">
                <label class="device-label">Shelf {{shelf.idx}}: {{shelf.product.name}}</label>
                <hr>
                <div class="products">
                    <product v-for="index in shelf.quantity" :product="shelf.product" @decrease-quantity="decreaseQuantity()" 
                        :dragsource="'shelf'" :key="index">
                    </product>
                </div>
                <hr class="bottom-hr">
                <button class="shelf-button" @click="updateShelf(shelf, shelf.quantity + 1)" v-show="visibleTab === 'staff-view'">+</button>
            </div>`,
        methods: {
            updateShelf(shelf, newQuantity) {
                app.updateShelf(shelf, newQuantity);
            },
            productDropped(event) {
                let productComponent = app.productDragged;
                if (app.productDragging && productComponent.dragsource === 'cart' && productComponent.product.idx === this.shelf.product.idx) {
                    this.updateShelf(this.shelf, this.shelf.quantity + 1);
                    productComponent.$emit('remove-product', productComponent.product);
                }
            },
            allowDrop(event) {
                if (app.productDragging) {
                    event.preventDefault();
                }
            },
            decreaseQuantity() {
                app.updateShelf(this.shelf, this.shelf.quantity - 1);
            }
        }
    },
    'cart': {
        props: ['cart'],
        template: `
            <div class="cart device">
                <div class="cart-grip"></div>
                <div class="cart-before"></div>
                <div class="cart-dropzone" @dragenter="dragEnter($event)"  @dragend="dragEnd($event)" @dragleave="dragEnd($event)" 
                    @dragover="allowDrop($event)" @drop="productDropped($event)">
                    <product v-for="(product, index) in cart.products" :key="index" :product="product" :dragsource="'cart'" @remove-product="removeProduct($event)"></product>
                </div>
                <div class="cart-after"></div>
                <div class="cart-first-wheel"></div>
                <div class="cart-second-wheel"></div>
            </div>
            `,
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
                if (app.productDragging && app.productDragged.dragsource === 'shelf' &&
                    this.cart.products.length < this.cart.maxQuantity) {
                    let productComponent = app.productDragged;
                    productComponent.$emit('decrease-quantity');
                    app.addToCart(productComponent.product);
                }
            },
            removeProduct(product) {
                app.removeFromCart(product);
            },
            allowDrop(event) {
                if (app.productDragging) {
                    event.preventDefault();
                }
            }
        }
    }
};

var debug;

function registerVueComponents() {
    for (let name in vueComponents) {
        Vue.component(name, vueComponents[name]);
    }
}
