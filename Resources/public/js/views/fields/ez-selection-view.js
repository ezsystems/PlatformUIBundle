/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-view', function (Y) {
    "use strict";
    /**
     * Provides the Selection View class
     *
     * @module ez-selection-view
     */
    Y.namespace('eZ');

    /**
     * The selection view
     *
     * @namespace eZ
     * @class SelectionView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.SelectionView = Y.Base.create('selectionView', Y.eZ.FieldView, [], {
        /**
         * Returns the value to be used in the template.
         *
         * @method _getFieldValue
         * @protected
         * @return {Array|String}
         */
        _getFieldValue: function () {
            var fieldValue = this.get('field').fieldValue, res,
                fieldDefinitionSettings = this.get('fieldDefinition').fieldSettings;

            if ( fieldValue.length === 0 ) {
                return res;
            }
            if ( fieldDefinitionSettings.isMultiple ) {
                res = [];
                Y.Array.each(fieldValue, function (key) {
                    if (key in fieldDefinitionSettings.options) {
                        res.push(fieldDefinitionSettings.options[key]);
                    } else {
                        res.push(Y.eZ.trans('select.option.does.not.exist', {}, 'fieldview'));
                    }
                });
            } else {
                if (fieldValue in fieldDefinitionSettings.options) {
                    res = fieldDefinitionSettings.options[fieldValue];
                } else {
                    res = (Y.eZ.trans('select.option.does.not.exist', {}, 'fieldview'));
                }
            }

            return res;
        },

        /**
         * Returns isMultiple variable in the template
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            return {
                "isMultiple": this.get('fieldDefinition').fieldSettings.isMultiple
            };
        },
    });

    Y.eZ.FieldView.registerFieldView('ezselection', Y.eZ.SelectionView);
});
