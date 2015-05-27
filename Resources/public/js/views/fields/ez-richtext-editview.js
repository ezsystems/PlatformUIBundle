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
        events: {
            '.ez-richtext-input-ui textarea': {
                'blur': 'validate',
                'valuechange': 'validate'
            }
        },

        initializer: function () {
            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this._editor = Y.eZ.AlloyEditor.editable(
                        this._getEditableArea().get('id')
                    );
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

        _serializeFieldValue: function () {
            var doc = (new DOMParser()).parseFromString(this.get('field').fieldValue.xhtml5edit, "text/xml");

            // TODO error handling
            //doc.documentElement.setAttribute('xmlns', 'http://ez.no/namespaces/ezpublish5/xhtml5/edit');
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
            var val = {
                    xml: this._getEditableArea()
                            .one('section')
                            .setAttribute('xmlns', 'http://ez.no/namespaces/ezpublish5/xhtml5/edit')
                            .get('outerHTML')
                };

            return val;
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RichTextEditView
    );
});
