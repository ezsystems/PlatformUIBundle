#!/bin/sh

# File for setting up system for behat testing, just like done in DemoBundle's .travis.yml

add-apt-repository -y ppa:ondrej/php5
apt-get update -q
apt-get install -y php5-cli php5-common php5-gd php5-xsl php5-intl

# Change local git repo to be a full one as we will reuse it for composer install below
git fetch --unshallow && git checkout -b tmp_travis_branch
export BRANCH_BUILD_DIR=$TRAVIS_BUILD_DIR
export TRAVIS_BUILD_DIR="$HOME/build/ezplatform"
cd "$HOME/build"

# Checkout meta repo, change the branch and/or remote to use a different ezpublish branch/distro
echo "> Pull ezplatform"
git clone --depth 1 --single-branch --branch ugc_base https://github.com/ezsystems/ezplatform.git
cd $TRAVIS_BUILD_DIR

echo "> Modify composer.json to point to local checkout"
sed -i '$d' composer.json
echo ',    "repositories": [{"type":"git","url":"ezsystems/platform-ui-bundle:dev-tmp_travis_branch"}]}' >> composer.json

echo "> Install dependencies through Composer"
curl -sS https://getcomposer.org/installer | php
php -d memory_limit=-1 composer.phar install --no-progress --no-interaction --prefer-dist

echo "> Run assetic dump for behat env"
php app/console --env=behat --no-debug assetic:dump

echo "> Installing ezplatform clean"
php app/console --env=behat ezplatform:install clean

echo "> Start php internal server"
php app/console server:start -r bin/ezrouter.php -r bin/ezrouter.php 0.0.0.0:80

echo "> Warm up cache, using curl to make sure everything is warmed up, incl class, http & spi cache"
curl -sSLI "http://localhost"
