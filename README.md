# Platform UI Bundle

[![Build Status](https://travis-ci.org/ezsystems/PlatformUIBundle.svg?branch=master)](https://travis-ci.org/ezsystems/PlatformUIBundle)

PlatformUIBundle is a bundle for eZ Publish Platform providing a webapp
application to manage your content and administrate your eZ Publish Platform
install.

If you find a bug, please create an issue [in JIRA](https://jira.ez.no/) and
don't forget to add as much details as you can (steps to reproduce, OS and
browser(s) versions, ...) and to put *PlatformUI* in the *Component/s* field.

## Installation

* From your eZ Publish 5 installation, run composer:

  ```
  $ composer require ezsystems/platform-ui-bundle:dev-master
  ```
  Note: The post install scripts are failing because of a missing CSS file, it's
  [a known issue](https://jira.ez.no/browse/EZP-23128) that will be fixed in the
  coming weeks.

* In `ezpublish/EzPublishKernel.php` add an instance of
  `EzSystemsPlatformUIBundle` class to the list of registered bundles:

  ```php
  public function registerBundles()
  {
      $bundles = array(
          // enabled bundles
          // ...

          new EzSystems\PlatformUIBundle\EzSystemsPlatformUIBundle(),
      );
  }
  ```
* In `ezpublish/config/config.yml` add the `eZPlatformUIBundle` in the
  `assetic.bundles` setting:

  ```yml
  assetic:
      bundles: [ eZDemoBundle, eZPlatformUIBundle ]
  ```
* In `ezpublish/config/routing.yml` include the eZPlatformUIBundle routing
  configuration:

  ```yml
  _ezpublishPlatformUIRoutes:
      resource: "@eZPlatformUIBundle/Resources/config/routing.yml"
  ```
* [Configure the REST API to use the session based authentication](https://doc.ez.no/display/EZP/REST+API+Authentication).
* Run the following command:

  ```
  $ php ezpublish/console assets:install --symlink
  ```
* Install [nodejs](http://nodejs.org/)
* Install [bower](http://bower.io/) (usually you need to be root to install it
  globally)

  ```
  # npm install -g bower
  ```
* Install frontend dependencies:

  ```
  $ bower install
  ```

If you are running eZ Publish in the `prod` environment, you also need to dump
the assets for Assetic with:

```
php ezpublish/console assetic:dump --env=prod
```

Once this is done, you can go to http://[uri\_of\_ez]/shell to run the eZ Platform
UI application.

## Developers tasks

Most developer related tasks can be run with [Grunt](http://gruntjs.com/) and
have several additional dependencies:

* Install Grunt, YUIDoc and Grover globally (usually you need to be root):

  ```
  # npm install -g grunt-cli yuidocjs grover
  ```
* Install [phantomjs](http://phantomjs.org)
* Install local npm dependencies, from the bundle root, run:

  ```
  $ npm install
  ```

Once this is done, you can use any tasks registered in Grunt, the most
interesting are:

* Running the JavaScript unit tests

  ```
  $ grunt test
  ```
* Generate a code coverage from those tests:

  ```
  $ grunt coverage
  ```
  The HTML coverage report is then available in `Tests/report/lcov-report/index.html`.
* Generate the JavaScript API doc:

  ```
  $ grunt doc
  ```
* Alternatively, you can run [a live documentation
  server](http://yui.github.io/yuidoc/args/index.html#server) that will be
  available at http://127.0.0.1:3000 :

  ```
  $ grunt livedoc
  ```

To run the PHP unit tests, you first need to install the dev dependencies of the
bundle. To do that, from the bundle root, run:

```
$ composer install --prefer-dist
```

Then, you can run the unit tests with:

```
$ php vendor/bin/phpunit
```
