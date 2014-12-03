/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dateandtime-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the date and time fields
     *
     * @module ez-dateandtime-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezdatetime';

    /**
     * Date and time edit view
     *
     * @namespace eZ
     * @class DateAndTimeEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.DateAndTimeEditView = Y.Base.create('dateAndTimeEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-dateandtime-date-input-ui input': {
                'blur': 'validate',
                'valuechange': 'validate',
            },
            '.ez-dateandtime-time-input-ui input': {
                'blur': 'validate',
                'valuechange': 'validate',
            }
        },

        /**
         * Validates the current input of date and time field
         *
         * @method validate
         */
        validate: function () {
            var dateValidity = this._getDateInputValidity(),
                timeValidity = this._getTimeInputValidity(),
                badInputDate = false,
                badInputTime = false,
                missingDate = false,
                missingTime = false,
                requiredDate = false,
                requiredTime = false,
                errorNumber = 0,
                errorMessagesStruct = {
                    0: false,
                    1: 'Date and time do not have valid inputs',
                    2: 'Date do not have a valid input and time is required',
                    3: 'Date do not have a valid input',
                    4: 'Time do not have a valid input and date is required',
                    5: 'Time do not have a valid input',
                    6: 'Date and time are required',
                    7: 'Time is required',
                    8: 'Date is required',
                    9: 'Date do not have a valid input and time is missing',
                    10: 'Time do not have a valid input and date is missing'
                };

            if ((dateValidity.platformMissingDate && !timeValidity.platformMissingTime) ||
                (dateValidity.platformMissingDate && timeValidity.badInput)) {
                missingDate = true;
            }
            if (dateValidity.badInput) {
                badInputDate = true;
            }
            if (dateValidity.valueMissing) {
                requiredDate =  true;
            }
            if ((timeValidity.platformMissingTime && ! dateValidity.platformMissingDate) ||
                (timeValidity.platformMissingTime && dateValidity.badInput)) {
                missingTime = true;
            }
            if (timeValidity.badInput) {
                badInputTime = true;
            }
            if (timeValidity.valueMissing) {
                requiredTime =  true;
            }

            if (this.get('fieldDefinition').isRequired) {
                if(badInputTime || badInputDate) {
                    if(badInputTime && badInputDate){
                        errorNumber = 1;
                    } else if (badInputDate) {
                        if(missingTime) {
                            errorNumber = 2;
                        } else {
                            errorNumber = 3;
                        }
                    } else {
                        if (missingDate) {
                            errorNumber = 4;
                        } else {
                            errorNumber = 5;
                        }
                    }
                } else if (requiredDate || requiredTime) {
                    if (requiredDate && requiredTime) {
                        errorNumber = 6;
                    } else if (requiredTime) {
                        errorNumber = 7;

                    } else {
                        errorNumber = 8;
                    }
                }
            } else {
                if(badInputTime || badInputDate) {
                    if(badInputTime && badInputDate){
                        errorNumber = 1;
                    } else if (badInputDate) {
                        if(missingTime) {
                            errorNumber = 9;
                        } else {
                            errorNumber = 3;
                        }
                    } else {
                        if (missingDate) {
                            errorNumber = 10;
                        } else {
                            errorNumber = 5;
                        }
                    }
                } else if (missingDate) {
                    errorNumber = 3;
                } else if (missingTime) {
                    errorNumber = 5;
                }
            }
            this.set('errorStatus', errorMessagesStruct[errorNumber]);
            this._set('validateError', errorNumber);

        },

        /**
         * Defines the variables to import in the field edit template for date and time
         *
         * @protected
         * @method _variables
         * @return {Object} holding the variables for the template
         */
        _variables: function () {
            var def = this.get('fieldDefinition'),
                field = this.get('field'),
                date = '',
                time = '';

            if (field && field.fieldValue && field.fieldValue.timestamp) {
                date = Y.Date.format(new Date(field.fieldValue.timestamp * 1000));
                time = Y.Date.format(new Date(field.fieldValue.timestamp * 1000), {format: "%T"});
            }

            return {
                "isRequired": def.isRequired,
                "html5InputDate": date,
                "html5InputTime": time,
                "useSeconds": def.fieldSettings.useSeconds
            };
        },

        /**
         * Returns the date input node of the dateAndTime template
         *
         *
         * @protected
         * @method __getDateInputNode
         * @return {InputNode}
         */
        _getDateInputNode: function () {
            return this.get('container').one('.ez-dateandtime-date-input-ui input');
        },

        /**
         * Returns the date input node
         * the date template
         *
         *
         * @protected
         * @method __getTimeInputNode
         * @return {InputNode}
         */
        _getTimeInputNode: function () {
            return this.get('container').one('.ez-dateandtime-time-input-ui input');
        },

        /**
         * Returns the input validity state object for the input generated by
         * the date of the date and time template
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @protected
         * @method _getInputValidity
         * @return {ValidityState}
         */
        _getDateInputValidity: function () {
            var platformMissingDate = !this._getDateInputNode().get('valueAsNumber'),
                dateInputValidity = this._getDateInputNode().get('validity');

            dateInputValidity.platformMissingDate = platformMissingDate;

            return dateInputValidity;
        },

        /**
         * Returns the input validity state object for the input generated by
         * the time of the date and time template
         *
         * See https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
         *
         * @protected
         * @method _getInputValidity
         * @return {ValidityState}
         */
        _getTimeInputValidity: function () {
            var platformMissingTime = !this._getTimeInputNode().get('valueAsNumber'),
                timeInputValidity = this._getTimeInputNode().get('validity');

            timeInputValidity.platformMissingTime = platformMissingTime;

            return timeInputValidity;
        },

        /**
         * Returns the currently filled date and time value
         *
         * @protected
         * @method _getFieldValue
         * @return {Object}
         */
        _getFieldValue: function () {
            var valueOfDateInput = this._getDateInputNode().get('valueAsNumber'),
                valueOfTimeInput = this._getTimeInputNode().get('valueAsNumber');

            if (valueOfDateInput && valueOfTimeInput){
                return {timestamp: ( valueOfDateInput + valueOfTimeInput )/1000};
            } else {
                return null;
            }

        },

    },{
        ATTRS: {
            /**
             * The number of the validate error
             *
             * @attribute validateError
             * @protected
             * @readOnly
             */
            validateError: null
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(FIELDTYPE_IDENTIFIER, Y.eZ.DateAndTimeEditView);
});
