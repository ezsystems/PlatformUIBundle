/**
 * Created with JetBrains PhpStorm.
 * User: sd
 * Date: 04/11/14
 * Time: 13:49
 * To change this template use File | Settings | File Templates.
 */
/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dateandtime-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ date and time editView test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {};
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

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(8, Y.Object.keys(variables).length, "The template should receive 6 variables");

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

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false),
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
        },

        "Test validate required": function () {
            var fieldDefinition = this._getFieldDefinition(true),
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

            inputDate = Y.one('.container .ez-dateandtime-date-input-ui input');
            inputDate.set('value', '');
            inputTime = Y.one('.container .ez-dateandtime-time-input-ui input');
            inputTime.set('value', '');

            this.view.validate();

            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid"
            );
        }
    });

    Y.Test.Runner.setName("eZ Date and Time Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.DateAndTimeEditView,
            expectedDateValue: '1986-09-08',
            expectedTimeValue: '10:10',
            convertedValue:526521600 + 36600,

            _setNewValue: function () {
                var c = this.view.get('container');
                c.one('.ez-dateandtime-date-input-ui input').set('value', this.expectedDateValue);
                c.one('.ez-dateandtime-time-input-ui input').set('value', this.expectedTimeValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'the fieldValue should be an object');
                Y.Assert.areSame(this.convertedValue, fieldValue.timestamp, 'the converted date should match the fieldValue timestamp')
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Date and time Edit View registration test";
    registerTest.viewType = Y.eZ.DateAndTimeEditView;
    registerTest.viewKey = "ezdatetime";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-dateandtime-editview']});
