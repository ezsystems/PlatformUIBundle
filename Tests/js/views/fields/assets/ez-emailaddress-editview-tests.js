YUI.add('ez-emailaddress-editview-tests', function (Y) {
    var viewTest, registerTest,
        container = Y.one('.container'),
        content, contentType,
        jsonContent = {}, jsonContentType = {},
        field = {};

    content = new Y.Mock();
    contentType = new Y.Mock();
    Y.Mock.expect(content, {
        method: 'toJSON',
        returns: jsonContent
    });
    Y.Mock.expect(contentType, {
        method: 'toJSON',
        returns: jsonContentType
    });

    viewTest = new Y.Test.Case({
        name: "eZ Email Address View register test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.view = new Y.eZ.EmailAddressEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variable");

                Y.Assert.areSame(
                     jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    field, variables.field,
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
            Y.Assert.isTrue(
                !!this.view.get('errorStatus'),
                "An invalid email is NOT valid"
            );

            input.set('value', 'foobar@foobar.com');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.get('errorStatus'),
                "A valid email is valid"
            );

            input.set('value', '');
            this.view.validate();
            Y.Assert.isTrue(
                !!this.view.get('errorStatus'),
                "An empty input is NOT valid"
            );

        }

    });

    registerTest = new Y.Test.Case({
        name: "eZ Email Address View register test",

        "Should autoregister": function () {
            try {
                Y.Assert.areSame(
                    Y.eZ.EmailAddressEditView,
                    Y.eZ.FieldEditView.getFieldEditView("ezemail"),
                    "The constructor of Y.eZ.EmailAddressEditView should be registered under ezemail key"
                );
            } catch (e) {
                Y.Assert.fail("Y.eZ.EmailAddressEditView is not registered under ezemail key");
            }
        }
    });

    Y.Test.Runner.setName("eZ Email Address Edit View tests");
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['node-event-simulate', 'test', 'ez-emailaddress-editview']});