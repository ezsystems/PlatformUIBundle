YUI.add('ez-url-editview-tests', function (Y) {
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
        name: "eZ Url View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.view = new Y.eZ.UrlEditView({
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
            var fieldDefinition = this._getFieldDefinition(required),
                origTpl = this.view.template;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variables");

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

                return origTpl.apply(this, arguments);
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

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);

    registerTest.name = "Url Edit View registration test";
    registerTest.viewType = Y.eZ.UrlEditView;
    registerTest.viewKey = "ezurl";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'editviewregister-tests', 'ez-url-editview']});
