/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the RichText (ezrichtext) fields
     *
     * @module ez-richtext-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezrichtext';

    /**
     * Rich Text edit view
     *
     * @namespace eZ
     * @class RichTextEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RichTextEditView = Y.Base.create('richTextEditView', Y.eZ.FieldEditView, [], {
        initializer: function () {
            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this._editor = Y.eZ.AlloyEditor.editable(
                        this._getEditableArea().get('id')
                    );
                    // TODO on blur => validate
                } else {
                    this._editor.destroy();
                }
            });
        },

        /**
         * Validates the current input of the xml text
         *
         * @method validate
         */
        validate: function () {
            // TODO
            // check isRequired vs. the actual content
            this.set('errorStatus', false);
        },

        _getEditableArea: function () {
            return this.get('container').one('.ez-richtext-editable');
        },

        /**
         * Defines the variables to be imported in the field edit template for xml
         * text.
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired entry
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired,
                "xhtml": this._serializeFieldValue(),
            };
        },

        /**
         * Returns a Document object or null if the parser failed to load the
         * xhtml5edit version of the rich text field.
         *
         * @method _getDOMDocument
         * @return {Document}
         */
        _getDOMDocument: function () {
            var doc = (new DOMParser()).parseFromString(this.get('field').fieldValue.xhtml5edit, "text/xml");

            if ( !doc || !doc.documentElement || doc.documentElement.nodeName === "parsererror" ) {
                console.warn(
                    "Unable to parse the content of the RichText field #" + this.get('field').id
                );
                return null;
            }
            return doc;
        },


        _serializeFieldValue: function () {
            var doc = this._getDOMDocument();

            if ( !doc ) {
                return "";
            }
            return (new XMLSerializer()).serializeToString(doc.documentElement);
        },

        /**
         * Returns the field value suitable for the REST API based on the
         * current input.
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            return {xml: this._getEditableArea().get('content')};
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});
