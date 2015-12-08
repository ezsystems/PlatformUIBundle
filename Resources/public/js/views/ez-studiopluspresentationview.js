/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopluspresentationview', function (Y) {
    "use strict";
    /**
     * Provides the Studio Plus Presentation View class
     *
     * @module ez-studiopluspresentationview
     */
    Y.namespace('eZ');

    /**
     * The studio plus presentation view
     *
     * @namespace eZ
     * @class StudioPlusPresentationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.StudioPlusPresentationView = Y.Base.create('studioPlusPresentationView', Y.eZ.TemplateBasedView, [Y.eZ.HeightFit], {
        initializer: function () {
            this.after('activeChange', this._setIFrameSource);
        },

        /**
         * Renders the studio plus presentation view
         *
         * @method render
         * @return {eZ.StudioPlusPresentationView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            this._attachedViewEvents.push(Y.on("windowresize", Y.bind(this._uiSetHeight, this, 0)));

            return this;
        },

        /**
         * Sets the source of the iframe to the value of the iframeSource attribute.
         *
         * @method _setIFrameSource
         * @private
         */
        _setIFrameSource: function () {
            this.get('container').one('.ez-studiopluspresentation-content').set('src', this.get('iframeSource'));
        }

    }, {
        ATTRS: {
            /**
             * Stores the iframe Source
             *
             * @attribute iframeSource
             * @type String
             * @default 'http://ez.no/in-product-studioplus-teaser'
             * @readOnly
             */
            iframeSource: {
                value: 'http://ez.no/in-product-studioplus-teaser',
                readOnly: true,
            },
        },
    });
});
