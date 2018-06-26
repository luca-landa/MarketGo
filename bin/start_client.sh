#!/usr/bin/env bash

trap "kill 0" EXIT

node $(dirname $0)/../client &

firefox --safe-mode -new-tab -url localhost:8000 -new-tab -url localhost:1880/ui

wait