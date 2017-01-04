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
                return this._formatDateTime(date);
            }
            return '';
        },

        /**
         * Formats the date part of the date object according to the locale
         * settings of the browser
         *
         * @deprecated Since 1.7.1
         * @method _formatDate
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatDate: function (date) {
            console.log('[DEPRECATED] _formatDate is deprecated, use _formatDateTime instead');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
            return date.toLocaleDateString();
        },

        /**
         * Formats the date part of the date object according to the locale
         * settings of the browser
         *
         * @since 1.7.1
         * @method _formatDateTime
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatDateTime: function (date) {
            var options = {year: "numeric", month: "short", day: "numeric", hour: '2-digit', minute: '2-digit'};

            if ( this.get('fieldDefinition').fieldSettings.useSeconds ) {
                options.second = '2-digit';
            }
            return date.toLocaleTimeString(undefined, options);
        },

        /**
         * Formats the time part of the date object according to the locale
         * settings of the browser and to the `useSeconds` field definition
         * settings.
         *
         * @deprecated Since 1.7.1
         * @method _formatTime
         * @protected
         * @param {Date} date
         * @return String
         */
        _formatTime: function (date) {
            console.log('[DEPRECATED] _formatTime is deprecated, use _formatDateTime instead');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
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
         * @return {Date|undefined}
         */
        _getDateObject: function () {
            var field = this.get('field');

            if (this._isFieldEmpty()) {
                return undefined;
            }

            return new Date(field.fieldValue.timestamp * 1000);
        },

        _isFieldEmpty: function () {
            var field = this.get('field');

            return !field || !field.fieldValue || field.fieldValue.timestamp === null || isNaN(field.fieldValue.timestamp);
        },
    });

    Y.eZ.FieldView.registerFieldView('ezdatetime', Y.eZ.DateAndTimeView);
});
