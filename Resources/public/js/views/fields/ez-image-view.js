/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-image-view', function (Y) {
    "use strict";
    /**
     * Provides the Image View class
     *
     * @module ez-image-view
     */
    Y.namespace('eZ');

    /**
     * The image view
     *
     * @namespace eZ
     * @class ImageView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.ImageView = Y.Base.create('imageView', Y.eZ.FieldView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadImageVariation;
            this._watchAttribute = 'imageVariation';
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return !this.get('field').fieldValue;
        },

        /**
         * Fire the `loadImageVariation` event
         *
         * @method _fireLoadImageVariation
         * @protected
         */
        _fireLoadImageVariation: function () {
            if ( !this._isFieldEmpty() ) {
                /**
                 * Fired when the view needs the image variation
                 *
                 * @event loadImageVariation
                 * @param {Object} field the Image field
                 * @param {String} variation the variation name (large,
                 * reference, ...)
                 */
                this.fire('loadImageVariation', {
                    field: this.get('field'),
                    variation: this.get('variationIdentifier'),
                });
            }
        },

        /**
         * Returns an object containing the additional variables
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            return {
                imageVariation: this.get('imageVariation'),
                loadingError: this.get('loadingError'),
            };
        },
    },{
        ATTRS: {
            /**
             * The image variation to display
             *
             * @attribute imageVariation
             * @type {Object}
             */
            imageVariation: {
                value: null,
            },

            /**
             * The variation identifier to use to display the image
             *
             * @attribute variationIdentifier
             * @type {String}
             * @default 'platformui_rawcontentview'
             * @initOnly
             */
            variationIdentifier: {
                value: 'platformui_rawcontentview'
            }
        },
    });

    Y.eZ.FieldView.registerFieldView('ezimage', Y.eZ.ImageView);
});
