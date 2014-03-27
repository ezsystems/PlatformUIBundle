# Editorial Bundle

This bundle provides the (future) Editorial Interface for eZ Publish.

## Install

* Clone this repository into `src/EzSystems` (create this folder if it does not
  exist)
* In `ezpublish/EzPublishKernel.php` add an instance of
  `EzSystemsEditorialBundle` class to the list of registered bundles:
    ```php
    public function registerBundles()
    {
        $bundles = array(
            // enabled bundles
            // ...

            new EzSystems\EditorialBundle\EzSystemsEditorialBundle(),
        );
    }
    ```
* In `ezpublish/config/config.yml` add the `EditorialBundle` in the
  `assetic.bundles` setting:

    ```yml
    assetic:
        bundles: [ eZDemoBundle, eZEditorialBundle ]
    ```
* In `ezpublish/config/routing.yml` include the eZEditorialBundle routing
  configuration:

    ```yml
    _ezpublishEditorialRoutes:
    resource: "@eZEditorialBundle/Resources/config/routing.yml"
    ```
* Install [nodejs](http://nodejs.org/)
* Install [phantomjs](http://phantomjs.org)
* Install local npm dependencies, from the bundle root, run:

    ```
    $ npm install
    ```
* Install global dependencies (usually you need to be root):

    ```
    # npm install -g grunt-cli yuidocjs bower grover
    ```
* Install frontend dependencies:

    ```
    $ bower install
    ```

Once this is done, you can go to http://<uri_of_ez>/shell to run the editorial
application.

## Tests

### JavaScript components

The unit tests can be executed with:
```
$ grunt test
``` 

To run the unit tests and generate a coverage report use:
```
$ grunt coverage
```

The HTML coverage report is then available in
`Tests/report/lcov-report/index.html`.

## Grunt tasks

### API documentation

The JavaScript API documentation can be generated in the `api` directory with:

```
$ grunt doc
```
Alternatively, you can run
```
$ grunt livedoc
```
to run the [yuidoc documentation
server](http://yui.github.io/yuidoc/args/index.html#server). The dynamic
documentation can then be reached at http://127.0.0.1:3000.

### Miscelleanous

* To execute jshint checks run:
  ```
   $ grunt lint
   ```
* To generate the minified versions of the JavaScript files:
  ```
  $ grunt uglify
  ```
* Clean up (removes the minified JavaScript files for now):
  ```
  $ grunt clean
 ```

