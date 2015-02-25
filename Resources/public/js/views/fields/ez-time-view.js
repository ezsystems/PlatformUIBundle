/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-time-view', function (Y) {
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
    Y.eZ.TimeView = Y.Base.create('timeView', Y.eZ.DateAndTimeView, [], {
        /**
         * Overrides the default implementation to make sure to use the same
         * template as the DateAndTimeView
         *
         * @method _getName
         * @return String
         */
        _getName: function () {
            return Y.eZ.DateAndTimeView.NAME;
        },

        /**
         * Returns the actual value of the time field as a formatted string
         * suitable to be displayed to the user. If the field is not filled, it
         * returns an empty string.
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            var date =  this._getDateObject();

            if ( date ) {
                return this._formatTime(date);
            }
            return '';
        },

        /**
         * Returns a Date object from the field value
         *
         * @method _getDateObject
         * @return {Date}
         */
        _getDateObject: function () {
            var field = this.get('field');

            if ( field && field.fieldValue ) {
                return new Date(field.fieldValue * 1000);
            }
            return undefined;
        },
    });

    Y.eZ.FieldView.registerFieldView('eztime', Y.eZ.TimeView);
});
