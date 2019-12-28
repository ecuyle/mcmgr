#!/bin/bash
# make sure at least node 8 is being used
# install node_modules
printf "\n(Re)Installing npm modules...\n"
npm install --save-dev

# reset data dirs
printf "\n(Re)Setting data directories...\n"
rm -rf ../data/ ../data-test/
mkdir ../data/ ../data-test/
cp templates/servers.json ../data/servers.json
cp templates/servers.json ../data-test/servers.json
cp templates/users.json ../data/users.json
cp templates/users.json ../data-test/users.json

# reset dist
printf "\n(Re)Compiling typescript watch dirs...\n"
rm -rf dist
tsc

# make createAdmin script an executable
printf "\nCreating admin account....\n"
chmod +x ./createAdmin.sh
./createAdmin.sh

printf "\nSuccessfully setup mcmgr server.\nUse 'npm start' to run production build.\nUse 'npm run dev' to run dev build.\n"

