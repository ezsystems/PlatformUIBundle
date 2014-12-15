/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-date-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest, getEmptyFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ date editView test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {fieldValue: {timestamp: 46564455}};
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

            this.view = new Y.eZ.DateEditView({
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

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

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

                Y.Assert.areSame(
                    expectRequired, variables.isRequired,
                    "the variable for the template isRequired should have the same value that the isRequired field of the fieldDefinition"
                );

                return '';
            };
            this.view.render();
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
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

            input.set('value', '1986-09-08');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
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
        },

        "Test validate required": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '1986-09-08');
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
    });

    Y.Test.Runner.setName("eZ Time Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.DateEditView,
            filledValue: '1986-09-08',
            convertedValue: 526521600,

            _setNewValue: function () {
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue.timestamp, 'the converted date should match the fieldValue timestamp');
            },

        })
    );
    Y.Test.Runner.add(getFieldTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.DateEditView,
            filledValue: null,

            _setNewValue: function () {
                this.view.get('container').one('input').set('value', this.filledValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isNull(fieldValue, 'the fieldValue should be Null');
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Date Edit View registration test";
    registerTest.viewType = Y.eZ.DateEditView;
    registerTest.viewKey = "ezdate";
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-date-editview']});
