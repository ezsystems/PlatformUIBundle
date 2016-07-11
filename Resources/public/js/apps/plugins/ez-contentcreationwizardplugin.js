/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardplugin', function (Y) {
    "use strict";
    /**
     * Provides the content creation wizard plugin
     *
     * @module ez-contentcreationwizardplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The content creation wizard plugin. It's a plugin for the application to
     * set up the `contentCreationWizardOpen` and `contentCreationWizardClose` event handlers.
     *
     * @namespace eZ.Plugin
     * @class ContentCreationWizard
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.ContentCreationWizard = Y.Base.create('contentCreationWizardPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host');

            app.on('*:contentCreationWizardOpen', function () {
                app.showSideView('contentCreationWizard');
            });

            app.on('*:contentCreationWizardClose', function () {
                app.hideSideView('contentCreationWizard');
            });
        },
    }, {
        NS: 'contentCreationWizard',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ContentCreationWizard, ['platformuiApp']
    );
});
