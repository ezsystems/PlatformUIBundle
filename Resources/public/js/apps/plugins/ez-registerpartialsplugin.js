/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerpartialsplugin', function (Y) {
    "use strict";
    /**
     * Provides the register partials plugin
     *
     * @module ez-registerpartialsplugin
     */
    Y.namespace('eZ.Plugin');

    var PARTIALS_SEL = '.ez-platformui-app-partial';

    /**
     * Register partial plugin. It's a plugin for the PlatformUI application to
     * automatically register Handlebars partials found in the DOM.
     *
     * @namespace eZ.Plugin
     * @class RegisterPartials
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.RegisterPartials = Y.Base.create('registerPartialsPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this._registerPartials();
        },

        /**
         * Register the handlebar partials available in the DOM. The content of
         * any element with the class `ez-platformui-app-partial` is considered
         * as a handlebars partial and is registered with its `id` as the
         * partial name.
         *
         * @method _registerPartials
         * @protected
         */
        _registerPartials: function () {
            Y.all(PARTIALS_SEL).each(function (partial) {
                Y.Handlebars.registerPartial(partial.get('id'), partial.getHTML());
            });
        },
    }, {
        NS: 'registerPartials',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.RegisterPartials, ['platformuiApp']
    );
});
