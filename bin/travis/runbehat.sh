#!/bin/sh

set -e

cd $HOME/build/ezplatform

docker-compose exec --user www-data app sh -c "bin/behat -vv --profile=platformui --tags='~@edge'"
