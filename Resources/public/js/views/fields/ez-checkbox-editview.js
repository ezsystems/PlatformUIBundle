/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-checkbox-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Checkbox (ezboolean) fields
     *
     * @module ez-checkbox-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezboolean';

    /**
     * Checkbox edit view
     *
     * @namespace eZ
     * @class CheckboxEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.CheckboxEditView = Y.Base.create('checkboxEditView', Y.eZ.FieldEditView, [], {
        /**
         * Defines the variables to imported in the field edit template for
         * the checkbox.
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired and defaultValue entries
         */
        _variables: function () {
            var def = this.get('fieldDefinition');
            return {
                "isRequired": def.isRequired,
            };
        },

        /**
         * Returns the current value of the field.
         *
         * @protected
         * @method _getFieldValue
         * @return Boolean
         */
        _getFieldValue: function () {
            var input = this.get('container').one('.ez-checkbox-input-ui input');

            return input.get('checked');
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.CheckboxEditView
    );
});
