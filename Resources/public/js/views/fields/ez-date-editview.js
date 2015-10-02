/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-date-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the date fields
     *
     * @module ez-date-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezdate',
        IS_CALENDAR_VISIBLE = 'is-calendar-visible';

    /**
     * Date edit view
     *
     * @namespace eZ
     * @class DateEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.DateEditView = Y.Base.create('dateEditView', Y.eZ.FieldEditView, [],  {
        events: {
            '.ez-date-input-ui input': {
                'blur': '_manualInput',
                'valuechange': '_manualInput',
            },
            '.ez-date-calendar-button': {
                'tap': '_toggleCalendar',
            },
            '.ez-date-cancel-button': {
                'tap': '_cancelDate',
            },
        },

        /**
         * Custom initializer method, it sets the event handling on the
         * errorStatusChange event
         *
         * @method initializer
         */
        initializer: function () {
            this._useStandardFieldDefinitionDescription = false;
            this._syncDateAttribute();
            this.after('fieldChange', this._syncDateAttribute);
            this.after('activeChange', this._initializeCalendarWidget);
            this.after('dateChange', function () {
                this._uiUpdateInput();
                this._uiUpdateCalendar();
                this.validate();
            });
        },

        /**
         * Synchronize Date attribute
         *
         * @method _syncDateAttribute
         * @protected
         */
        _syncDateAttribute: function () {
            var field = this.get('field');

            if (field && field.fieldValue && field.fieldValue.timestamp) {
                this._set('date', Y.Date.format(new Date(field.fieldValue.timestamp * 1000)));
            }
        },

        /**
         * Update the input with the date attribute
         * (for browsers not supporting HTML5 date input )
         *
         * @method _uiUpdateInput
         * @protected
         */
        _uiUpdateInput: function () {
            this._getInputNode().set('value', this.get('date'));
        },

        /**
         * Update the calendar with the date attribute
         * (for browsers not supporting HTML5 date input )
         *
         * @method _uiUpdateCalendar
         * @protected
         */
        _uiUpdateCalendar: function () {
            var calendar = this.get('calendar');

            if (calendar) {
                if (!this._getInputValidity().patternMismatch && Y.Date.parse(this.get('date'))) {
                    calendar.set('date', Y.Date.parse(this.get('date')));
                    calendar.deselectDates();
                    calendar.selectDates([Y.Date.parse(this.get('date'))]);
                } else {
                    calendar.set('date', new Date());
                    calendar.deselectDates();
                }
            }
        },

        /**
         * Check if input is valid and set the date attribute
         * (for browsers not supporting HTML5 date input )
         *
         * @method _manualInput
         * @protected
         */
        _manualInput: function () {
            this._set('date', this._getInputNode().get('value'));
        },

        /**
         * Set the date attribute from the date choose in the custom calendar
         * (for browsers not supporting HTML5 date input )
         *
         * @method _calendarInput
         * @protected
         */
        _calendarInput: function (ev) {
            var dtdate = Y.DataType.Date;

            if (ev.newSelection[0]) {
                this._set('date', dtdate.format(ev.newSelection[0]));
                this.get('container').removeClass(IS_CALENDAR_VISIBLE);
            }
        },

        /**
         * Cancel the current date input
         *
         * @method _cancelDate
         * @protected
         */
        _cancelDate: function (e) {
            e.preventDefault();
            this._set('date', '');
            this.get('container').removeClass(IS_CALENDAR_VISIBLE);
        },

        /**
         * Toggle the YUI calendar
         *
         * @method _toggleCalendar
         * @protected
         */
        _toggleCalendar: function (e) {
            e.preventDefault();
            this.get('container').toggleClass(IS_CALENDAR_VISIBLE);
        },

        /**
         * Validates the current input of date field
         *
         * @method validate
         */
        validate: function () {
            if (this.get('supportsDateInput')) {
                this._supportedDateInputValidate();
            } else {
                this._unsupportedDateInputValidate();
            }
        },

        /**
         * Validation for browsers supporting date input
         *
         * @protected
         * @method _supportedDateInputValidate
         */
        _supportedDateInputValidate: function () {
            var validity = this._getInputValidity();

            if ( validity.valueMissing ) {
                this.set('errorStatus', 'This field is required');
            } else if ( validity.badInput ) {
                this.set('errorStatus', 'This is not a valid input');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Validation for browsers NOT supporting date input
         *
         * @protected
         * @method _unsupportedDateInputValidate
         */
        _unsupportedDateInputValidate: function () {
            var validity = this._getInputValidity();

            if ( validity.valueMissing ) {
                this.set('errorStatus', 'This field is required');
            } else if ( !validity.valueMissing && !this._isDateEmpty() && this._isDateValid() ) {
                this.set('errorStatus', 'This is not a correct date');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Defines the variables to import in the field edit template for date
         *
         * @protected
         * @method _variables
         * @return {Object} holding the variables for the template
         */
        _variables: function () {
            var def = this.get('fieldDefinition');

            return {
                "isRequired": def.isRequired,
                "date": this.get('date'),
                "supportsDateInput": this.get('supportsDateInput')
            };
        },

        /**
         * Check if browser supports
         *
         * @method _detectInputDateSupport
         * @private
         */
        _detectInputDateSupport: function (e) {
            var i = document.createElement("input");

            i.setAttribute("type", "date");
            return i.type === "date";
        },

        /**
         * Initialize the calendar widget for browsers not supporting date input
         *
         * @method _initializeCalendarWidget
         * @private
         */
        _initializeCalendarWidget: function (e) {
            var that = this,
                calendarNode = this.get('container').one('.ez-yui-calendar-container'),
                date = new Date(),
                field = this.get('field'),
                calendar;

            if (this.get('supportsDateInput')) {
                return;
            }
            if (field && field.fieldValue && field.fieldValue.timestamp) {
                date = new Date(field.fieldValue.timestamp * 1000);
            }
            calendar = new Y.Calendar({
                contentBox: calendarNode,
                showPrevMonth: true,
                showNextMonth: true,
                date: date
            });
            calendar.selectDates([date]);
            calendar.render();

            calendar.on("selectionChange", function (ev) {
                that._calendarInput(ev);
            });
            this._set('calendar', calendar);
        },

        /**
         * Check if date input is empty
         *
         * @method _isDateEmpty
         * @private
         */
        _isDateEmpty: function () {
            return this._getInputNode().get('value') === '';
        },

        /**
         * Check if date is valid
         *
         * @method _isDateValid
         * @private
         */
        _isDateValid: function () {
            return (this._getInputValidity().patternMismatch || Y.Date.parse(this._getInputNode().get('value')) === null);
        },

        /**
         * Returns the date input node of the date template
         *
         *
         * @protected
         * @method _getInputNode
         * @return {Y.Node}
         */
        _getInputNode: function () {
            return this.get('container').one('.ez-date-input-ui input');
        },

        /**
         * Returns the input validity state object for the input generated by
         * the date template
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @protected
         * @method _getInputValidity
         * @return {ValidityState}
         */
        _getInputValidity: function () {
            return this._getInputNode().get('validity');
        },

        /**
         * Returns the currently filled date value
         *
         * @protected
         * @method _getFieldValue
         * @return {Number}
         */
        _getFieldValue: function () {
            var valueOfTextInput = Y.Date.parse(this.get('date'));

            if (valueOfTextInput !== null){
                valueOfTextInput= Y.Date.format(valueOfTextInput, {format:"%s"});
                return {timestamp: parseInt(valueOfTextInput, 10)};
            }
            return null;
        },
    },{
        ATTRS: {
            /**
             * Checks if browser supports HTML5 date input
             *
             * @attribute supportsDateInput
             * @readOnly
             */
            supportsDateInput: {
                valueFn: '_detectInputDateSupport',
                readOnly: true
            },

            /**
             * YUI calendar instance
             *
             * @attribute calendar
             * @readOnly
             */
            calendar: {
                readOnly: true
            },

            /**
             * The valid date filled in the input to update the calendar
             *
             * @attribute date
             * @readOnly
             * @type String
             */
            date: {
                readOnly: true
            },
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(FIELDTYPE_IDENTIFIER, Y.eZ.DateEditView);
});
