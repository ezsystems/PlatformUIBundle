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
         * Returns a timestamps in UTC
         *
         * @deprecated Since 1.7.1
         * @protected
         * @method _getUtcTimeStamp
         * @param {Number} localizedTimestamp
         * @return {Number} Timestamp converted to UTC in millisecond
         */
        _getUtcTimeStamp: function (localizedTimestamp) {
            var tzOffset = new Date(localizedTimestamp).getTimezoneOffset() * 60000;
            return localizedTimestamp + tzOffset;
        },

        /**
         * Formats the time in a human readable format. Locale is not taken into account.
         *
         * @method _formatDate
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatTime: function (date) {
            var options = {hour: '2-digit', minute: '2-digit'};

            if ( this.get('fieldDefinition').fieldSettings.useSeconds ) {
                options.second = '2-digit';
            }
            return date.toLocaleTimeString(undefined, options);
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
            if (this._isFieldEmpty()) {
                return undefined;
            } else {
                return new Date(this.get('field').fieldValue * 1000);
            }
        },

        _isFieldEmpty: function () {
            var field = this.get('field');

            return (!field || field.fieldValue === null || isNaN(field.fieldValue) );

        },
    });

    Y.eZ.FieldView.registerFieldView('eztime', Y.eZ.TimeView);
});
