/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgriditemview', function (Y) {
    "use strict";
    /**
     * Provides the subitem grid item view.
     *
     * @module ez-subitemgriditemview
     */
    Y.namespace('eZ');

    var STATE_CLASS_PREFIX = 'is-state-',
        STATE_IMAGE_NONE = 'no-image',
        STATE_IMAGE_LOADING = 'image-loading',
        STATE_IMAGE_LOADED = 'image-loaded',
        STATE_IMAGE_ERROR = 'image-error';

    /**
     * The subitem grid item view.
     *
     * @class SubitemGridItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemGridItemView = Y.Base.create('subitemGridItemView', Y.eZ.TemplateBasedView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            var imageField = this._getFilledImageField();

            this.after('imageStateChange', this._uiSetState);
            this.after('loadImageVariation', function () {
                this._set('imageState', STATE_IMAGE_LOADING);
            });

            this._fireMethod = function () {};
            this._set('imageState', STATE_IMAGE_NONE);
            if ( imageField ) {
                this._fireMethod = Y.bind(this._fireLoadImageVariation, this, imageField);
            }

            this.after('imageVariationChange', function (e) {
                this._set('imageState', STATE_IMAGE_LOADED);
                this._renderImageVariation();
            });

            this._errorHandlingMethod = function () {
                this._set('imageState', STATE_IMAGE_ERROR);
            };
        },

        /**
         * Renders the image variation
         *
         * @method _renderImageVariation
         * @protected
         */
        _renderImageVariation: function () {
            this.get('container').one('.ez-subitemgrid-item-image').setAttribute(
                'src', this.get('imageVariation').uri
            );
        },

        /**
         * Fires the `loadImageVariation` event for the given image field and
         * the image variation stored in `variationIdentifier` attribute.
         *
         * @method _fireLoadImageVariation
         * @param {Object} imageField
         * @protected
         */
        _fireLoadImageVariation: function (imageField) {
            this.fire('loadImageVariation', {
                field: imageField,
                variation: this.get('variationIdentifier'),
            });
        },

        /**
         * `imageStateChange` handler. It sets a state class on the container
         * and make sure the previous state class was removed.
         *
         * @method _uiSetState
         * @protected
         * @param {EventFacade} e
         */
        _uiSetState: function (e) {
            var prevClass = STATE_CLASS_PREFIX + e.prevVal,
                newClass = STATE_CLASS_PREFIX + e.newVal;

            this.get('container')
                .removeClass(prevClass)
                .addClass(newClass);
        },

        /**
         * Returns the first filled ezimage field of the content or null if
         * there's none.
         *
         * @method _getFilledImageField
         * @protected
         * @return {Object|Null}
         */
        _getFilledImageField: function () {
            var content = this.get('content'),
                contentType = this.get('contentType');

            return Y.Array.find(content.getFieldsOfType(contentType, 'ezimage'), function (field) {
                return !!field.fieldValue;
            });
        },

        render: function () {
            this.get('container').setHTML(this.template({
                content: this.get('content').toJSON(),
                location: this.get('location').toJSON(),
                contentType: this.get('contentType').toJSON(),
            }));
            return this;
        },
    }, {
        ATTRS: {
            /**
             * Holds the current state of the grid item view regarding an image
             * to display.
             *
             * @attribute imageState
             * @readOnly
             * @default undefined
             * @type {String}
             */
            imageState: {
                readOnly: true,
            },

            /**
             * The image variation to display. This attribute is filled
             * asynchronously if the content has a filled ezimage field.
             *
             * @attribute imageVariation
             * @type {Object}
             */
            imageVariation: {},

            /**
             * The variation identifier to use to display the image
             *
             * @attribute variationIdentifier
             * @type {String}
             * @default 'platformui_rawcontentview'
             */
            variationIdentifier: {
                value: 'platformui_rawcontentview'
            },

            /**
             * The content type of the content being displayed
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             */
            contentType: {},

            /**
             * The location of the content item being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             */
            location: {},

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             */
            content: {},
        },
    });
});
