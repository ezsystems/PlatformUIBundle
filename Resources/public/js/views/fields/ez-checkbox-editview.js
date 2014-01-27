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
                "defaultValue": def.defaultValue
            };
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.CheckboxEditView
    );
});
