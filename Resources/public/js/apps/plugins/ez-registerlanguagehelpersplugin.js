/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-registerlanguagehelpersplugin', function (Y) {
    "use strict";
    /**
     * Provides the register language helpers plugin
     *
     * @module ez-registerlanguagehelpersplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Register Language Helpers plugin for the Platform UI application. It registers
     * handlebars helpers:
     *
     *    * `language_name` is for returning language name based on given language code. It takes the
     *    language code as an argument
     *
     *    * `translate_property` returns the translation of a property. It takes as an argument the property to
     *    translate as a hash indexed by eZ Locale for example:
     *    {'eng-GB': 'potatoes', 'fre-FR': 'pomme de terre'}
     *
     *    * `translate` returns a translated message. It takes as an argument the message to translate, the domain
     *    where the message can be found and the parameters to be applied to the message.
     *
     * @namespace eZ.Plugin
     * @class RegisterLanguageHelpers
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.RegisterLanguageHelpers = Y.Base.create('registerLanguageHelpersPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this._registerLanguageName();
            this._registerTranslatedProperty();
            this._registerTranslate();
        },

        /**
         * Registers the `language_name` handlebars helper. The `language_name` helper expects the
         * argument to be a language code. It will return language name from the language object
         * in app's systemLanguageList. If language with given language code won't be found in
         * systemLanguageList then language code is returned.
         *
         * @method _registerLanguageName
         * @protected
         */
        _registerLanguageName: function () {
            var app = this.get('host');

            Y.Handlebars.registerHelper('language_name', Y.bind(app.getLanguageName, app));
        },

        /**
         * Registers the `translate_property` handlebars helper. The
         * `translate_property` helper expects a hash indexed by eZ Locale
         * ('eng-GB', 'fre-FR', ...) and will try to pick the best one according
         * to the browser languages configuration.
         *
         * @method _registerTranslatedProperty
         * @protected
         */
        _registerTranslatedProperty: function () {
            var app = this.get('host');

            Y.Handlebars.registerHelper('translate_property', Y.bind(app.translateProperty, app, app.get('localesMap')));
        },

        /**
         * Registers the `translate` handlebars helper.  The `translate` helper
         * expects a message that can be found in a domain (See Symfony
         * translation documentation).
         *
         * The parameters of the translated message can be provided as named
         * parameters, for example:
         *
         *     {# string.id could be "My Name is %name% and I'm %age% #}
         *     {{ translation 'string.id' 'domain' name="John" age=42 }}
         *
         * @method _registerTranslate
         * @protected
         */
        _registerTranslate: function () {
            Y.Handlebars.registerHelper('translate', function (message, domain, handlebarsData) {
                var params = {};

                Y.Object.each(handlebarsData.hash, function (value, key) {
                    params[key] = Y.Handlebars.Utils.escapeExpression(value);
                });

                return new Y.Handlebars.SafeString(
                    Y.eZ.Translator.trans(message, params, domain)
                );
            });
        },
    }, {
        NS: 'registerLanguageHelpers',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.RegisterLanguageHelpers, ['platformuiApp']
    );
});
