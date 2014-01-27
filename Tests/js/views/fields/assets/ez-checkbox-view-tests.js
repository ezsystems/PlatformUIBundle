YUI.add('ez-checkbox-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Checkbox View test",

            setUp: function () {
                this.templateVariablesCount = 3;
                this.fieldDefinition = {fieldType: 'ezboolean'};
                this.field = {fieldValue: true};
                this.view = new Y.eZ.CheckboxView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            _testValue: function (fieldValue, templateValue, msg) {
                var origTpl = this.view.template;

                this.view.set('field', {fieldValue: fieldValue});
                this.view.template = function (variables) {
                    Y.Assert.areSame(
                        templateValue, variables.value, msg
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            "Test true value in template": function () {
                this._testValue(true, "Yes", "The value in the template should be 'Yes'");
            },

            "Test false value in template": function () {
                this._testValue(false, "No", "The value in the template should be 'No'");
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Checkbox View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Checkbox View registration test";
    registerTest.viewType = Y.eZ.CheckboxView;
    registerTest.viewKey = "ezboolean";

    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'ez-checkbox-view', 'ez-genericfieldview-tests']});
