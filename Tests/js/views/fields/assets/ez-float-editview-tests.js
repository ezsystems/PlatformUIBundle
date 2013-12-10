YUI.add('ez-float-editview-tests', function (Y) {
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
        name: "eZ Float View test",

        _getFieldDefinition: function (required, minFloatValue, maxFloatValue) {
            return {
                isRequired: required,
                validatorConfiguration: {
                    FloatValueValidator: {
                        minFloatValue: minFloatValue,
                        maxFloatValue: maxFloatValue
                    }
                }
            };
        },

        setUp: function () {
            this.view = new Y.eZ.FloatEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, minFloatValue, maxFloatValue, expectRequired, expectMinFloatValue, expectMaxFloatValue) {
            var fieldDefinition = this._getFieldDefinition(required, minFloatValue, maxFloatValue);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

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
                Y.Assert.areSame(expectMinFloatValue, variables.minFloatValue);
                Y.Assert.areSame(expectMaxFloatValue, variables.maxFloatValue);

                return '';
            };
            this.view.render();
        },

        "Test not required field with no other constrains": function () {
            this._testAvailableVariables(false, false, false, false, false, false);
        },

        "Test required field with no other constrains": function () {
            this._testAvailableVariables(true, false, false, true, false, false);
        },

        "Test required field with constrains": function () {
            this._testAvailableVariables(true, -10, 10, true, -10, 10);
        },

        "Test not required field with constrains": function () {
            this._testAvailableVariables(false, -10, 10, false, -10, 10);
        },

        "Test float validation": function () {
            var fieldDefinition = this._getFieldDefinition(true, -10, 10),
                input;

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.render();

            input = Y.one('.container input');

            input.set('value', '');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An error if float is required but NOT present"
            );

            input.set('value', '1s33');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An invalid float is NOT valid"
            );

            input.set('value', 's1.33');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "An invalid float is NOT valid"
            );

            input.set('value', '11');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Overflowing value is NOT valid"
            );

            input.set('value', '-11');
            this.view.validate();
            Y.Assert.isFalse(
                this.view.isValid(),
                "Underflowing value is NOT valid"
            );

            input.set('value', '1.33');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A valid float is valid"
            );

            input.set('value', '-1');
            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "A valid float is valid"
            );

        }

    });

    Y.Test.Runner.setName("eZ Float Edit View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.viewType = Y.eZ.FloatEditView;
    registerTest.viewKey = "ezfloat";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'ez-float-editview']});
