/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-time-editview-tests', function (Y) {
    var viewTest,
        registerTest,
        getFieldTest,
        getFieldWithSecondsTest,
        getFieldWithSecondsTestOldBrowsers,
        getEmptyFieldTest,
        getEmptyFieldTestOldBrowsers,
        getFieldWithoutSecondsTestOldBrowsers;

    viewTest = new Y.Test.Case({
        name: "eZ time editView test",

        _getFieldDefinition: function (required, hasSeconds) {
            return {
                isRequired: required,
                fieldSettings: {
                    useSeconds: hasSeconds
                }
            };
        },

        setUp: function () {
            this.field = {fieldValue: 36600};
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

            this.view = new Y.eZ.TimeEditView({
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

        _testAvailableVariables: function (required, expectRequired, useSeconds, expectUsingSeconds, isSupportingTimeInput, fieldValue) {
            var fieldDefinition = this._getFieldDefinition(required, useSeconds),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('supportsTimeInput', isSupportingTimeInput);
            if(!fieldValue){
                this.view.set('field', null);
            }

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
                if (fieldValue){
                    Y.Assert.areSame(
                        that.field, variables.field,
                        "The field should be available in the field edit view template"
                    );
                }

                Y.Assert.areSame(expectRequired, variables.isRequired);
                Y.Assert.areSame(expectUsingSeconds, variables.useSeconds);
                return '';
            };
            this.view.render();
        },

        "Test not required field without seconds": function () {
            this._testAvailableVariables(false, false, false, false, true, true);
        },

        "Test required field without seconds": function () {
            this._testAvailableVariables(true, true, false, false, true, true);
        },

        "Test required field using seconds": function () {
            this._testAvailableVariables(true, true, true, true, true, true);
        },

        "Test not required field using seconds": function () {
            this._testAvailableVariables(false, false, true, true, true, true);
        },

        "Test not required field without seconds old browsers": function () {
            this._testAvailableVariables(false, false, false, false, false, true);
        },

        "Test not required field without seconds old browsers no field value": function () {
            this._testAvailableVariables(false, false, false, false, false, false);
        },

        "Test required field without seconds old browsers": function () {
            this._testAvailableVariables(true, true, false, false, false, true);
        },

        "Test required field using seconds old browsers": function () {
            this._testAvailableVariables(true, true, true, true, false, true);
        },

        "Test not required field using seconds old browsers": function () {
            this._testAvailableVariables(false, false, true, true, false, true);
        },

        "Test validate no constraints old browsers": function () {
            var fieldDefinition = this._getFieldDefinition(false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('supportsTimeInput', false);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container input');
            input.set('value', '');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A empty input is valid"
            );

            /*
             This test can't be done because browser is making a
             pre-validation and is considering a bad input as empty

             input.set('value', 'blbllbl');
             Y.Assert.isFalse(
             this.view.isValid(),
             "the value should be detected as invalid"
             );
             */

            input = Y.one('.container input');
            input.set('value', '10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validate no constraints new browsers": function () {
            var fieldDefinition = this._getFieldDefinition(false, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('supportsTimeInput', true);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container input');
            input.set('value', '');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A empty input is valid"
            );

            /*
             This test can't be done because browser is making a
             pre-validation and is considering a bad input as empty

             input.set('value', 'blbllbl');
             Y.Assert.isFalse(
             this.view.isValid(),
             "the value should be detected as invalid"
             );
             */

            input = Y.one('.container input');
            input.set('value', '10:10');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validate required new browsers": function () {
            var fieldDefinition = this._getFieldDefinition(true, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('supportsTimeInput', true);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },

        "Test validate required old browsers": function () {
            var fieldDefinition = this._getFieldDefinition(true, false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('supportsTimeInput', false);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        },

        "Test validate use seconds": function () {
            var fieldDefinition = this._getFieldDefinition(false, true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '10:10:10');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An input with seconds is valid"
            );

        }
    });

    Y.Test.Runner.setName("eZ Time Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: false
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: '10:10',
            convertedValue: 36600,

            _setNewValue: function () {
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNumber(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue, 'the converted date should match the fieldValue timestamp');
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    getFieldWithoutSecondsTestOldBrowsers = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: true
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: '10:10',
            convertedValue: 36600,

            _setNewValue: function () {
                this.view._set('supportsTimeInput', false);
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNumber(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue, 'the converted date should match the fieldValue timestamp');
            },
        })
    );
    Y.Test.Runner.add(getFieldWithoutSecondsTestOldBrowsers);

    getFieldWithSecondsTestOldBrowsers = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: true
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: '10:10:10',
            convertedValue: 36610,

            _setNewValue: function () {
                this.view._set('supportsTimeInput', false);
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNumber(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue, 'the converted date should match the fieldValue timestamp');
            },
        })
    );
    Y.Test.Runner.add(getFieldWithSecondsTestOldBrowsers);

    getFieldWithSecondsTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: true
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: '10:10:10',
            convertedValue: 36610,

            _setNewValue: function () {
                this.view._set('supportsTimeInput', true);
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNumber(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue, 'the converted date should match the fieldValue timestamp');
            },
        })
    );
    Y.Test.Runner.add(getFieldWithSecondsTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: false
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: null,

            _setNewValue: function () {
                this.view._set('supportsTimeInput', true);
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNull(fieldValue, 'the fieldValue should be null');
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    getEmptyFieldTestOldBrowsers = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    useSeconds: false
                }
            },
            ViewConstructor: Y.eZ.TimeEditView,
            filledValue: null,

            _setNewValue: function () {
                this.view._set('supportsTimeInput', false);
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNull(fieldValue, 'the fieldValue should be null');
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTestOldBrowsers);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Time Edit View registration test";
    registerTest.viewType = Y.eZ.TimeEditView;
    registerTest.viewKey = "eztime";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-time-editview']});
