# Next TODOs
* clientPalmar gets client information from db, 'Pippo' is still hardcoded as device name

* refactoring
  * subflow GetProductInformation does not check allergies
  * another subflow gets product information and performs the check
  * mqtt routes: why "MarketGo/staff/action/new" and "MarketGo/clients/0/productAdded" ?

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
