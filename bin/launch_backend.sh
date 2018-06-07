#!/usr/bin/env bash

current_folder=$(dirname ${BASH_SOURCE[0]})

killall node-red
killall mosquitto
killall mongod

$current_folder/start_mosquitto.sh > /dev/null &
$current_folder/start_node-red.sh > /dev/null &
$current_folder/start_mongodb.sh > /dev/null