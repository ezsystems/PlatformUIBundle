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
                variationId = e.variation;

            cs.loadImageVariation(field.fieldValue.variations[variationId].href, function (error, response) {
                if (error) {
                    e.target.set("loadingError", true);
                } else {
                    e.target.setAttrs({
                        imageVariation: response.document.ContentImageVariation,
                        loadingError: false,
                    });
                }
            });
        },
    }, {
        NS: 'imageVariationLoad',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ImageVariationLoad, ['locationViewViewService', 'contentEditViewService']
    );
});
