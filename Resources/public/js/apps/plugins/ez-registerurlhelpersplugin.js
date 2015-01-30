/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerurlhelpersplugin', function (Y) {
    "use strict";
    /**
     * Provides the register url helpers plugin
     *
     * @module ez-registerhelpersplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Register Url Helpers plugin for the Platform UI application. It registers
     * two handlebars helpers to deal with the url:
     *
     *   * `path` is meant to build link to application routes. It takes the
     *   name of a route and the expected route parameters as a literal object
     *   * `asset` is meant to build url to a static file provided by the
     *   PlatformUIBundle (typically an image)
     *
     * @namespace eZ.Plugin
     * @class RegisterUrlHelpers
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.RegisterUrlHelpers = Y.Base.create('registerUrlHelpersPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this._registerPath();
            this._registerAsset();
        },

        /**
         * Registers the `path` handlebars helper. The `path` helper expects the
         * first argument to be a route name. After the route name, it expects
         * either the route parameters as a hash or a list of named parameters
         * to configure the route.
         *
         * @method _registerPath
         * @protected
         */
        _registerPath: function () {
            var app = this.get('host');

            Y.Handlebars.registerHelper('path', function (routeName, routeParams, options) {
                if ( !options ) {
                    routeParams = routeParams.hash;
                }
                return app.routeUri(routeName, routeParams);
            });
        },

        /**
         * Registers the `asset` handlebars helper.
         *
         * @method _registerAsset
         * @protected
         */
        _registerAsset: function () {
            var app = this.get('host');

            Y.Handlebars.registerHelper('asset', function (uri) {
                return app.get('assetRoot').replace(/\/+$/, '') + '/' + uri.replace(/^\/+/, '');
            });
        },
    }, {
        NS: 'registerUrlHelpers',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.RegisterUrlHelpers, ['platformuiApp']
    );
});
