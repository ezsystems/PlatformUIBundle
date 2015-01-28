/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryplugin', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery plugin
     *
     * @module ez-universaldiscoveryplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Universal discovery plugin. It connects the PlatformUI app and the
     * universal discovery widget by setting two events handlers. Those events
     * allow any component in the application to trigger or disable the
     * universal discovery widget.
     *
     * @namespace eZ.Plugin
     * @class DiscoveryWidget
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.UniversalDiscovery = Y.Base.create('universalDiscoveryPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:contentDiscover', function (e) {
                app.showSideView('universalDiscovery', e.config);
            });

            app.on(['*:contentDiscovered', '*:cancelDiscover'], function () {
                app.hideSideView('universalDiscovery');
            });
        },
    }, {
        NS: 'universalDiscoveryWidget',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UniversalDiscovery, ['platformuiApp']
    );
});
