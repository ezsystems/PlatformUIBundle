#!/bin/sh

# File for setting up system for Behat testing

set -e

# Change local git repo to be a full one as we will reuse it for composer install below
git fetch --unshallow && git checkout -b tmp_ci_branch
export BRANCH_BUILD_DIR=$TRAVIS_BUILD_DIR TRAVIS_BUILD_DIR="$HOME/build/ezplatform"

# Checkout meta repo, use the branch indicated in composer.json under extra._ezplatform_branch_for_behat_tests
EZPLATFORM_BRANCH=`php -r 'echo json_decode(file_get_contents("./composer.json"))->extra->_ezplatform_branch_for_behat_tests;'`

cd "$HOME/build"

git clone --depth 1 --single-branch --branch "$EZPLATFORM_BRANCH" https://github.com/ezsystems/ezplatform.git
cd ezplatform

# Install everything needed for behat testing, using our local branch of this repo
./bin/.travis/trusty/setup_from_external_repo.sh $BRANCH_BUILD_DIR "ezsystems/platform-ui-bundle:dev-tmp_ci_branch"

cd "$HOME/build/ezplatform"; 
docker-compose exec --user root app sh -c "chown -R www-data:www-data ."
docker-compose exec --user www-data app sh -c "composer config repositories.test vcs http://github.com/mnocon/BehatBundle"
docker-compose exec --user www-data app sh -c 'composer require ezsystems/behatbundle:"dev-EZP-25780-rmdir-warning as 6.5.x-dev"'
