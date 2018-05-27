# Next TODOs
* Shelf displays actual products
  
  * when the phone is dragged on a product, the product lights up
  * the notification has a button to close it
  * the product notification has a dropdown to show full ingredients list
  * the product notification has a better object structure (something like a 
  'message' attribute)

  * client phone receives a notification when he the helpRequest has been sent to 
    a staff member
  * the 'logged in as ' message is not static in the view, but generated as a 
    palmar notification as the object is created

  * re-implement shelves restocking from staff-view
      * shelves are visible both via client-view and staff-view
      * in staff-view they show the button '+' to re-stock

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