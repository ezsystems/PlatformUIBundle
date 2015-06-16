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
                    this._initEditor();
                } else {
                    this._editor.destroy();
                }
            });
        },

        /**
         * Initializes the editor
         *
         * @protected
         * @method _initEditor
         */
        _initEditor: function () {
            this._editor = Y.eZ.AlloyEditor.editable(
                this._getEditableArea().getDOMNode()
            );
            this._getNativeEditor().on('blur', Y.bind(this.validate, this));
        },

        validate: function () {
            if ( !this.get('fieldDefinition').isRequired ) {
                this.set('errorStatus', false);
                return;
            }
            if ( this._isEmpty() ) {
                this.set('errorStatus', "This field is required");
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Checks whether the field is empty. The field is considered empty if
         * the editor handles a `section` element and this element has some
         * child nodes.
         *
         * @method _isEmpty
         * @protected
         * @return {Boolean}
         */
        _isEmpty: function () {
            var section = Y.Node.create(this._getNativeEditor().getData());

            return (!section || !section.hasChildNodes());
        },

        /**
         * Returns the editable area
         *
         * @method _getEditableArea
         * @protected
         * @return {Node}
         */
        _getEditableArea: function () {
            return this.get('container').one('.ez-richtext-editable');
        },

        /**
         * Returns the native CKEditor instance
         *
         * @method _getNativeEditor
         * @protected
         * @return CKEDITOR.editor
         */
        _getNativeEditor: function () {
            return this._editor.get('nativeEditor');
        },

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

            if ( !doc || !doc.documentElement || doc.querySelector("parsererror") ) {
                console.warn(
                    "Unable to parse the content of the RichText field #" + this.get('field').id
                );
                return null;
            }
            return doc;
        },

        /**
         * Serializes the Document to a string
         *
         * @method _serializeFieldValue
         * @protected
         * @return {String}
         */
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
            return {xml: this._getNativeEditor().getData()};
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});
