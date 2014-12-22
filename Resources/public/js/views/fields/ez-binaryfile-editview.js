/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binaryfile-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the BinaryFile (ezbinaryfile) fields
     *
     * @module ez-binaryfile-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezbinaryfile',
        HAS_WARNING = 'has-warning',
        IS_EMPTY = 'is-binaryfile-empty',
        IS_BEING_UPDATED = 'is-binaryfile-being-updated',
        L = Y.Lang,
        win = Y.config.win;

    /**
     * The BinaryFile edit view
     *
     * @namespace eZ
     * @class BinaryFileEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.BinaryFileEditView = Y.Base.create('binaryfileEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-binaryfile-input-file': {
                'change': '_updateBinaryFile'
            },
            '.ez-button-upload': {
                'tap': '_chooseBinaryFile',
            },
            '.ez-button-delete': {
                'tap': '_removeBinaryFile',
            },
            '.ez-binaryfile-warning-hide': {
                'tap': '_hideWarning',
            },
        },

        initializer: function () {
            this._set('binaryfile', this.get('field'));
            this.after('warningChange', this._uiHandleWarningMessage);

            this.after('binaryfileChange', function (e) {
                this._set('updated', true);
                this._uiBinaryFileChange(e);
            });
        },

        /**
         * Reflects the new binaryfile object in the generated UI
         *
         * @method _uiBinaryFileChange
         * @param {EventFacade} e the binaryfile change event facade
         * @protected
         */
        _uiBinaryFileChange: function (e) {
            var binaryfile = this.get('binaryfile'),
                container = this.get('container'),
                removeButton = container.one('.ez-button-delete');

            if ( e.prevVal ) {
                this._setTypeClasses(false, e.prevVal);
            }
            if ( binaryfile ) {
                container.one('.ez-binaryfile-properties-name').setContent(binaryfile.name);
                container.one('.ez-binaryfile-properties-size').setContent(binaryfile.size);
                container.one('.ez-binaryfile-properties-type').setContent(binaryfile.type);
                container.one('.ez-binaryfile-download').setAttribute('href', binaryfile.uri);
                removeButton.set('disabled', false);
                container.removeClass(IS_BEING_UPDATED);
            } else {
                // no need to update the DOM, the binaryfile is hidden by CSS
                removeButton.set('disabled', true);
            }
            this._setStateClasses();
            this.validate();
        },

        render: function () {
            this.constructor.superclass.render.call(this);
            this._setStateClasses();
            return this;
        },

        /**
         * Toggle a classe on the view container based on the value
         *
         * @method _toggleClass
         * @param Mixed value
         * @param {String} cl the class to toggle
         * @private
         */
        _toggleClass: function (value, cl) {
            var container = this.get('container');

            if ( value ) {
                container.addClass(cl);
            } else {
                container.removeClass(cl);
            }
        },

        /**
         * Adds or removes classes based on the mimetype of the file currently
         * selected
         *
         * @method _setTypeClasses
         * @param {Boolean} add whether to add or remove the class
         * @param {Object} binaryfile the binary file struct
         * @protected
         */
        _setTypeClasses: function (add, binaryfile) {
            var container = this.get('container'),
                mimeTypeClass, mimeSubTypeClass;

            if ( !binaryfile.type ) {
                return;
            }

            mimeSubTypeClass = this._getMimeTypeClass(binaryfile.type);
            mimeTypeClass = this._getTypeClass(binaryfile.type);
            if ( add ) {
                container.addClass(mimeTypeClass).addClass(mimeSubTypeClass);
            } else {
                container.removeClass(mimeTypeClass).removeClass(mimeSubTypeClass);
            }
        },

        /**
         * Returns the class reflecting the full mime type. The subtype part is
         * sanitized so that we generate a valid class
         *
         * @method _getMimeTypeClass
         * @param {String} mimeType the mime type ("text/plain" for instance)
         * @return String
         * @private
         */
        _getMimeTypeClass: function (mimeType) {
            var parts = mimeType.split('/'),
                subType = parts[1].replace(/[^a-zA-Z0-9]/g, '-');

            return 'is-mimetype-' + parts[0] + '-' + subType;
        },

        /**
         * Returns the class reflecting the type part of mime type. (ie "text"
         * in "text/plain").
         *
         * @method _getTypeClass
         * @param {String} mimeType the mime type ("text/plain" for instance)
         * @return {String}
         * @private
         */
        _getTypeClass: function (mimeType) {
            var parts = mimeType.split('/');

            return 'is-type-' + parts[0];
        },

        /**
         * Set the state classes on the view container
         *
         * @method _setStateClasses
         * @protected
         */
        _setStateClasses: function () {
            var isEmpty = this._isEmpty();

            this._toggleClass(isEmpty, IS_EMPTY);
            if ( !isEmpty ) {
                this._setTypeClasses(true, this.get('binaryfile'));
            }
        },

        /**
         * Event handler for the tap event on the upload button
         *
         * @method _chooseBinaryFile
         * @protected
         * @param {EventFacade} e event facade of the tap event
         */
        _chooseBinaryFile: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this.get('container').one('.ez-binaryfile-input-file').getDOMNode().click();
        },

        /**
         * Event handler for the change event on the file input
         *
         * @method _updateBinaryFile
         * @protected
         * @param {EventFacade} e event facade of the change event
         */
        _updateBinaryFile: function (e) {
            var file = e.target.getDOMNode().files[0],
                that = this,
                reader, msg;

            if ( this._validSize(file.size) ) {
                this.get('container').addClass(IS_BEING_UPDATED);
                reader = this.get('fileReader');
                reader.onload = function (e) {
                    var base64 = reader.result.replace(/^.*;base64,/, '');
                    that._set('binaryfile', that._createFileStruct(file, base64));
                    reader.onload = undefined;
                };
                reader.readAsDataURL(file);
            } else {
                msg = "The file '" + file.name + "' was refused because";
                msg += ' its size is greater than the maximum allowed size (';
                msg += this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize;
                msg += '&nbsp;Mb).';
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
                return (size < (maxSize * 1024 * 1024));
            }
            return true;
        },

        /**
         * Event handler for the tap event on the remove button
         *
         * @method _removeBinaryFile
         * @protected
         * @param {EventFacade} e event facade of tap event
         */
        _removeBinaryFile: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this._set('binaryfile', null);
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
                container.one('.ez-binaryfile-warning-text').setContent(warning);
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
         * Validates the current input of the binaryfile against the is required
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
                "binaryfile": this.get('binaryfile'),
            };
        },

        /**
         * Checks whether the binaryfile field is currently empty.
         *
         * @protected
         * @method _isEmpty
         * @return {Boolean}
         */
        _isEmpty: function () {
            return !this.get('binaryfile');
        },

        /**
         * Returns the field value suitable for the REST API based on the
         * current input. It makes to sure to only send the actual binaryfile content
         * when it's needed. It returns null if no file has been chosen yet or
         * undefined if no change happened since the version save event.
         *
         * @method _getFieldValue
         * @protected
         * @return {Object|Null|undefined}
         */
        _getFieldValue: function () {
            var binaryfile = this.get('binaryfile'),
                that = this,
                fieldValue;

            if ( !this.get('updated') ) {
                return undefined;
            }

            if ( !binaryfile ) {
                return null;
            }

            this.get('version').onceAfter('save', function (e) {
                // this is to make sure we don't send again and again the
                // binaryfile in the REST requests
                that._set('updated', false);
            });

            fieldValue = {
                fileName: binaryfile.name,
            };
            if ( binaryfile.data ) {
                fieldValue.data = binaryfile.data;
            }
            return fieldValue;
        },

        /**
         * Creates the binaryfile structure based on the File object provided by the
         * input file and on the base64 encoded binaryfile content. It also creates a
         * blob URL for the newly selected object.
         *
         * @method _createFileStruct
         * @param {File} file
         * @param {String} content base64 encoded binaryfile content
         * @return {Object}
         * @protected
         */
        _createFileStruct: function (file, content) {
            return {
                name: file.name,
                type: file.type,
                size: file.size,
                uri: win.URL.createObjectURL(file),
                data: content,
            };
        },

        /**
         * binaryfile attribute setter. It converts the different input type to a
         * consistent object no matter if the binaryfile attribute is filled from the
         * REST fieldValue or from the user input.
         *
         * @protected
         * @method _binaryfileSetter
         * @param {Object|Null} value
         * @return {Object}
         */
        _binaryfileSetter: function (value) {
            var file,
                previousValue = this.get('binaryfile');

            if ( previousValue ) {
                win.URL.revokeObjectURL(previousValue.uri);
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
                    type: file.mimeType,
                    size: file.fileSize,
                    uri: file.uri,
                };
            } else if ( L.isObject(value) ) {
                return value;
            }
            return Y.Attribute.INVALID_VALUE;
        },
    }, {
        ATTRS: {
            /**
             * The binaryfile struct object for the current field. This attribute has
             * a setter to accept either null value, any REST BinaryFile fieldValue
             * or an object created from a File.
             *
             * @readOnly
             * @attribute binaryfile
             * @type {Object|null}
             */
            binaryfile: {
                readOnly: true,
                setter: '_binaryfileSetter',
                value: null,
            },

            /**
             * Flag indicating whether the user changed something in the binaryfile
             * field. This attribute is used to avoid sending the same binaryfile
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
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.BinaryFileEditView
    );
});
