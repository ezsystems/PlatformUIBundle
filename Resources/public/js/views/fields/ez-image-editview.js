/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-image-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Image (ezimage) fields
     *
     * @module ez-image-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezimage',
        IS_LOADING = 'is-image-loading',
        IS_BEING_UPDATED = 'is-image-being-updated',
        HAS_LOADING_ERROR = 'has-loading-error',
        NOT_IMAGE_TPL = "The file '{name}' was refused because it seems to not be an image. Please choose an image file.",
        L = Y.Lang,
        win = Y.config.win,
        events = {
            '.ez-image-alt-text-input': {
                'valuechange': '_altTextChange',
                'blur': 'validate',
            },
        };

    /**
     * The Image edit view
     *
     * @namespace eZ
     * @class ImageEditView
     * @constructor
     * @extends eZ.BinaryBaseEditView
     */
    Y.eZ.ImageEditView = Y.Base.create('imageEditView', Y.eZ.BinaryBaseEditView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            var fieldValue = this.get('field').fieldValue;

            this._handleFieldDescriptionVisibility = false;
            this.events = Y.merge(this.events, events);
            this._fireMethod = this._fireLoadImageVariation;
            this._watchAttribute = false;

            if ( fieldValue ) {
                this._set('alternativeText', fieldValue.alternativeText);
            }

            this._initAttributesEvents();
        },

        /**
         * Initializes the attributes events handling
         *
         * @method _initAttributesEvents
         * @protected
         */
        _initAttributesEvents: function () {
            this.after('imageVariationChange', function (e) {
                this.get('file').displayUri = e.newVal.uri;
                this._uiImageChange();
            });

            this.after('fileChange', this._uiImageChange);
            this.after('alternativeTextChange', function () {
                this._set('updated', true);
            });
        },

        /**
         * Reflects the new image object in the generated UI
         *
         * @method _uiImageChange
         * @protected
         */
        _uiImageChange: function () {
            var image = this.get('file'),
                container = this.get('container'),
                removeButton = container.one('.ez-button-delete'),
                imgNode = container.one('.ez-image-preview');

            if ( image ) {
                container.one('.ez-image-properties-name').setContent(image.name);
                container.one('.ez-image-properties-size').setContent(image.size);
                container.one('.ez-image-properties-type').setContent(image.type);
                container.one('.ez-image-view-original').setAttribute('href', image.originalUri);
                removeButton.set('disabled', false);
                if ( image.displayUri ) {
                    imgNode.setAttribute('src', image.displayUri);
                    container.removeClass(IS_BEING_UPDATED);
                }
            } else {
                // no need to update the DOM, the image is hidden by CSS
                removeButton.set('disabled', true);
            }
            this._setStateClasses();
            this.validate();
        },

        /**
         * Set the state classes on the view container
         *
         * @method _setStateClasses
         * @protected
         */
        _setStateClasses: function () {
            this.constructor.superclass._setStateClasses.call(this);
            this._toggleClass(!this.get('updated') && !this._isEmpty() && !this.get('imageVariation'), IS_LOADING);
            this._toggleClass(this.get('loadingError'), HAS_LOADING_ERROR);
        },

        /**
         * Event handler for the valuechange event on the input field for the
         * alternative text
         *
         * @method _altTextChange
         * @protected
         * @param {EventFacade} e event facade of the valuechange event
         */
        _altTextChange: function (e) {
            this._set('alternativeText', e.target.get('value'));
        },

        /**
         * Removes the *being updated* class before reading the image content.
         *
         * @method _beforeReadFile
         * @protected
         */
        _beforeReadFile: function () {
            this.get('container').addClass(IS_BEING_UPDATED);
        },

        /**
         * Checks whether the File in parameter is valid for the field. It
         * checks the size of the selected file and its mime type.
         *
         * @method _valid
         * @param {File} file the File object to be stored in the field
         * @protected
         * @return Boolean
         */
        _valid: function (file) {
            if ( this._validSize(file) ) {
                return this._validType(file);
            }
            return false;
        },

        /**
         * Checks that the mime type of the user selected file starts with
         * "image/". In case of error, a warning message is set in the `warning`
         * attribute.
         *
         * @method _validType
         * @param {File} file the File object to be stored in the field
         * @protected
         * @return Boolean
         */
        _validType: function (file) {
            var isImage = (file.type.indexOf('image/') === 0);

            if ( !isImage ) {
                this._set('warning', L.sub(NOT_IMAGE_TPL, {name: file.name}));
            }
            return isImage;
        },

        /**
         * Returns a "human" readable version of the max allowed file size. It
         * is overidden the max size is in byte in Image fields.
         *
         * @method _getHumanMaxSize
         * @protected
         * @return {String}
         */
        _getHumanMaxSize: function () {
            return this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize + 'b';
        },

        /**
         * Returns the maximum allowed size in bytes or 0 if no limit is set.
         * The default implementation is overriden because in the case of the
         * Image field, the field definition directly contains the maximum size
         * in bytes while for BinaryFile and Media, this size is in megabytes.
         *
         * @method _maxSize
         * @protected
         * @return Number
         */
        _maxSize: function () {
            var maxSize = this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize;

            return maxSize ? maxSize : 0;
        },

        /**
         * Defines the variables to be imported in the field edit template.
         *
         * @protected
         * @method _variables
         * @return {Object}
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "image": this.get('file'),
                "alternativeText": this.get('alternativeText'),
            };
        },

        /**
         * Completes the field value with the alternative text
         *
         * @protected
         * @method _completeFieldValue
         * @param {Object} fieldValue
         * @return {Object}
         */
        _completeFieldValue: function (fieldValue) {
            fieldValue.alternativeText = this.get('alternativeText');
            delete fieldValue.variations;
            return fieldValue;
        },

        /**
         * Fire the `loadImageVariation` event
         *
         * @method _fireLoadImageVariation
         * @protected
         */
        _fireLoadImageVariation: function () {
            if ( this.get('field').fieldValue ) {
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
         * Creates the image structure based on the File object provided by the
         * input file and on the base64 encoded image content. It also creates a
         * blob URL for the newly selected object.
         *
         * @method _createFileStruct
         * @param {File} file
         * @param {String} content base64 encoded image content
         * @return {Object}
         * @protected
         */
        _createFileStruct: function (file, content) {
            var url = win.URL.createObjectURL(file);

            return {
                name: file.name,
                type: file.type,
                size: file.size,
                originalUri: url,
                displayUri: url,
                data: content,
            };
        },

        /**
         * image attribute setter. It converts the different input type to a
         * consistent object no matter if the image attribute is filled from the
         * REST fieldValue or from the user input.
         *
         * @protected
         * @method _fileSetter
         * @param {Object|Null} value
         * @return {Object}
         */
        _fileSetter: function (value) {
            var file,
                previousValue = this.get('file');

            if ( previousValue ) {
                win.URL.revokeObjectURL(previousValue.displayUri);
            }
            if ( value === null ) {
                return null;
            } else if ( L.isObject(value) && !L.isUndefined(value.fieldValue) ) {
                file = value.fieldValue;
                if ( file === null ) {
                    return null;
                }
                return {
                    name: file.fileName,
                    type: "N/A", // missing in the REST API, see https://jira.ez.no/browse/EZP-23758
                    size: file.fileSize,
                    originalUri: file.uri,
                    // displayUri value will be set after the asynchronous
                    // loading of the variation
                    displayUri: false,
                };
            } else if ( L.isObject(value) ) {
                return value;
            }
            return Y.Attribute.INVALID_VALUE;
        },
    }, {
        ATTRS: {
            /**
             * The alternative image text
             *
             * @attribute alternativeText
             * @readOnly
             * @type {String}
             */
            alternativeText: {
                readOnly: true,
                value: "",
            },

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
                value: 'platformui_editview'
            }
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.ImageEditView
    );
});
