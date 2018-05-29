# Next TODOs
* Solution
  * fix: insert 'product' as an object, with its getDataClone object
  
* TODO class ClientPalmar has method pushNotification with notification type, and decides itself 
  how to build it
* on product info displaying, client allergies are checked and the notification has a warning if the 
  product is not compatible with client preferences
  * client palmar shows client allergies in his login notification
  
* other fixes required
  * client phone receives a notification when the helpRequest has been sent to 
    a staff member

### Next steps
* Client has a cart, he drags products in it and its virtual cart (displayed in the phone) 
  is updated
  * Cart has RFID scanner that detects automatically inserted products
  * Cart does the same check as the phone, to see client allergies and compare them with 
    product ingredients, and alarms the client on the phone eventually
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