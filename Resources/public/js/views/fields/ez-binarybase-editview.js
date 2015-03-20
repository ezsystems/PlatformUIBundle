/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binarybase-editview', function (Y) {
    "use strict";
    /**
     * Provides a base class for the field edit view of file based field types
     * (Image, BinaryFile, Media)
     *
     * @module ez-binarybase-editview
     */

    Y.namespace('eZ');

    var HAS_WARNING = 'has-warning',
        IS_EMPTY = 'is-field-empty',
        DRAGGING = 'is-dragging-file',
        L = Y.Lang,
        OVER_SIZE_TPL = "The file '{name}' was refused because its size is greater than the maximum allowed size ({max})",
        win = Y.config.win,
        events = {
            '.ez-binarybase-warning-hide': {
                'tap': '_hideWarning',
            },
            '.ez-button-upload': {
                'tap': '_chooseFile',
            },
            '.ez-button-delete': {
                'tap': '_removeFile',
            },
            '.ez-binarybase-input-file': {
                'change': '_updateFile'
            },
            '.ez-binarybase-drop-area': {
                'dragenter': '_prepareDrop',
                'dragover': '_prepareDrop',
                'dragleave': '_uiResetDropArea',
                'drop': '_drop',
            },
        };

    /**
     * The BinaryBase field edit view. This class is meant to be extended.
     *
     * @namespace eZ
     * @class BinaryBaseEditView
     * @constructor
     * @extends FieldEditView
     */
    Y.eZ.BinaryBaseEditView = Y.Base.create('binarybaseEditView', Y.eZ.FieldEditView, [], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
            this._set('file', this.get('field'));
            this.after('warningChange', this._uiHandleWarningMessage);
            this.after('fileChange', function (e) {
                this._set('updated', true);
            });
        },

        render: function () {
            Y.eZ.BinaryBaseEditView.superclass.render.call(this);
            this._setStateClasses();
            this._afterRender();
            return this;
        },

        /**
         * Method called at the end of the render process. The default
         * implementation does nothing, it is meant to be overridden in the view
         * extending the binary base edit view.
         *
         * @method _afterRender
         * @protected
         */
        _afterRender: function () {
        },

        /**
         * Set the state classes on the view container
         *
         * @method _setStateClasses
         * @protected
         */
        _setStateClasses: function () {
            this._toggleClass(this._isEmpty(), IS_EMPTY);
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
         * Returns the field value suitable for the REST API based on the
         * current input. It makes to sure to only send the actual content
         * when it's needed. It returns null if no file has been chosen yet or
         * undefined if no change happened since the version save event.
         *
         * @method _getFieldValue
         * @protected
         * @return {Object|Null|undefined}
         */
        _getFieldValue: function () {
            var file = this.get('file'),
                fieldValue;

            if ( !this.get('updated') ) {
                return undefined;
            }

            if ( !file ) {
                return null;
            }
            this._trackVersionSave();

            fieldValue = Y.merge(this.get('field').fieldValue);
            fieldValue.fileName = file.name;
            if ( file.data ) {
                fieldValue.data = file.data;
            }
            return this._completeFieldValue(fieldValue);
        },

        /**
         * Method called at the end of the field value building process in
         * `_getFieldValue`. It takes the fieldValue in parameter and MUST
         * return the final field value. By default, it only returns the passed
         * field value. It is meant to be overridden in views extending the
         * binary base edit view if the field value is supposed to have
         * additional properties.
         *
         * @method _completeFieldValue
         * @param {Object} fieldValue
         * @return {Object}
         */
        _completeFieldValue: function (fieldValue) {
            return fieldValue;
        },

        /**
         * Checks whether the file field is currently empty.
         *
         * @protected
         * @method _isEmpty
         * @return {Boolean}
         */
        _isEmpty: function () {
            return !this.get('file');
        },

        /**
         * Event handler for the change event on the file input
         *
         * @method _updateFile
         * @protected
         * @param {EventFacade} e event facade of the change event
         */
        _updateFile: function (e) {
            var file = e.target.getDOMNode().files[0];

            this._readFile(file);
            e.target.set('value', '');
        },

        /**
         * Returns the warning message suitable when the user tries to use a too
         * big file
         *
         * @method _getOverSizeMessage
         * @protected
         * @param {String} name the filename the user wants to use
         * @return {String}
         */
        _getOverSizeMessage: function (name) {
            return L.sub(OVER_SIZE_TPL, {name: name, max: this._getHumanMaxSize()});
        },

        /**
         * Returns a "human" readable version of the max allowed file size
         *
         * @method _getHumanMaxSize
         * @protected
         * @return {String}
         */
        _getHumanMaxSize: function () {
            return this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize + 'Mb';
        },

        /**
         * Read the content of the choosen File (if its size match the field
         * configuration) and update the `file` attribute with the corresponding
         * structure
         *
         * @method _readFile
         * @protected
         * @param {File} file the File object from the input file element
         */
        _readFile: function (file) {
            var reader = this.get('fileReader'),
                that = this;

            if ( this._valid(file) ) {
                this._beforeReadFile(file);
                reader.onload = function (e) {
                    var base64 = reader.result.replace(/^.*;base64,/, '');
                    that._set('file', that._createFileStruct(file, base64));
                    reader.onload = undefined;
                };
                reader.readAsDataURL(file);
            }
        },

        /**
         * Method called before we start reading the content of the selected
         * file. The default implementation does nothing, it is meant to be
         * overridden in the views extending the binary base edit view.
         *
         * @method _beforeReadFile
         * @param {File} file the selected file
         * @protected
         */
        _beforeReadFile: function (file) {
        },

        /**
         * Checks whether the File in parameter is valid for the field. By
         * default, only the size of the file is checked against the maximum
         * allowed file size.
         *
         * @method _valid
         * @param {File} file the File object to be stored in the field
         * @protected
         * @return Boolean
         */
        _valid: function (file) {
            return this._validSize(file);
        },

        /**
         * Returns the maximum allowed size in bytes or 0 if no limit is set.
         *
         * @method _maxSize
         * @protected
         * @return Number
         */
        _maxSize: function () {
            var maxSize = this.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize;

            return maxSize ? maxSize * 1024 * 1024 : 0;
        },

        /**
         * Checks whether the size is valid according to the field definition
         * configuration. If the file can not be accepted, a warning message is
         * set in the `warning` attribute.
         *
         * @param {File} file the File object to be stored in the field
         * @method _validSize
         * @return {Boolean}
         * @private
         */
        _validSize: function (file) {
            var maxSize = this._maxSize(),
                valid = maxSize ? (file.size < maxSize) : true;

            if ( !valid ) {
                this._set('warning', this._getOverSizeMessage(file.name));
            }
            return valid;
        },

        /**
         * Toggle a class on the view container based on the value
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
         * Event handler for the tap event on the remove button
         *
         * @method _removeBinaryFile
         * @protected
         * @param {EventFacade} e event facade of tap event
         */
        _removeFile: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this._set('file', null);
        },

        /**
         * Event handler for the tap event on the upload button
         *
         * @method _chooseFile
         * @protected
         * @param {EventFacade} e event facade of the tap event
         */
        _chooseFile: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this.get('container').one('.ez-binarybase-input-file').getDOMNode().click();
        },

        /**
         * Event handler for the dragenter and dragover DOM event
         *
         * @method _prepareDrop
         * @param {EventFacade} e
         * @protected
         */
        _prepareDrop: function (e) {
            e.preventDefault();
            this._set('warning', false);
            this._uiPrepareDropArea(e);
        },

        /**
         * Prepares visually the drop area
         *
         * @method _uiPrepareDropArea
         * @param {EventFacade} the event facade of the drag* event
         * @protected
         */
        _uiPrepareDropArea: function (e) {
            e._event.dataTransfer.dropEffect = 'copy';
            this.get('container').addClass(DRAGGING);
        },

        /**
         * Resets visually the drop area
         *
         * @method _uiResetDropArea
         * @protected
         */
        _uiResetDropArea: function () {
            this.get('container').removeClass(DRAGGING);
        },

        /**
         * Event handler for the drop DOM event.
         *
         * @method _drop
         * @param {EventFacade} e
         * @protected
         */
        _drop: function (e) {
            var files = e._event.dataTransfer.files;

            e.preventDefault();
            this._uiResetDropArea();
            if ( files.length > 1 ) {
                this._set(
                    'warning',
                    'You dropped several files while only one can be stored in this field. Please choose one file.'
                );
                return;
            }
            if ( !files[0] ) {
                this._set(
                    'warning',
                    'You dropped a text selection while this field can only store a file. Please drop a file instead.'
                );
                return;
            }
            this._readFile(files[0]);
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
                container.one('.ez-binarybase-warning-text').setContent(warning);
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
         * Sets the `updated` attribute to false when the attached version is
         * saved. This is to avoid sending again and again the same file
         *
         * @method _trackVersionSave
         * @private
         */
        _trackVersionSave: function () {
            this.get('version').onceAfter('save', Y.bind(function () {
                this._set('updated', false);
            }, this));
        },

        /**
         * Creates the file structure based on the File object provided by the
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
         * file attribute setter. It converts the different input type to a
         * consistent object no matter if the file attribute is filled from the
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
             * The file struct object for the current field. This attribute has
             * a setter to accept either null value, any REST fieldValue
             * or an object created from a File.
             *
             * @readOnly
             * @attribute file
             * @type {Object|null}
             */
            file: {
                readOnly: true,
                setter: '_fileSetter',
                value: null,
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
        }
    });
});
