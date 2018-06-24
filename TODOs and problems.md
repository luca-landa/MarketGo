# Next TODOs
* "script_mongodb.js"
** handle case of "day - prevDays < 0"
** ~~drop database or all collections before insertions~~
** ~~insert ratings~~
** ~~insert completed actions in staff employees records~~
** ~~insert more purchases records to cover the full week~~
** ~~rename script~~
** ~~insert script on server startup~~
** ~~insert param in "parameters.json" to decide if the script should be executed or not~~
** ~~get mongo baseUrl from "parameters.json"~~

# Before submission
* ~~glitch: on firefox in ubuntu 17.04 VM drag has graphic glitches~~
** ~~workaround: start firefox with "firefox --safe-mode"~~
* insert script to create purchases on db with products in the latest 7 days
** maybe on nodejs startup?
** or in the provisioning script?
* rename tcp subflows with "tcp_s_name" or similar