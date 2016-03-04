#!/bin/sh


echo "> installing nvm"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | NVM_DIR="$HOME/nvm" bash

echo "> installing node"
nvm install
nvm use

echo "> installing global packages"
npm install -g grunt-cli grover bower

echo "> installing local packages (npm and bower)"
npm install
bower install
