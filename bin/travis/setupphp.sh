#!/bin/sh

add-apt-repository -y ppa:ondrej/php5
apt-get update -q
apt-get install -q -y --force-yes php5-cli php5-common php5-gd php5-xsl php5-intl
