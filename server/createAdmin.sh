#!/bin/bash

# hash password here and then send it over to be stored. we don't
# want the password being stored in plaintext in the shell's logs
read -p "Enter an admin username: " ADMIN_USERNAME
read -sp "Enter an admin password: " ADMIN_PASSWORD
# RESULT=$(htpasswd -nBC 10 $ADMIN_USERNAME)
node ./createAdmin.js "$ADMIN_USERNAME:$ADMIN_PASSWORD"
