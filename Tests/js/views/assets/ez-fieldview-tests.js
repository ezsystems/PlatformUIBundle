YUI.add('ez-fieldview-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case({
        name: "eZ Field View test",

        setUp: function () {
            this.fieldDefinition = {fieldType: 'SomeThing'};
            this.field = {fieldValue: 'ze value'};

            this.view = new Y.eZ.FieldView({
                container: '.container',
                fieldDefinition: this.fieldDefinition,
                field: this.field,
            });
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

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");

                Y.Assert.areSame(
                     that.fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
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
    });

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

}, '0.0.1', {requires: ['test', 'ez-fieldview']});
