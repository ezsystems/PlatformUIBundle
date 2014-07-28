# PlatformUIBundle Configuration

* Author: Damien Pobel <dp@ez.no>
* Created: 2014-07-07
* JIRA: https://jira.ez.no/browse/EZP-23096
* Status: Implemented

## Context

The PlatformUIBundle provides a web application based on the YUI Library. This
library comes with [a module
systems](http://yuilibrary.com/yui/docs/yui/create.html) which allows to
dynamically define and load modules. To ease the developers work, a `yui.yml`
configuration file was introduced in
[01fb9c14](https://github.com/ezsystems/PlatformUIBundle/commit/01fb9c14) to
implement [EZP-21702](https://jira.ez.no/browse/EZP-21702). For simplicity, this
configuration file uses the *normal configuration* system but this also limits
the flexibility in two regards:

1. per siteaccess configuration: the *normal configuration* prevents us from
   configuring the YUI modules to use per siteaccess
2. extensibility: from an external bundle, it's very complicated to inject a
   custom module or to override an existing module.

To workaround those problems, the PlatformUIBundle should expose a siteaccess
aware semantic configuration.

## Configuration in PlatformUIBundle

In the PlatformUIBundle, the `yui.yml` file should be converted into a semantic
configuration, this file would look like:

```yaml
ez_platformui:
    system:
        default: # siteaccess, group of siteaccess or default or global
            yui:
                filter: "min"
                modules:
                    ez-module1:
                        path: "path/to/module1.js"
                    ez-module2:
                        path: "path/to/module2.js"
                        requires:
                            - "ez-module1"
                    ez-module3:
                        path: "path/to/module3.js"
                        requires:
                            - "ez-module1"
                            - "ez-module2"
                    ez-module4:
                        path: "path/to/module4.js"
```

Excepting the `platformui` namespace and the siteaccess level, the structure is
the same as in the current file. This configuration means:

* 4 modules (`ez-module1` to `ez-module4`) are declared with their corresponding
  path on the filesystem
* `ez-module1` and `ez-module4` have no dependency
* `ez-module2` depends on `ez-module1`
* `ez-module3` depends on `ez-module1` and `ez-module2`

## Configuration tweaks from an external bundle

With this configuration system in place, it should be possible to tweak the
configuration from an external bundle, with something like:

```yaml
ez_platformui:
    system:
        ezdemo_site:
            yui:
                modules:
                    new-module:
                        path: "path/to/the/new/module.js"
                        requires:
                            - "ez-module4"
                        dependencyOf:
                            - "ez-module3"
                    ez-module2:
                        path: "path/to/override/module2.js"
                        requires:
                            - "event-tap"
```

The result of such configuration would be:

* in the `ezdemo_site` siteaccess, 2 modules are declared, `new-module` is a new
  module while `ez-module2` is modified.
* `new-module` module depends on `ez-module4` and becomes a dependency of
  `ez-module3`  (both declared in the PlatformUIBundle)
* `ez-module2` is now provided by a new file (complete override) with a new
  dependency ('event-tap' is YUI module)

In others terms, the configuration for `ezdemo_site` siteaccess is:

```yaml
yui:
    filter: "min"
    modules:
        ez-module1:
            path: "path/to/module1.js"
        ez-module2:
            path: "path/to/override/module2.js"
            requires:
                - "ez-module1"
                - "event-tap"
        ez-module3:
            path: "path/to/module3.js"
            requires:
                - "ez-module1"
                - "ez-module2"
                - "new-module"
        ez-module4:
            path: "path/to/module4.js"
        new-module:
            path: "path/to/the/new/module.js"
            requires:
                - "ez-module4"

```

For the others siteaccesses, the configuration remains the same.

## Validation rules

### Syntax validation

* `modules` is a hash, the key is the module identifier for the given module
  definition.
* `path` is required in each module definition
* `requires` and `dependencyOf` are optional and are arrays of module
  identifiers

### Logical validation

* The `path` must point to an existing file on the filesystem. The `path`
  indicated in the semantic configuration is relative to the `web` directory of
  eZ Publish.
* the module identifiers in the `dependencyOf` array must be declared in the
  `modules` hash. If not, an error message will be logged.

Note: the `requires` array can not be validated the same way `dependencyOf`
is, as it might contain YUI modules.
