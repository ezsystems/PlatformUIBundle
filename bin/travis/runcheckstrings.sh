#!/usr/bin/env sh

set -x

cd "$HOME/build/ezplatform"
ls -l
$(docker-compose exec --user www-data app sh -c "cd vendor/ezsystems/platform-ui-bundle; ./bin/travis/checkstrings.sh")

exit $?
