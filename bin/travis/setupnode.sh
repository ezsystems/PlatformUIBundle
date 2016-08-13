#!/bin/bash

set -e

echo "> switch node version"
# @todo Switch to lts version `nvm use --lts` (get tests to run with it)
source ~/.nvm/nvm.sh
nvm install
nvm use

echo "> installing phantomjs 1.9.8 (grover, yui test runner does not work on phantomjs 2.x)"
npm install -g phantomjs@1.9.8

echo "> installing global packages"
npm install -g grunt-cli grover bower

echo "> installing local packages (npm and bower)"
npm install
bower install
