# Next TODOs
* clientPalmar gets client information from db, 'Pippo' is still hardcoded as device name

* refactoring
  * subflow GetProductInformation does not check allergies
  * another subflow gets product information and performs the check
  * mqtt routes: why "MarketGo/staff/action/new" and "MarketGo/clients/0/productAdded" ?

# Next steps
* client experience ratings
    * ~~on purchase success, node-red sends a notification to client with type "ratingRequest"~~
    * ~~when the client receives the notification "ratingRequest" puts it in the array of notifications~~
    * ~~the GUI displays the notification with a message "Rate your experience in MarketGo" with an input number in~~
    * ~~the notification has a "send" button~~
    * ~~on "send" click, clientPalmar sends a mqtt message to node-red with clientIdx and rating~~
    * ~~node-red receives the rating, adds the date and saves it rating in a collection "ratings"~~
    * ~~dashboard displays the average rating with a number~~
    * ~~node-red notifies the dashboard when a rating is added~~
    * the input number in the notification becomes a slider or a star rating system
    * clientPalmar deletes the rating notification after sending the value
    * ~~prettify the avg rating gauge? (single color) or set shelves gauges as type "level"~~
    * re-enable email sending on "ClientPayment" subflow

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
