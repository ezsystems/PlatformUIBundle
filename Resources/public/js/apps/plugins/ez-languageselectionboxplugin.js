/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-languageselectionboxplugin', function (Y) {
    "use strict";
    /**
     * Provides the language selection box plugin
     *
     * @module ez-languageselectionboxplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The language selection box plugin. It's a plugin the application to set up the
     * `languageSelect`, `languageSelected` and `cancelLanguageSelection` event handlers.
     *
     * @namespace eZ.Plugin
     * @class LanguageSelectionBox
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.LanguageSelectionBox = Y.Base.create('languageSelectionBoxPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:languageSelect', function (e) {
                app.showSideView('languageSelectionBox', e.config);
            });

            app.on(['*:languageSelected', '*:cancelLanguageSelection'], function (e) {
                app.hideSideView('languageSelectionBox');
            });
        },
    }, {
        NS: 'languageSelectionBox',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LanguageSelectionBox, ['platformuiApp']
    );
});
