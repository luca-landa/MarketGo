# Next TODOs

* node-red dashboard graphs
  * ~~shelves status~~
  * ~~staff actions completed (total count)~~
    * ~~divide by type "help_client" and "restock"~~
    * ~~the dashboard bars display 'help_client' and 'restock'~~
  * product purchases over days
    * ~~client purchases are stored correctly in db~~
    * ~~chart shows for each product the number of purchases for each day over the last week~~
    * today is the 6th and last day of the week (for js Date at least), verify that over the other days it goes well anyway
    * insert many purchases to draw a decent graph (with number of purchases > 10 for each product)
    * insert a legend to map the lines colors to the product idxs
    * display a graph for the sales made today?

* clientPalmar gets client information from db, 'Pippo' is still hardcoded as device name

* refactoring
  * subflow GetProductInformation does not check allergies
  * another subflow gets product information and performs the check
  * mqtt routes: why "MarketGo/staff/action/new" and "MarketGo/clients/0/productAdded" ?

# Next steps
* client experience ratings
    * when client payment goes well, node-red sends him a notification for rating the experience
    * on notification confirm, the rating is saved in mongo ("ratings" collection, records have date, value and clientIdx)
    * dashboard shows average client rating as a number

### Alternatives to next steps
* Client cart is not a network device
* Client needs to scan products before putting them in the cart, in order to disable their 
  chip
* Client scans RFID to exit, and alarm is launched if he still has products in its cart

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
