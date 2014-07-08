/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-checkbox-view', function (Y) {
    "use strict";
    /**
     * Provides the Checkbox view
     *
     * @module ez-checkbox-view
     */
    Y.namespace('eZ');

    /**
     * The Checkbox field view
     *
     * @namespace eZ
     * @class CheckboxView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.CheckboxView = Y.Base.create('checkboxView', Y.eZ.FieldView, [], {
        /**
         * Overrides the name to use the generic field view template
         *
         * @method _getName
         * @protected
         * @return String
         */
        _getName: function () {
            return Y.eZ.FieldView.NAME;
        },

        /**
         * Returns the actual value of the checkbox field as a string ('Yes' or
         * 'No').
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            return this.get('field').fieldValue ? 'Yes' : 'No';
        }
    });

    Y.eZ.FieldView.registerFieldView('ezboolean', Y.eZ.CheckboxView);
});
