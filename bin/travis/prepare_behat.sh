#!/bin/sh

# File for setting up system for behat testing, just like done in DemoBundle's .travis.yml

# Change local git repo to be a full one as we will reuse it for composer install below
git fetch --unshallow && git checkout -b tmp_travis_branch
cd "$HOME/build"

# Checkout meta repo, change the branch and/or remote to use a different ezpublish branch/distro
git clone --depth 1 --single-branch --branch master https://github.com/ezsystems/ezplatform.git
cd ezplatform

##
# from  ./bin/.travis/prepare_system.sh
##
echo "> Disable xdebug";
phpenv config-rm xdebug.ini ;


echo "> Create database and grant premissions to user 'ezp'"
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS behattestdb; GRANT ALL ON behattestdb.* TO ezp@localhost IDENTIFIED BY 'ezp';"

##
# end ./bin/.travis/prepare_system.sh
##

./bin/.travis/prepare_selenium2.sh

##
# from ./bin/.travis/setup_from_external_repo.sh
##
echo "> Modify composer.json to point to local checkout"
sed -i '$d' composer.json
echo ',    "repositories": [{"type":"git","url":"'$TRAVIS_BUILD_DIR'"}]}' >> composer.json

echo "> Updating packages (ezsystems/platform-ui-bundle:dev-tmp_travis_branch as 1.0)"
composer require --no-update "ezsystems/platform-ui-bundle:dev-tmp_travis_branch as 1.0"

#cat composer.json

##
# from ./bin/.travis/prepare_ezpublish.sh
##
echo "> Setup github auth key to not reach api limit"
cp bin/.travis/composer-auth.json ~/.composer/auth.json

echo "> Copy behat specific parameters.yml settings"
cp bin/.travis/parameters.yml app/config/

## Switch to another Symfony version if asked for (with composer update to not use composer.lock if present)
#if [ "$SYMFONY_VERSION" != "" ] ; then
#    echo "> Install dependencies through Composer (with custom Symfony version: ${SYMFONY_VERSION})"
#    composer require --no-update symfony/symfony="${SYMFONY_VERSION}"
#    composer update --no-progress --no-interaction --prefer-dist
#else
    echo "> Install dependencies through Composer"
    composer install --no-progress --no-interaction --prefer-dist
#fi

echo "> Run assetic dump for behat env"
php app/console --env=behat --no-debug assetic:dump

echo "> Installing ezplatform clean"
php app/console --env=behat ezplatform:install clean

echo "> Running the server"
php app/console server:start --router=bin/.travis/router_behat.php --env=behat

echo "> Warm up cache, using curl to make sure everything is warmed up, incl class, http & spi cache"
sleep 1
curl -sSLI "http://127.0.0.1:8000"

echo "> Configuring behat"
cp behat.yml.dist behat.yml
sed -i "s@base_url: 'http://localhost'@base_url: 'http://127.0.0.1:8000'@g" behat.yml
