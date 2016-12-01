#!/usr/bin/env sh
../../../app/console translation:extract en -v \
  --dir=. \
  --exclude-dir=vendor --exclude-dir=Tests --exclude-dir=Features --exclude-dir=node_modules --exclude-dir=Resources/public/vendors \
  --output-dir=./Resources/translations \
  "$@"
