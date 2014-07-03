/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
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
        _testValue: function (fieldValue, templateValue, msg, assertFunc) {
            var origTpl = this.view.template;

            if ( !assertFunc ) {
                assertFunc = Y.Assert.areSame;
            }
            this.view.set('field', {fieldValue: fieldValue});
            this.view.template = function (variables) {
                assertFunc(templateValue, variables.value, msg);
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        _testIsEmpty: function (field, expectedIsEmpty, msg) {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.areSame(
                    expectedIsEmpty, variables.isEmpty, msg
                );
                return origTpl.apply(this, arguments);
            };
            this.view.set('field', field);
            this.view.render();

            if ( expectedIsEmpty ) {
                Y.Assert.isTrue(
                    this.view.get('container').hasClass('ez-fieldview-is-empty'),
                    "The view container should have the class 'ez-fieldview-is-empty'"
                );
            } else {
                Y.Assert.isFalse(
                    this.view.get('container').hasClass('ez-fieldview-is-empty'),
                    "The view container should NOT have the class 'ez-fieldview-is-empty'"
                );
            }
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

        "Test default field view class on the view container": function () {
            this.view.render();

            Y.Assert.isTrue(
                this.view.get('container').hasClass('ez-view-fieldview'),
                "The view container should have the default fieldview class"
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
                    "The fieldDefinition should be available in the field view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field view template"
                );

                Y.Assert.areSame(
                    that.isEmpty, variables.isEmpty,
                    "The 'isEmpty' variable should be available in the template"
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
