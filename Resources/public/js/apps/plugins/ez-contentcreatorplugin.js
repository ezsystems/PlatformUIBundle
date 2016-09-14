/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreatorplugin', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery plugin
     *
     * @module ez-universaldiscoveryplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Universal discovery plugin. It connects the PlatformUI app and the
     * universal discovery widget by setting the event handlers for the
     * `contentDiscover`, `contentDiscovered` and `cancelDiscover` events.
     * By triggering those events, any component can control the universal
     * discovery widget.
     *
     * @namespace eZ.Plugin
     * @class DiscoveryWidget
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.ContentCreator = Y.Base.create('contentCreatorPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:contentCreatorOpen', function (e) {
                var config = Y.merge(e.config);

                config.languageCode = app.get('contentCreationDefaultLanguageCode');
                app.showSideView('contentCreator', config);
                //app.set('routingEnabled', false);
            });

            app.on(['*:contentCreatorDone', '*:contentCreatorCancelled'], function () {
                //app.set('routingEnabled', true);
                app.hideSideView('contentCreator');
            });
        },
    }, {
        NS: 'contentCreator',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentCreator, ['platformuiApp']
    );
});
