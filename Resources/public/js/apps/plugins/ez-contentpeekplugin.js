/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekplugin', function (Y) {
    "use strict";
    /**
     * Provides the content peek plugin
     *
     * @module ez-contentpeekplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The content peek plugin. It's a plugin for the application to set up the
     * `contentPeekOpen` and `contentPeekClose` event handlers.
     *
     * @namespace eZ.Plugin
     * @class ContentPeek
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.ContentPeek = Y.Base.create('contentPeekPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:contentPeekOpen', function (e) {
                var config = e.config;

                if ( !config.languageCode ) {
                    config.languageCode = config.content.get('mainLanguageCode');
                }
                app.showSideView('contentPeek', e.config);
            });

            app.on('*:contentPeekClose', function (e) {
                app.hideSideView('contentPeek');
            });
        },
    }, {
        NS: 'contentPeek',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentPeek, ['platformuiApp']
    );
});
