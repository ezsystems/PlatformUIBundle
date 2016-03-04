#!/bin/sh

cd $HOME/build/ezplatform

php bin/behat -vv --profile=platformui
