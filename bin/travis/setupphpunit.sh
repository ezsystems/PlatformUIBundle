#!/bin/bash

set -e

echo "> switch node version"
source ~/.nvm/nvm.sh
nvm install
nvm use

echo "> installing node packages"
npm install

# Switch to another Symfony version if asked for
if [ "$SYMFONY_VERSION" != "" ] ; then
    echo "> Update symfony/symfony requirement to ${SYMFONY_VERSION}"
    composer require --no-update symfony/symfony="${SYMFONY_VERSION}"
fi

echo "> Running composer install"
composer install --prefer-dist
