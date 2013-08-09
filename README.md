# Editorial Bundle

This bundle provides the (future) Editorial Interface for eZ Publish.

## Install

* Clone this repository or create a symlink of the `EditorialBundle` directory
  into `src/EzSystems` (create this folder if it does not exist)
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
        bundles: [ eZDemoBundle, EzSystemsEditorialBundle ]
    ```
* Project maintenance is handled in nodejs environment with a help of Grunt task runner.
  To install everything properly you should install nodejs first (http://nodejs.org/).

  Next, from project's root directory run ```$ npm install -g grunt-cli``` command.
  It will install Grunt task runner and make ```$ grunt``` commands available anywhere on your system.
  Depending on the user setup, this action might require to be root.
  After that run ```$ npm install``` command . That should make other commands available.

  To be able to edit documentation using live yuidoc server you should also install yuidocjs module by running ```$ npm install -g yuidocjs```.

## Maintenance
* To execute jshint spell check just run: ```$ grunt lint```
* You can generate minified versions of main project files.
Minified files will be situated in the same folder as original ones, but will have "-min" sufffix before the extension.
Run: ```$ grunt uglify```
* To delete all minified files, you can run: ```$ grunt clean```

## Documentation

The API documentation of the JavaScript components can be generated with
[yuidoc](http://yui.github.io/yuidoc/) by using the following command:

```
$ grunt doc
```
This will generate a complete API documentation in the `api` directory.

By running 
```
$ grunt livedoc
```
command you can run documentation server which gives you ability to see documentation changes in real time.
By default yuidoc documentation server can be accessed on: http://127.0.0.1:3000

## Tests

### JavaScript components

To run the JavaScript unit tests, you need to install
[PhantomJS](http://phantomjs.org) and [grover](http://github.com/yui/grover/).
Then, the unit tests can be executed with:
```
$ grunt test
``` 

To run the unit tests and generate a coverage report use:
```
$ grunt coverage
```
Beware, this command will be executed much slower, since instrumented versions of the js files will be used. You can also run ```$ grunt instrument``` for simple update  of instrumented files.