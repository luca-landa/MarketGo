# Next TODOs
* client palmar has a button to pay
  * ~~clientPalmar sends a TCP request to node-red with clientIdx and productIdxs~~
  * node-red receives it and addresses it to a specific subflow
  * the subflow:
    * ~~gets client creditCardNumber from db and the price of all products~~
    * ~~encrypts the data and sends it via TCP to a flow for payment process~~
    * ~~the flow makes a fake payment request and returns true~~
    * the subflow fetches client email and sends him the total count
    * the email contains the products list (refactoring time!)
    * the subflow returns a message notification with "success"
    * clientPalmar emits an event (audited by server) that empties the cart
  * an email is sent to client

* insert "npm install" in provision.sh
* handle payment not accepted
* make payment acceptance random
* encrypt payment data from client to node-red
* staff actions are stored correctly
* client purchases are stored correctly
* nodejs has a GUI to show graphs 
  * with staff actions completed
  * client purchases or products purchases

* clientPalmar gets client information from db, 'Pippo' is still hardcoded as device name

### Next steps
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
