# Next TODOs
* client palmar has a button to display the cart total
  * clientPalmar sends a TCP request with 'cartTotalRequest' as event
  * node-red flow (already done) sends a 'productList' request via TCP to cart 
  * cart has a TCP server listening for 'productList' requests and responding to them
  * client palmar displays a notification with the cart total and the price
  ---- FROM HERE
  * clientPalmar sends a tcp request when clicking on "show cart" button, and receives back a notification 
    with the total
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
