#!/usr/bin/env bash

trap "kill 0" EXIT

current_folder=$(dirname ${BASH_SOURCE[0]})

node ${current_folder}/../seed_marketgo_db

$current_folder/start_node-red.sh > /dev/null &

echo "waiting a few seconds for node-red to fully boot up..."

sleep 5

echo "node-red started, launching client..."

$current_folder/start_client.sh &

wait