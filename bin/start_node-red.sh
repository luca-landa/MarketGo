#!/usr/bin/env bash

current_folder=$(dirname ${BASH_SOURCE[0]})

node ${current_folder}/../seed_marketgo_db

node-red ${current_folder}/../node-red/flows_market_go.json --userDir ${current_folder}/../node-red -p 1880