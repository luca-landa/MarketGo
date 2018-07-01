#!/usr/bin/env bash

current_folder=$(dirname ${BASH_SOURCE[0]})

#update nodejs version
sudo npm cache clean -f
sudo npm install -g n
sudo n 10.2.1

sudo npm install -g abbrev
sudo npm install -g mongodb

cd ${current_folder}/..
sudo npm install
