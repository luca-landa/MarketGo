# Next TODOs
* "display cart" optimization
  * when a product is added to cart, the notification it sends to the client contains full product data (with exception for the price)
    * the clientPalmar stores them in a variable
    * TODO add the products in getDataClone() method for clientPalmar
  * when the client clicks on "display cart" sends a query to the system via tcp with already the product idxs he knows
    * same node-red tcp flow is used but skipping the cart querying
  * TODO remove the tcp server from the cart
  * TODO remove the cart tcp querying part from node-red 

* "display cart" optimization
  * ~~products on server have full information but price~~
  * ~~cart sends full product information to clientPalmar~~
  * ~~clientPalmar stores product information in memory when receives the mqtt message from cart~~
  * clientPalmar makes the TCP query to node-red with already the product idxs
    * node-red skips the cart querying part because it already has idxs!
  * cart alerts client via MQTT when a product is removed
      * clientPalmar removes product from cart

* client allergens comparison is done by node-red when asks for information, not by clientPalmar itself!


* client palmar has a button to pay
  * cart can be queried to get the total
  * an email is sent to the client with the total

* staff palmars have transitions for notifications like clientPalmar

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
