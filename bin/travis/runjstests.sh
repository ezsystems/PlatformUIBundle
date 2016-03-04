#! /bin/sh

# This script is just a wrapper that executes its parameter only if PHP7 is
# setup. This is an arbitrary choice, just to avoid running JavaScript tests and
# associated tasks as many times as there are supported PHP version.
if [ "$TRAVIS_PHP_VERSION" != "7.0" ] ; then
    echo "> Skipping '$1' (TRAVIS_PHP_VERSION=$TRAVIS_PHP_VERSION)"
    exit 0
fi

exec $*
