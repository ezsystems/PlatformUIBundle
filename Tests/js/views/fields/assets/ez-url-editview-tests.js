/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-url-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ Url View test",

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

            this.view = new Y.eZ.UrlEditView({
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

        "Test variables for not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test variables for required URL field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validation for not required URL field": function () {
            var fieldDefinition = this._getFieldDefinition(false),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );

            input = Y.one('.container .ez-url-field-value');
            input.set('value', 'foobar');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A non empty input is valid"
            );
        },

        "Test validation for required URL field": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                input,
                titleInput;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container .ez-url-field-value');
            titleInput = Y.one('.container .ez-url-title-value');

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

            input.set('value', '');
            titleInput.set('value', 'Some title');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is invalid, even when URL title is filled in"
            );
        }
    });

    Y.Test.Runner.setName("eZ Url Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.UrlEditView,
            newValue: {link: "http://ez.no", text: "eZ.no"},

            _setNewValue: function () {
                this.view.get('container').one('.ez-url-field-value').set('value', this.newValue.link);
                this.view.get('container').one('.ez-url-title-value').set('value', this.newValue.text);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.areEqual(this.newValue.link, fieldValue.link, msg);
                Y.Assert.areEqual(this.newValue.link, fieldValue.link, msg);
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Url Edit View registration test";
    registerTest.viewType = Y.eZ.UrlEditView;
    registerTest.viewKey = "ezurl";
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-url-editview']});
