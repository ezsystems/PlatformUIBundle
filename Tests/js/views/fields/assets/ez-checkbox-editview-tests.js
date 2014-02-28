YUI.add('ez-checkbox-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest,
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
        name: "eZ Checkbox View test",

        _getFieldDefinition: function (required, defaultValue) {
            return {
                isRequired: required,
                defaultValue: defaultValue
            };
        },

        setUp: function () {
            this.view = new Y.eZ.CheckboxEditView({
                container: container,
                field: field,
                content: content,
                contentType: contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, defaultValue, expectRequired, expectDefaultValue) {
            var fieldDefinition = this._getFieldDefinition(required, defaultValue);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 6 variables");

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
                Y.Assert.areSame(expectDefaultValue, variables.defaultValue);

                return '';
            };
            this.view.render();
        },

        "Test not required field and false default value": function () {
            this._testAvailableVariables(false, false, false, false);
        },

        "Test required field and false default value": function () {
            this._testAvailableVariables(true, false, true, false);
        },

        "Test not required field and true default value": function () {
            this._testAvailableVariables(false, true, false, true);
        },

        "Test required field and true default value": function () {
            this._testAvailableVariables(true, true, true, true);
        }
    });

    Y.Test.Runner.setName("eZ Checkbox Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.CheckboxEditView,
            newValue: true,
        })
    );
    Y.Test.Runner.add(getFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Checkbox Edit View registration test";
    registerTest.viewType = Y.eZ.CheckboxEditView;
    registerTest.viewKey = "ezboolean";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'getfield-tests', 'editviewregister-tests', 'ez-checkbox-editview']});
