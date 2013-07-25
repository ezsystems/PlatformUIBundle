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
        bundles: [ eZDemoBundle, EditorialBundle ]
    ```

## Documentation

The API documentation of the JavaScript components can be generated with
[yuidoc](http://yui.github.io/yuidoc/) by using the following command:

```
$ yuidoc -c yuidoc.json
```

This will generate a complete API documentation in the `api` directory.

## Tests

### JavaScript components

To run the JavaScript unit tests, you need to install
[PhantomJS](http://phantomjs.org) and [grover](http://github.com/yui/grover/).
Then, the unit tests can be executed with:

```
$ grover --server Tests/js/**/*html
``` 
