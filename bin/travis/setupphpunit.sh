#!/bin/bash

set -e

echo "> switch node version"
source ~/.nvm/nvm.sh
nvm install
nvm use

echo "> installing node packages"
npm install

echo "> Running composer install"
composer install --prefer-dist
