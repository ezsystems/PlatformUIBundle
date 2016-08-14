#!/bin/sh

set -e

cd $HOME/build/ezplatform

# Execute test command, need to use sh to get right exit code (docker/compose/issues/3379)
docker-compose exec --user www-data app sh -c "bin/behat -vv --profile=platformui --tags='~@edge'"
