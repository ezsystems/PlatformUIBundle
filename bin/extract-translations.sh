#!/usr/bin/env sh
echo 'Translation extraction';
cd ../../..;
# Extract string for default locale
echo '# Extract PlatformUIBundle';
./app/console translation:extract en -v \
  --dir=./vendor/ezsystems/platform-ui-bundle \
  --exclude-dir=Tests \
  --exclude-dir=Features \
  --exclude-dir=vendor \
  --exclude-dir=node_modules \
  --exclude-dir=Resources/public/vendors \
  --output-dir=./vendor/ezsystems/platform-ui-bundle/Resources/translations \
  --keep
  "$@"

echo '# Clean file references';
sed -i "s|>.*/platform-ui-bundle/|>|g" ./vendor/ezsystems/platform-ui-bundle/Resources/translations/*.xlf

cd vendor/ezsystems/platform-ui-bundle;
echo 'Translation extraction done';
