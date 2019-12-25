#!/bin/bash
# make sure at least node 8 is being used
# install node_modules
npm install --save-dev

# reset data dirs
rm -rf ../data/ ../data-test/
mkdir ../data/ ../data-test/
cp templates/servers.json ../data/servers.json
cp templates/servers.json ../data-test/servers.json
cp templates/users.json ../data/users.json
cp templates/users.json ../data-test/users.json

# reset dist
rm -rf dist
tsc

# make createAdmin script an executable
chmod +x ./createAdmin.sh
./createAdmin.sh

