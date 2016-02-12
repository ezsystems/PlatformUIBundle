#!/bin/sh


echo "> installing nvm"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash

echo "> installing node"
nvm install
nvm use

echo "> installing global packages"
npm install -g grunt-cli grover bower
