/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fieldview-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Field View test",

            setUp: function () {
                this.fieldDefinition = {fieldType: 'SomeThing'};
                this.field = {fieldValue: 'ze value'};
                this.isEmpty = false;
                this.templateVariablesCount = 4;

                this.view = new Y.eZ.FieldView({
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

            "Test class on the view container": function () {
                var container = this.view.get('container');

                this.view.render();
                Y.Assert.isTrue(
                    container.hasClass('ez-fieldview-' + this.fieldDefinition.fieldType.toLowerCase()),
                    "The view container should have a class based on the field type"
                );
            },

            "Test isEmpty variable": function () {
                this._testIsEmpty(
                    {fieldValue: ""}, true,
                    "The 'isEmpty' variable should be true"
                );
            },

            "Test isEmpty variable (2)": function () {
                this._testIsEmpty(
                    {fieldValue: "42"}, false,
                    "The 'isEmpty' variable should be false"
                );
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

}, '', {requires: ['test', 'ez-genericfieldview-tests', 'ez-fieldview']});
