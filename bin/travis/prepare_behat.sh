#!/bin/sh

# File for setting up system for behat testing, just like done in DemoBundle's .travis.yml

# Change local git repo to be a full one as we will reuse it for composer install below
git fetch --unshallow && git checkout -b tmp_travis_branch
cd "$HOME/build"

# Checkout meta repo, change the branch and/or remote to use a different ezpublish branch/distro
git clone --depth 1 --single-branch --branch master https://github.com/ezsystems/ezplatform.git
cd ezplatform

./bin/.travis/disable_xdebug.sh
./bin/.travis/configure_mysql.sh
./bin/.travis/prepare_selenium2.sh

echo "> Modify composer.json to point to local checkout"
sed -i '$d' composer.json
echo ',    "repositories": [{"type":"git","url":"'$TRAVIS_BUILD_DIR'"}]}' >> composer.json

echo "> Updating packages (ezsystems/platform-ui-bundle:dev-tmp_travis_branch as 1.5)"
composer require --no-update "ezsystems/platform-ui-bundle:dev-tmp_travis_branch as 1.5"

./bin/.travis/prepare_ezpublish.sh

echo "> Running the server"
php app/console server:start --router=bin/.travis/router_behat.php --env=behat

echo "> Warm up cache, using curl to make sure everything is warmed up, incl class, http & spi cache"
sleep 1
curl -sSLI "http://127.0.0.1:8000"

echo "> Configuring behat"
cp behat.yml.dist behat.yml
sed -i "s@base_url: 'http://localhost'@base_url: 'http://127.0.0.1:8000'@g" behat.yml
