/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxplugin', function (Y) {
    "use strict";
    /**
     * Provides the confirm box plugin
     *
     * @module ez-confirmboxplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The confirm box plugin. It's a plugin the application to set up the
     * `confirmBoxOpen` and `confirmBoxClose` event handlers.
     *
     * @namespace eZ.Plugin
     * @class ConfirmBox
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.ConfirmBox = Y.Base.create('confirmBoxPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:confirmBoxOpen', function (e) {
                app.showSideView('confirmBox', e.config);
            });

            app.on('*:confirmBoxClose', function (e) {
                app.hideSideView('confirmBox');
            });
        },
    }, {
        NS: 'confirmBox',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ConfirmBox, ['platformuiApp']
    );
});
