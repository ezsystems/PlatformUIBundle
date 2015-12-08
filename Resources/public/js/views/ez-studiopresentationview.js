/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopresentationview', function (Y) {
    "use strict";
    /**
     * Provides the Studio Presentation View class
     *
     * @module ez-studiopresentationview
     */
    Y.namespace('eZ');

    /**
     * The studio presentation view
     *
     * @namespace eZ
     * @class StudioPresentationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.StudioPresentationView = Y.Base.create('studioPresentationView', Y.eZ.TemplateBasedView, [Y.eZ.HeightFit], {

        initializer: function () {
            this.after('activeChange', this._setIFrameSource);
        },

        /**
         * Renders the studio presentation view
         *
         * @method render
         * @return {eZ.StudioPresentationView} the view itself
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
            this.get('container').one('.ez-studiopresentation-content').set('src', this.get('iframeSource'));
        }

    }, {
        ATTRS: {
            /**
             * Stores the iframe Source
             *
             * @attribute iframeSource
             * @type String
             * @default 'http://ez.no/in-product-studio-teaser'
             * @readOnly
             */
            iframeSource: {
                value: 'http://ez.no/in-product-studio-teaser',
                readOnly: true,
            },
        },
    });
});
