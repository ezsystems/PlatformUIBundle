/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-xmltext-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ XmlText View test",

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

            this.view = new Y.eZ.XmlTextEditView({
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
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

                Y.Assert.areSame(
                     that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                     that.jsonVersion, variables.version,
                    "The content should be available in the field edit view template"
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

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test variables for required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validation without constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container textarea');
            input.set('value', 'foobar');
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validation for a required field": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container textarea');

            input.set('value', 'foobar');
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

    Y.Test.Runner.setName("eZ XmlText Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.XmlTextEditView,
            newValue: "Led Zeppelin!",

            _setNewValue: function () {
                this.view.get('container').one('textarea').set('value', this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.areSame(this.newValue, fieldValue.xml, msg);
            },

        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "XmlText Edit View registration test";
    registerTest.viewType = Y.eZ.XmlTextEditView;
    registerTest.viewKey = "ezxmltext";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-xmltext-editview']});
