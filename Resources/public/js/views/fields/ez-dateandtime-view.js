/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dateandtime-view', function (Y) {
    "use strict";
    /**
     * Provides the DateAndTime view
     *
     * @module ez-dateandtime-view
     */
    Y.namespace('eZ');

    /**
     * The DateAndTime field view
     *
     * @namespace eZ
     * @class DateAndTimeView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.DateAndTimeView = Y.Base.create('dateAndTimeView', Y.eZ.FieldView, [], {
        /**
         * Returns the actual value of the date and time field as a formatted
         * string suitable to be displayed to the user. If the field is not
         * filled, it returns an empty string.
         *
         * @method _getFieldValue
         * @protected
         * @return String
         */
        _getFieldValue: function () {
            var date =  this._getDateObject();

            if ( date ) {
                return this._formatDate(date) + ' ' + this._formatTime(date);
            }
            return '';
        },

        /**
         * Formats the date part of the date object according to the locale
         * settings of the browser
         *
         * @method _formatDate
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatDate: function (date) {
            return date.toLocaleDateString();
        },

        /**
         * Formats the time part of the date object according to the locale
         * settings of the browser and to the `useSeconds` field definition
         * settings.
         *
         * @method _formatDate
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatTime: function (date) {
            var options;

            if ( !this.get('fieldDefinition').fieldSettings.useSeconds ) {
                options = {hour: 'numeric', minute: 'numeric'};
            }
            return date.toLocaleTimeString(undefined, options);
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
                return new Date(field.fieldValue.timestamp * 1000);
            }
            return undefined;
        }
    });

    Y.eZ.FieldView.registerFieldView('ezdatetime', Y.eZ.DateAndTimeView);
});
