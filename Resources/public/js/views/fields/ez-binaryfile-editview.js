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

    var FIELDTYPE_IDENTIFIER = 'ezbinaryfile';

    /**
     * The BinaryFile edit view
     *
     * @namespace eZ
     * @class BinaryFileEditView
     * @constructor
     * @extends eZ.BinaryBaseEditView
     */
    Y.eZ.BinaryFileEditView = Y.Base.create('binaryfileEditView', Y.eZ.BinaryBaseEditView, [], {
        initializer: function () {
            this.after('fileChange', this._uiBinaryFileChange);
        },

        /**
         * Reflects the new binaryfile object in the generated UI
         *
         * @method _uiBinaryFileChange
         * @param {EventFacade} e the binaryfile change event facade
         * @protected
         */
        _uiBinaryFileChange: function (e) {
            var binaryfile = this.get('file'),
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
            } else {
                // no need to update the DOM, the binaryfile is hidden by CSS
                removeButton.set('disabled', true);
            }
            this._setStateClasses();
            this.validate();
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
            this.constructor.superclass._setStateClasses.call(this);
            if ( !this._isEmpty() ) {
                this._setTypeClasses(true, this.get('file'));
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
                "binaryfile": this.get('file'),
            };
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.BinaryFileEditView
    );
});
