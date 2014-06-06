# Platform UI Bundle

## Install

* Clone this repository into `src/EzSystems` (create this folder if it does not
  exist)
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

Once this is done, you can go to http://[uri\_of\_ez]/shell to run the eZ Platform
UI application.

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

