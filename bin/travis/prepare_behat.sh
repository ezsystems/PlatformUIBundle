#!/bin/sh

# File for setting up system for behat testing, just like done in DemoBundle's .travis.yml

# Install Apache before we add external repo for PHP 5.5 as it will conflict
apt-get update -q
apt-get install -q -y --force-yes apache2 libapache2-mod-fastcgi

# Install PHP 5.5, apt-get package is php 5.3 since travis uses ancient Ubuntu
./bin/travis/setupphp.sh

# Setup additional needs for Behat testing
apt-get install -q -y --force-yes php5-fpm php5-mysqlnd php5-curl curl
chmod -R 0777 /etc/php5

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Change local git repo to be a full one as we will reuse it for composer install below
git fetch --unshallow && git checkout -b tmp_travis_branch
export BRANCH_BUILD_DIR=$TRAVIS_BUILD_DIR
export TRAVIS_BUILD_DIR="$HOME/build/ezplatform"
cd "$HOME/build"

# Checkout meta repo, change the branch and/or remote to use a different ezpublish branch/distro
git clone --depth 1 --single-branch --branch master https://github.com/ezsystems/ezplatform.git
cd ezplatform


## Apache
# vhost & fastcgi setup
php bin/.travis/generatevhost.php \
         --basedir=$TRAVIS_BUILD_DIR \
         --env=behat \
         --host_alias=web \
         doc/apache2/vhost.template \
         /etc/apache2/sites-available/behat
cp bin/.travis/apache2/php5-fcgi /etc/apache2/conf.d/php5-fcgi

# modules enabling
a2enmod rewrite actions fastcgi alias

# sites disabling & enabling
a2dissite default
a2ensite behat


## FPM
USER=$(whoami)

echo "
[global]
[www]
user = $USER
group = $USER
listen = 127.0.0.1:9000
pm = static
pm.max_children = 2
php_admin_value[memory_limit] = 256M
" > /etc/php5/fpm/php-fpm.conf

echo 'date.timezone = "Europe/Oslo"' >> /etc/php5/fpm/php.ini
echo "\ncgi.fix_pathinfo = 1" >> /etc/php5/fpm/php.ini


## Restart
echo "> restart FPM"
service php5-fpm restart
echo "> restart apache2"
service apache2 restart


## Create database
echo "> Create database and grant premissions to user 'ezp'"
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS behattestdb; GRANT ALL ON behattestdb.* TO ezp@localhost IDENTIFIED BY 'ezp';"


## Install Selenium
./bin/.travis/prepare_selenium2.sh


## Composer
echo "> Modify composer.json to point to local checkout"
sed -i '$d' composer.json
echo ',    "repositories": [{"type":"git","url":"'$BRANCH_BUILD_DIR'"}]}' >> composer.json
composer require --no-update "ezsystems/platform-ui-bundle:dev-tmp_travis_branch as 0.999"
cat composer.json


## ezplatform prep
./bin/.travis/prepare_ezpublish.sh
