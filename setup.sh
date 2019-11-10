#!/bin/bash
# install node_modules
npm install

# reset data dirs
rm -rf data/ data-test/
mkdir data/ data-test/
cp templates/servers.json data/servers.json
cp templates/servers.json data-test/servers.json
cp templates/users.json data/users.json
cp templates/users.json data-test/users.json

# reset dist
rm -rf dist
tsc
