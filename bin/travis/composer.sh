#! /bin/sh

curl -sS https://getcomposer.org/installer | php
./composer.phar install --dev --prefer-dist
