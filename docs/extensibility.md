The PlatformUIBundle is a Symfony2 bundle dedicated to eZ Publish Platform. It mainly provides the PlatformUI application, a JavaScript Single Page Application based on the YUI Library meant to replace the administration interface of eZ Publish Legacy.

# Architecture

The PlatformUI application code is divided into different types of components.
Here are the main ones:

* **Application:** this is the top level component, the PlatformUI application
  is an instance of it;
* **Models:** the models are the main objects handled by the application, they
  represent our main domain objects (content, location, content types, ...);
* **View services:** the view services act between the application and the
  views. They are configured on the routes and the main responsibility of a view
service is to provide the model (or others data) to the main view;
* **Views:** the views generate the user interface and handle the user
  interaction (click, form submit, ...). A view can have several sub-views and
that's also valid for the sub-views.
* **Plugins:** the plugins can enhance the application, the view services or the
  views.

The following chart represents the interaction between those components:

<img src="https://rawgit.com/ezsystems/PlatformUIBundle/master/docs/architecture.svg" alt="Platform UI application architecture">

# Configuration

To ease the asset handling and to make the application extensible, the PlatformUIBundle makes use of two main configuration files to list the files (JavaScript, CSS files, templates) required by the application.

## JavaScript components

Each component of the PlatformUI application is written as a YUI module. The YUI module system comes with a dependency system which is used in the PlatformUI application. For instance, the PlatformUI application has a module called ez-templatebasedview which provides a base view class to ease the usage of a template. This module is a dependency of most of the views in the application and has itself some dependencies like for instance the view module from YUI. Those dependencies are expressed in the yui.yml configuration and this configuration is a siteaccess aware configuration that is meant to be extended / overridden in others bundles. For instance:

```yaml
system:
    default:
        yui:
            modules:                
                ez-templatebasedview:
                    requires: ['ez-texthelper', 'ez-view', 'handlebars', 'template']
                    path: %ez_platformui.public_dir%/js/views/ez-templatebasedview.js
                ez-loginformview:
                    requires: ['ez-templatebasedview', 'node-style', 'loginformview-ez-template']
                    path: %ez_platformui.public_dir%/js/views/ez-loginformview.js
```

This configuration can be read:

* in the default scope (valid for all siteaccesses) there are 2 modules;
* the `ez-templatebasedview` module needs the modules `ez-texthelper`, `ez-view`, `handlebars` and `template`. The source code of this module is in `%ez_platformui.public_dir%/js/views/ez-templatebasedview.js` on the disk;
* the `ez-loginformview` module needs the modules `ez-templatebasedview`, `node-style` and `loginformview-ez-template`. The source code of this module is in `%ez_platformui.public_dir%/js/views/ez-loginformview.js` on the disk.

Note that the order of the module definitions is not important, `ez-loginformview` can be defined before the `ez-templatebaseview` module even if the later is a dependency of the first one.

## Templates

Most of the PlatformUI application views use some Handlebars templates to generate the HTML markup. In the application the templates are also handled as YUI modules but those modules are special because they are dynamically generated from the regular template files on the disk. For this to work, the YUI module corresponding to a template must have the type flag set to template. To complete the example above, the template module loginforview-ez-template should be defined in the following way:

```yaml
loginformview-ez-template:
    type: 'template'
    path: %ez_platformui.public_dir%/templates/loginform.hbt
```

By convention, the template module names must end with the `-ez-template` prefix.

## CSS files

The CSS files used by the application are also listed in a configuration file (`css.yml`) with a siteaccess aware configuration, but in the case of CSS files, it's much more simple, example:

```yaml
system:
    default:
        css:
            files:
                - '@eZPlatformUIBundle/Resources/public/css/views/field.css'
                - '@eZPlatformUIBundle/Resources/public/css/views/fields/view/relation.css'
```

# Extend the PlatformUI application

The PlatformUI application can be extended by external bundles.

## PlatformUI extension bundle

To properly extend the PlatformUI application, a PlatformUI extension bundle has to set up the configuration handling so that the configuration in the extension bundle can enhance the PlatformUIBundle configuration. For this, you only have to tweak the extension class of the extension bundle:

```php
<?php

namespace MyCompany\MyBundleBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ConfigurationProcessor;
use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ContextualizerInterface;
use Symfony\Component\Config\Resource\FileResource;

class MyBundleExtension extends Extension implements PrependExtensionInterface
{
    public function load( array $configs, ContainerBuilder $container )
    {
        $loader = new Loader\YamlFileLoader( $container, new FileLocator( __DIR__ . '/../Resources/config' ) );
        $loader->load( 'services.yml' );

        // MyBundle will process a siteaccess aware configuration
        $processor = new ConfigurationProcessor( $container, 'ez_mybundleui' );
    }

    public function prepend( ContainerBuilder $container )
    {
		// make sure Assetic can handle the assets (mainly the CSS files)
        $container->prependExtensionConfig( 'assetic', array( 'bundles' => array( 'eZMyBundleUIBundle' ) ) );

		// prepend the yui.yml and the css.yml from MyBundle
		// of course depending on your needs you can remove the handling of yui.yml or css.yml
        $this->prependYui( $container );
        $this->prependCss( $container );
    }

    private function prependYui( ContainerBuilder $container )
    {
        $yuiConfigFile = __DIR__ . '/../Resources/config/yui.yml';
        $config = Yaml::parse( file_get_contents( $yuiConfigFile ) );
        $container->prependExtensionConfig( 'ez_platformui', $config );
        $container->addResource( new FileResource( $yuiConfigFile ) );
    }

    private function prependCss( ContainerBuilder $container )
    {
        $cssConfigFile = __DIR__ . '/../Resources/config/css.yml';
        $config = Yaml::parse( file_get_contents( $cssConfigFile ) );
        $container->prependExtensionConfig( 'ez_platformui', $config );
        $container->addResource( new FileResource( $cssConfigFile ) );
    }
}
```

With this code in place, you will be able to declare custom JavaScript modules and custom CSS files in yui.yml and css.yml in the extension bundle to make them available in the PlatformUI application.

## Inject new components in the PlatformUI application

### JavaScript components

The JavaScript components in the PlatformUI application are embed in custom YUI modules, so the first thing is to create such a module. [A YUI module](http://yuilibrary.com/yui/docs/yui/#yuiadd) is basically a function which receive the YUI object in argument and which is registered under a module name with `YUI.add`. Usually, the module function creates one or several class/function/... and registers them under a namespace so that they can be used elsewhere. It can also contain code that should be executed when the module is loaded, for instance to register the created components in a registry.

For example, if you want to implement the field view to display the fields of a custom field type

```js
YUI.add('mybundle-myfiedtype-view', function (Y) {
	Y.namespace('MyBundle');

	Y.MyBundle.MyFieldTypeView = Y.Base.create('MyFieldTypeView', Y.eZ.FieldView, [], {
		// methods here
	});

	// mapping the Y.MyBUndle.MyFieldTypeView to the field type identifier 'mycustomfieldtype'
	// so that this view is used to display such fields
	Y.eZ.FieldView.registerFieldView('mycustomfieldtype', Y.MyBundle.MyFieldTypeView);
});
```

Once the module is created, you need to add the corresponding configuration in the `yui.yml` configuration file so that the module can be loaded. The main point here is to defined the dependencies of your module and which PlatformUI application module will depend on your module.

In the example above, our module needs the `Y.eZ.FieldView` components and will be used by the `Y.eZ.RawContentView` (it's the components responsible for displaying the fields of a content), so the configuration for `mybundle-myfieldtype-view` module is:

```yaml
system:
    default:
        yui:
            modules:                
				mybundle-myfiedtype-view:
                    requires: ['ez-fieldview']
					dependencyOf: ['ez-rawcontentview']
                    path: path/to/the/module/mybundle-myfiedtype-view.js
```

With this in place, the PlatformUI application will load the `mybundle-myfieldtype-view` module when the module `ez-rawcontentview` is loaded and will then use the `Y.MyBundle.MyFieldTypeView` to display the fields which field type identifier is `mycustomfieldtype`.

### Templates

While it's not required, a view usually comes with a template to generate the corresponding HTML markup. As written above, in the PlatformUI application, the templates are special components because they are created dynamically from the template file on the disk. By default, the PlatformUI application uses [the Handlebars template engine](http://handlebarsjs.com/). As for a regular JavaScript module, the template needs to be registered in the yui.yml and to ease its usage, the corresponding module name has to follow a naming convention where the template module name is the internal name of view (ie the first parameter of `Y.Base.create`) in lower case followed by the suffix `-ez-template`. So in the example above, the corresponding template module name has to be myfieldtypeview-ez-template, so in the yui.yml you would write:

```yaml
myfieldtypeview-ez-template:
    type: 'template'
    path: path/to/the/template/file.hbt
```

Of course the template module has to be added as a dependency of the component which is supposed to use it, so the `mybundle-myfieldtype-view` module configuration becomes:

```yaml
mybundle-myfiedtype-view:
    requires: ['ez-fieldview', 'myfieldtypeview-ez-template']
    dependencyOf: ['ez-rawcontentview']
    path: path/to/the/module/mybundle-myfiedtype-view.js
```

### Custom CSS files

Adding custom CSS files is just a matter of referencing the CSS file paths in the `css.yml` so that they are included in the HTML page generated to run the PlatformUI application. In the example above, the `css.yml` could contain:

```yaml
system:
    default:
        css:
            files:
                - '@MyBundle/Resources/public/css/myfieldtype.css'
				- '@MyBundle/Resources/public/css/anothercss.css'
```

## Modify existing components

The PlatformUI application also comes with a plugin system based on [the YUI Plugin component](http://yuilibrary.com/yui/docs/plugin/). A PlatformUI application plugin can enhance the following components:

* the application itself;
* the view services;
* the views.

The key points of the plugin system is to provide a generic and flexible extension point to allow to reuse some code (for instance, it's quite common to have plugins that are written to be used in several view services) and also to divide the whole code into smaller units that can be easily tested and refactored if necessary.

### Plugins

As for the others components, a plugin is contained in the YUI module. While it's not strictly required, it's a good practice to only declare one plugin per module. A plugin is basically an object that have access to the component it is extending. The object being extended is called the host object. The plugin also needs to be registered for the components it is supposed to extend in the plugin registry.

The skeleton of a plugin is:

```js
YUI.add('mybundle-myplugin', function (Y) {
    "use strict";

    Y.namespace('MyBundle.Plugin');

    Y.MyBundle.Plugin.MyPlugin = Y.Base.create('mybundleMyPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            // the object being plugged is available with this.get('host')
            // the YUI plugin also provides several methods to help dealing
            // with the host object like onHostEvent
            // see http://yuilibrary.com/yui/docs/plugin/#advanced
        },
    }, {
        // REQUIRED static property which is basically the internal name of the name plugin
		// without it, the plugin can not be plugged!
		NS: 'mybundeMyPluginNS',
    });
	
	// registering the plugin for the components it is supposed to extend
	// The string in the array are the internal names of the components to extend
	// (usually the first parameter of the Y.Base.create call used to create the component)
    Y.eZ.PluginRegistry.registerPlugin(
        Y.MyBundle.Plugin.MyPlugin, ['componentNameToExtend1', 'componentNameToExtend2']
    );
});
```

Of course, the plugin module also needs to be declared in the `yui.yml` configuration file. In this example, its only dependencies are the plugin YUI module and the module providing the plugin registry, so the configuration for such a plugin would be:

```yaml
system:
    default:
        yui:
            modules:                
				mybundle-myplugin:
                    requires: ['plugin', 'ez-pluginregistry']
					dependencyOf: ['componentmoduletoextend1', 'componentmoduletoextend1']
                    path: path/to/the/module/mybundle-myplugin.js
```

#### Plugin for a view service

For a view service, the plugin component has to extend the Y.eZ.Plugin.ViewServiceBase class (a kind of abstract class) so that the plugin gets the default implementation of the following methods:

* `parallelLoad`
* `afterLoad`
* `getViewParameters`
* `setNextViewServiceParameters`

As their names suggest, implementing `parallelLoad` and/or `afterLoad` will make the view service to load/prepare additional data. `parallelLoad` can be used to load something in parallel with the loading process of the view service, this method can be implemented if the loading logic does not need anything that is loaded by the view service (or its plugin). If that's not the case, `afterLoad` can be used. This method is called after the loading done by the view service and the plugins parallelLoad implementations. In both cases, those methods receives a callback that has to be executed when everything is loaded.

`getViewParameters` allows to inject custom parameters to the view configured in the route being used. The return value of this method is merged with the results of `getViewParameters` implementations of the view service and of the others plugins.

`setNextViewServiceParameters` allows to manipulate the view service that will be used after the current one.

Here's a  complete example of the a view service plugin:

```js
YUI.add('mybundle-myviewserviceplugin', function (Y) {
    'use strict';

	Y.namespace('MyBundle.Plugin');

	Y.MyBundle.Plugin.VSPlugin = Y.Base.create('myVSPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        parallelLoad: function (callback) {
            var api = this.get('host').get('capi');
            // for instance, load something with the JavaScript REST Client
			// or do a custom AJAX request
            callback();
        },
        afterLoad: function (callback) {
            var service = this.get('host');
            // for instance, do something with the data added in the service
			// in the "normal" load process
            callback();
        },
        getViewParameters: function () {
            return {
                customParameter: customValue,
            }
        },
        setNextViewServiceParameters: function (nextService) {
            if ( nextService.hasSomething() ) {
                nextService.set('anAttribute', aValue);
            }
        },
    }, {
        NS: 'myVSPlugin',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.MyBundle.Plugin.VSPlugin, ['viewserviceToExtend']
    );
});
```

and the corresponding configuration in the yui.yml configuration file:

```yaml
system:
    default:
        yui:
            modules:                
				mybundle-myviewserviceplugin:
                    requires: ['ez-viewservicebaseplugin', 'ez-pluginregistry']
					dependencyOf: ['componentmoduletoextend1', 'componentmoduletoextend1']
                    path: path/to/the/module/mybundle-myplugin.js
```

### Templates

The template system offers a way to replace any template used by the application by a custom one. To do that, you only have to redefine the path to the template you want to override and that's it. For instance, the PlatformUI application uses the template provided by the module `loginformview-ez-template` to render the login form. To use another template coming in another bundle, you can just write the following configuration in the `yui.yml` file of the bundle:

```yaml
system:
    default:
        yui:
            modules:                  
				loginformview-ez-template:
                    type: 'template'
                    path: path/to/a/custom/loginform/template.hbt
```

The template override operation itself is quite simple and as long as the new template generates a similar markup compared to the original template, there's nothing more to do. However, if the new template generates a completely different markup from the original one, this override should probably be completed with a new CSS file and a plugin for the corresponding view so that the interactions with the user can be kept or implemented.
