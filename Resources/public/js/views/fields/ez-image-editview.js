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
        HAS_WARNING = 'has-warning',
        L = Y.Lang,
        win = Y.config.win,
        events = {
            '.ez-image-input-file': {
                'change': '_updateImage'
            },
            '.ez-button-upload': {
                'tap': '_chooseImage',
            },
            '.ez-button-delete': {
                'tap': '_removeImage',
            },
            '.ez-image-alt-text-input': {
                'valuechange': '_altTextChange',
                'blur': 'validate',
            },
            '.ez-image-warning-hide': {
                'tap': '_hideWarning',
            },
        };

    /**
     * The Image edit view
     *
     * @namespace eZ
     * @class ImageEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.ImageEditView = Y.Base.create('imageEditView', Y.eZ.FieldEditView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this._fireMethod = this._fireLoadImageVariation;
            this._watchAttribute = false;

            this._initAttributesData();
            this._initAttributesEvents();
        },

        /**
         * Initializes the inital attribute values depending on the passed field
         * during the building of the object
         *
         * @method _initAttributesData
         * @protected
         */
        _initAttributesData: function () {
            var fieldValue = this.get('field').fieldValue;

            this._set('image', this.get('field'));
            if ( fieldValue ) {
                this._set('alternativeText', fieldValue.alternativeText);
            }
        },

        /**
         * Initializes the attributes events handling
         *
         * @method _initAttributesEvents
         * @protected
         */
        _initAttributesEvents: function () {
            this.after('warningChange', this._uiHandleWarningMessage);

            this.after('imageVariationChange', function (e) {
                this.get('image').displayUri = e.newVal.uri;
                this.render();
            });

            this.after('imageChange', function () {
                this._set('updated', true);
                this.render();
                this.validate();
            });
            this.after('alternativeTextChange', function () {
                this._set('updated', true);
            });
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
         * Event handler for the tap event on the upload button
         *
         * @method _chooseImage
         * @protected
         * @param {EventFacade} e event facade of the tap event
         */
        _chooseImage: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this.get('container').one('.ez-image-input-file').getDOMNode().click();
        },

        /**
         * Event handler for the change event on the file input
         *
         * @method _updateImage
         * @protected
         * @param {EventFacade} e event facade of the change event
         */
        _updateImage: function (e) {
            var file = e.target.getDOMNode().files[0],
                that = this,
                reader, msg;

            if ( this._validSize(file.size) ) {
                reader = this.get('fileReader');
                reader.onload = function (e) {
                    var base64 = reader.result.replace(/^.*;base64,/, '');
                    that._set('image', that._createFileStruct(file, base64));
                    reader.onload = undefined;
                };
                reader.readAsDataURL(file);
            } else {
                msg = "The file '" + file.name + "' was refused because";
                msg += ' its size is greater than the maximum allowed size (';
                msg += this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize;
                msg += '&nbsp;bytes).';
                this._set('warning', msg);
            }
            e.target.set('value', '');
        },

        /**
         * Checks whether the size is valid according to the field definition
         * configuration
         *
         * @param {Number} size
         * @method _validSize
         * @return {Boolean}
         * @private
         */
        _validSize: function (size) {
            var maxSize = this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize;

            if ( maxSize ) {
                return (size < maxSize);
            }
            return true;
        },

        /**
         * Event handler for the tap event on the remove button
         *
         * @method _removeImage
         * @protected
         * @param {EventFacade} e event facade of tap event
         */
        _removeImage: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this._set('image', null);
        },

        /**
         * warningChange event handler, it displays/hides the warning message
         * depending on the attribute value.
         *
         * @method _uiHandleWarningMessage
         * @protected
         */
        _uiHandleWarningMessage: function () {
            var warning = this.get('warning'),
                container = this.get('container');

            if ( !warning ) {
                container.removeClass(HAS_WARNING);
            } else {
                container.one('.ez-image-warning-text').setContent(warning);
                container.addClass(HAS_WARNING);
            }
        },

        /**
         * Event handler for the tap event on the hide link of the warning box.
         *
         * @param {EventFacade} e tap event facade
         * @method _hideWarning
         * @protected
         */
        _hideWarning: function (e) {
            e.preventDefault();
            this._set('warning', false);
        },

        /**
         * Validates the current input of the image against the is required
         * field definition setting.
         *
         * @method validate
         */
        validate: function () {
            var def = this.get('fieldDefinition');

            if ( def.isRequired && this._isEmpty() ) {
                this.set('errorStatus', 'This field is required');
            } else {
                this.set('errorStatus', false);
            }
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
                "isEmpty": this._isEmpty(),
                "image": this.get('image'),
                "alternativeText": this.get('alternativeText'),
                "loadingError": this.get('loadingError'),
            };
        },

        /**
         * Checks whether the image field is currently empty.
         *
         * @protected
         * @method _isEmpty
         * @return {Boolean}
         */
        _isEmpty: function () {
            return !this.get('image');
        },

        /**
         * Returns the field value suitable for the REST API based on the
         * current input. It makes to sure to only send the actual image content
         * when it's needed.
         *
         * @method _getFieldValue
         * @protected
         * @return {Object}
         */
        _getFieldValue: function () {
            var image = this.get('image'),
                that = this,
                fieldValue;

            if ( !this.get('updated') ) {
                return undefined;
            }

            if ( !image ) {
                return null;
            }

            this.get('version').onceAfter('save', function (e) {
                // this is to make sure we don't send again and again the
                // image in the REST requests
                that._set('updated', false);
            });

            fieldValue = {
                fileName: image.name,
                fileSize: image.size,
                alternativeText: this.get('alternativeText'),
            };
            if ( image.data ) {
                fieldValue.data = image.data;
            }
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
         * @method _imageSetter
         * @param {Object|Null} value
         * @return {Object}
         */
        _imageSetter: function (value) {
            var file,
                previousValue = this.get('image');

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
                    type: null, // missing in the REST API, see https://jira.ez.no/browse/EZP-23758
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
             * The image struct object for the current field. This attribute has
             * a setter to accept either null value, any REST Image fieldValue
             * or an object created from a File.
             *
             * @readOnly
             * @attribute image
             * @type {Object|null}
             */
            image: {
                readOnly: true,
                setter: '_imageSetter',
                value: null,
            },

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
             * Flag indicating whether the user changed something in the image
             * field. This attribute is used to avoid sending the same image
             * again and again.
             *
             * @attribute updated
             * @readOnly
             * @type {Boolean}
             */
            updated: {
                readOnly: true,
                value: false,
            },

            /**
             * Stores the warning message (if any) or false
             *
             * @attribute warning
             * @readOnly
             * @type {String|false}
             */
            warning: {
                readOnly: true,
                value: false
            },

            /**
             * FileReader instance
             *
             * @attribute fileReader
             * @type FileReader
             * @readOnly
             */
            fileReader: {
                readOnly: true,
                valueFn: function () {
                    return new FileReader();
                },
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
