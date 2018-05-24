# Next TODOs
* Shelf displays actual products
  * frames display real information from db
    * information is the same for every copy of the product on the shelf, since they 
      are copies of the same product
  * products have a button to show their info
  * clicking the button, the product information are taken from db and shown in an alert
  * product info is shown in a phone notification, and no more in the alert
    * the notification has a button to close it
  * the phone becomes draggable
    * it is just needed to handle the dragon event for the products
  * the phone has a scan mode
  * the phone becomes draggable only in scan mode
  * when the phone is dragged on a product, it shows its information
    * on 'dragOn' event, the product lights up to show the reaction
    * the phone asks for its information in the network and displays it

### Next steps
* Shelf shows actual products draggable (in more copies, just one product type for shelf)
* Client can drag his palmar on a product to display information
  * Phone will scan product id, use it to ask the network for the product information and 
    get it in response (Maybe TCP here? it's synchronous)
  * Phone will ask the network the client allergy information, to compare it with the 
    product ingredients and eventually alarm the client
* Client has a cart, he drags products in it and its virtual cart (displayed in the phone) 
  is updated
  * Cart has RFID scanner that detects automatically inserted products
  * Cart does the same check as the phone, to see client allergies and compare them with 
    product ingredients, and alarms the client on the phone eventually
* Cart refill method is changed, and only allowed from staff
* Clients purchases get saved in mongo


### Alternatives to next steps
* Client cart is not a network device
* Client needs to scan products before putting them in the cart, in order to disable their 
  chip
* Client scans RFID to exit, and alarm is launched if he still has products in its cart

### New ideas to evaluate
  * when the customer receives help, he can rate the employee help with 1 to 5 stars
  * when the customer leaves the store, he can rate his experience in it with 1 to 5 
    stars and a text field for suggestions 

### Problems to solve
* when restocking a shelf, from quantity "0" to "1", the "restock" event is generated
  * possible solutions:
    * generate the event only when the quantity is decreasing, not when it is just getting updated
    * don't generate the event when the quantity is changed, but checking every second the quantities from node-red
* the same action is always sent to all staffpalmars
  * possible solutions:
    * node-red checks which staff palmar has the least pending requests and sends the 
      action only to him
      * eventually, it checks every 2-3 seconds and if the assignee has not solved it, 
        the actions is sent to another device