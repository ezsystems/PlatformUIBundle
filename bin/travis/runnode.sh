#!/bin/bash

set -e

# make sure correct node version is setup in current shell.
source ~/.nvm/nvm.sh
nvm use

xvfb-run grunt test
