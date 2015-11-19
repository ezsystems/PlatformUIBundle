/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-imagevariationloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the image variation load plugin
     *
     * @module ez-imagevariationloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Image variation load plugin. It sets an event handler on the
     * loadImageVariation event to load an image variation
     *
     * @namespace eZ.Plugin
     * @class ImageVariationLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ImageVariationLoad = Y.Base.create('imageVariationFieldPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:loadImageVariation', this._loadImageVariation);
        },

        /**
         * `loadImageVariation` event handler. It uses the JavaScript REST
         * client to load the information about a variation of an image in the
         * field.
         *
         * @method _loadImageVariation
         * @protected
         * @param {Object} e event facade of the loadImageVariation event
         */
        _loadImageVariation: function (e) {
            var cs = this.get('host').get('capi').getContentService(),
                field = e.field,
                variationId = e.variation,
                callback = e.callback ? e.callback : Y.bind(this._setResultAttributes, this, e.target);

            cs.loadImageVariation(field.fieldValue.variations[variationId].href, function (error, response) {
                callback(error, error ? undefined : response.document.ContentImageVariation);
            });
        },

        /**
         * Sets the result of the loadImageVariation call to the emitter view.
         * It's the default callback when the variation is loaded.
         *
         * @method _setResultAttributes
         * @param {View} view
         * @param {false|CAPIError} error
         * @param {Object} imgVariation
         * @protected
         */
        _setResultAttributes: function (view, error, imgVariation) {
            if (error) {
                view.set("loadingError", true);
            } else {
                view.setAttrs({
                    imageVariation: imgVariation,
                    loadingError: false,
                });
            }
        }
    }, {
        NS: 'imageVariationLoad',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ImageVariationLoad,
        ['locationViewViewService', 'contentEditViewService', 'contentCreateViewService']
    );
});
