YUI.add('ez-fieldview-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Field View test",

            setUp: function () {
                this.fieldDefinition = {fieldType: 'SomeThing'};
                this.field = {fieldValue: 'ze value'};
                this.templateVariablesCount = 3;

                this.view = new Y.eZ.FieldView({
                    container: '.container',
                    fieldDefinition: this.fieldDefinition,
                    field: this.field,
                });
            },

            "Test value in template": function () {
                var origTpl = this.view.template,
                    that = this;

                this.view.template = function (variables) {
                    Y.Assert.areSame(
                        that.field.fieldValue, variables.value,
                        "The field value should be available in the field edit view template"
                    );
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
            },

            tearDown: function () {
                this.view.destroy();
            }
        })
    );

    registerTest = new Y.Test.Case({
        name: "eZ Field View registry test",

        setUp: function () {
            this.registeredFieldType = 'ezsomething';
            this.FieldView = function () { };
            Y.eZ.FieldView.registerFieldView(this.registeredFieldType, this.FieldView);
        },

        "Should return the default field view": function () {
            Y.Assert.areSame(
                Y.eZ.FieldView.getFieldView('not registered'),
                Y.eZ.FieldView,
                "A not registered field type should be handled by the default Y.eZ.FieldView"
            );
        },

        "Should return the registered field view": function () {
            Y.Assert.areSame(
                Y.eZ.FieldView.getFieldView(this.registeredFieldType),
                this.FieldView,
                this.registeredFieldType + " should be handled by its registered view"
            );
        },
    });

    Y.Test.Runner.setName("eZ Field View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(registerTest);

}, '0.0.1', {requires: ['test', 'ez-genericfieldview-tests', 'ez-fieldview']});
