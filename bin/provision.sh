#!/usr/bin/env bash

#update nodejs version
sudo npm cache clean -f
sudo npm install -g n
sudo n 10.2.1

sudo npm install -g abbrev
sudo npm install -g mongodb

cd ..
sudo npm link mongodb
sudo npm install
