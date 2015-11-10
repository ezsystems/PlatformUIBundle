/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-emailaddress-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ Email Address View test",

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

            this.view = new Y.eZ.EmailAddressEditView({
                container: '.container',
                field: this.field,
                version: this.version,
                content: this.content,
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

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test email validation": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', 'foobar@');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An invalid email is NOT valid"
            );

            input.set('value', 'foobar@foobar');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An invalid email is NOT valid"
            );

            input.set('value', 'foobar@foobar.com');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A valid email is valid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty input is NOT valid"
            );

            this.view.set('fieldDefinition', this._getFieldDefinition(false));
            this.view.render();

            input.set('value', '');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty input is valid"
            );
        },

        "Test validation triggering on change when not valid": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                test = this,
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');
            input.set('value', 'foobar@');
            this.view.validate();

            this.view.validate = function () {
                test.resume(function () {
                    Y.Assert.pass();
                });
            };

            input.simulate('focus');
            input.set('value', 'foooooobar@');

            this.wait();

        },

        "Test validation NOT triggering on change when is valid": function () {
            var fieldDefinition = this._getFieldDefinition(true),
                validateCalled = false,
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');
            input.set('value', 'foobar@something.com');
            this.view.validate();

            this.view.validate = function () {
                validateCalled = true;
            };

            input.simulate('focus');
            input.set('value', 'foooooobar@');

            this.wait(function () {
                Y.Assert.isFalse(validateCalled, 'View validation should NOT have been called');
            }, 200);
        }

    });

    Y.Test.Runner.setName("eZ Email Address Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.EmailAddressEditView,
            newValue: 'damien@example.com',
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Email Address Edit View registration test";
    registerTest.viewType = Y.eZ.EmailAddressEditView;
    registerTest.viewKey = "ezemail";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'event-valuechange', 'node-event-simulate', 'getfield-tests', 'editviewregister-tests', 'ez-emailaddress-editview']});
