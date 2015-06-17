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

    var FIELDTYPE_IDENTIFIER = 'ezrichtext',
        AlloyEditor = Y.eZ.AlloyEditor;

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
                    this.get('editor').destroy();
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
            var editor;

            editor = Y.eZ.AlloyEditor.editable(
                this._getEditableArea().getDOMNode(), {
                    toolbars: this.get('toolbarsConfig'),
                }
            );
            editor.get('nativeEditor').on('blur', Y.bind(this.validate, this));
            this._set('editor', editor);
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
            var section = Y.Node.create(this.get('editor').get('nativeEditor').getData());

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
            return {xml: this.get('editor').get('nativeEditor').getData()};
        },
    }, {
        ATTRS: {
            /**
             * The AlloyEditor
             *
             * @attribute editor
             * @type AlloyEditor.Core
             */
            editor: {
                value: null,
                readOnly: true,
            },

            /**
             * AlloyEditor toolbar configuration
             *
             * @attribute toolbarsConfig
             * @type {Object}
             */
            toolbarsConfig: {
                value: {
                    styles: {
                        selections: [{
                            name: 'link',
                            buttons: ['linkEdit'],
                            test: AlloyEditor.SelectionTest.link
                        }, {
                            name: 'text',
                            buttons: [
                                'bold', 'italic', 'underline',
                                'paragraphLeft', 'paragraphCenter', 'paragraphRight', 'paragraphJustify',
                                'ul', 'ol',
                                'link',
                            ],
                            test: AlloyEditor.SelectionTest.text
                        }, {
                            name: 'table',
                            buttons: ['tableRow', 'tableColumn', 'tableCell', 'tableRemove'],
                            getArrowBoxClasses: AlloyEditor.SelectionGetArrowBoxClasses.table,
                            setPosition: AlloyEditor.SelectionSetPosition.table,
                            test: AlloyEditor.SelectionTest.table
                        }],
                        tabIndex: 1
                    }
                }
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});
