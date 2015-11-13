/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dateandtime-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest, getEmptyFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ date and time editView test",

        _getFieldDefinition: function (required, hasSeconds) {
            return {
                isRequired: required,
                fieldSettings: {
                    useSeconds: hasSeconds
                }
            };
        },

        setUp: function () {
            this.field = {fieldValue: {timestamp: 595956555}};
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.contentType = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.DateAndTimeEditView({
                container: '.container',
                field: this.field,
                content: this.content,
                version: this.version,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired, useSeconds, expectUsingSeconds) {
            var fieldDefinition = this._getFieldDefinition(required, useSeconds),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(9, Y.Object.keys(variables).length, "The template should receive 9 variables");

                Y.Assert.areSame(
                    that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );

                Y.Assert.areSame(expectRequired, variables.isRequired);
                return '';
            };
            this.view.render();
        },

        "Test not required field without seconds": function () {
            this._testAvailableVariables(false, false, false, false);
        },

        "Test required field without seconds": function () {
            this._testAvailableVariables(true, true, false, false);
        },

        "Test required field using seconds": function () {
            this._testAvailableVariables(true, true, true, true);
        },

        "Test not required field using seconds": function () {
            this._testAvailableVariables(false, false, true, true);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A empty input is valid"
            );

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
            Y.Assert.isFalse(
                this.view.get('errorStatus'),
                "the error status should be converted to false"
            );
        },

        "Test validate required": function () {
            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
            Y.Assert.isFalse(
                this.view.get('errorStatus'),
                "the error status should be converted to false"
            );

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },

        "Test validate use seconds": function () {
            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An input with seconds is valid"
            );
        },

        "Test validate when date and time don't have valid inputs ": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };

            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-32-65');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '69:75:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Bad inputs for time and date are invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                1,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when required and date and time don't have valid inputs ": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-32-65');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '69:75:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Bad inputs for time and date are invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                1,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when required and date don't have valid input ": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-32-65');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Bad inputs for time and date are invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                3,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when required and time don't have valid input ": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };

            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-08-09');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:79');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Bad inputs for time and date are invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                5,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when required and date is missing": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                8,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when required and time is missing": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingTime: true
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Missing time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                7,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when time is missing": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingTime: true
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Missing time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                5,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when date is missing": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingDate: true
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                3,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate required when date and time are missing": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingDate: true
                };
            };

            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingTime: true
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                6,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate required when date has bad input and time is missing": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingTime: true
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', 'hghgyyyy');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                2,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate required when time has bad input and date is missing": function () {

            var fieldDefinition = this._getFieldDefinition(true, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingDate: true
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '99:99:99');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                4,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when date has bad input": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1215-898-hhih');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:10');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                3,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when time has bad input": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-08');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '10:jkjkj');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                5,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when date has bad input and time is missing": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingDate: false
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingTime: true
                };
            };

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '1986-09-99');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                9,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },

        "Test validate when time has bad input and date is missing": function () {

            var fieldDefinition = this._getFieldDefinition(false, false),
                inputDate,
                inputTime;

            this.view._getDateInputValidity = function () {
                return {
                    badInput: false,
                    valueMissing: true,
                    platformMissingDate: true
                };
            };
            this.view._getTimeInputValidity = function () {
                return {
                    badInput: true,
                    valueMissing: false,
                    platformMissingTime: false
                };
            };
            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', 'gfhfj');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "missing date and time is invalid"
            );
            Y.Assert.areSame(
                this.view.get('validateError'),
                10,
                "the number of the error message should match"
            );
            Y.Assert.isString(
                this.view.get('errorStatus'),
                "the error status should be converted to a string"
            );
        },
    });

    Y.Test.Runner.setName("eZ Date and Time Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: false
                }
            },
            ViewConstructor: Y.eZ.DateAndTimeEditView,
            expectedDateValue: '1986-09-08',
            expectedTimeValue: '10:10',

            _setNewValue: function () {
                var c = this.view.get('container');
                c.one('.ez-dateandtime-date-input-ui input').set('value', this.expectedDateValue);
                c.one('.ez-dateandtime-time-input-ui input').set('value', this.expectedTimeValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                var expected = 526558200, // '1986-09-08' '10:10' in UTC
                    tzOffset =  new Date(expected * 1000).getTimezoneOffset() * 60;

                Y.Assert.isObject(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(expected + tzOffset, fieldValue.timestamp, 'the converted date should match the fieldValue timestamp');
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: false
                }
            },
            ViewConstructor: Y.eZ.DateAndTimeEditView,
            expectedDateValue: null,
            expectedTimeValue: null,

            _setNewValue: function () {
                var c = this.view.get('container');
                c.one('.ez-dateandtime-date-input-ui input').set('value', this.expectedDateValue);
                c.one('.ez-dateandtime-time-input-ui input').set('value', this.expectedTimeValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNull(fieldValue, 'the fieldValue should be null');
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Date and time Edit View registration test";
    registerTest.viewType = Y.eZ.DateAndTimeEditView;
    registerTest.viewKey = "ezdatetime";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-dateandtime-editview']});
