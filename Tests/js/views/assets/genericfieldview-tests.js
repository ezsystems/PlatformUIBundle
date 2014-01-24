YUI.add('ez-genericfieldview-tests', function (Y) {

    Y.namespace('eZ.Test');

    // generic tests to apply to any field view
    // to work, those tests expect the test case to have the following
    // properties:
    // * this.view refers to the tested view
    // * this.templateVariablesCount contains the number of variables available
    // in the template
    // * this.fieldDefinition contains the field definition
    Y.eZ.Test.FieldViewTestCases = {
        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template has not been used");
        },

        "Test class on the view container": function () {
            this["Test render"]();
            Y.Assert.isTrue(
                this.view.get('container').hasClass(
                    'ez-fieldview-' + this.fieldDefinition.fieldType.toLowerCase()
                ),
                "The view container should have a class build with the field type"
            );
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(
                    that.templateVariablesCount, Y.Object.keys(variables).length,
                    "The template should receive " + that.templateVariablesCount + " variables"
                );

                Y.Assert.areSame(
                     that.fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    };

    Y.eZ.Test.RegisterFieldViewTestCases = {
        "Should autoregister the field view": function () {
            var ViewType = this.viewType,
                viewKey = this.viewKey,
                viewName = ViewType.NAME;

            Y.Assert.areSame(
                ViewType, Y.eZ.FieldView.getFieldView(viewKey),
                "The constructor of " + viewName + " should be registered under " + viewKey + " key"
            );
        }
    };
});
