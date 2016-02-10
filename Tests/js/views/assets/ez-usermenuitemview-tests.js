/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuitemview-tests', function (Y) {
    var renderTest;

    renderTest = new Y.Test.Case({
        name: "eZ User Menu Item render test",

        setUp: function () {
            this.title = "Welcome to the jungle";
            this.view = new Y.eZ.UserMenuItemView({
                container: '.container',
                title: this.title
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };

            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(1, Y.Object.keys(variables).length, "The template should receive 1 variable");
                Y.Assert.areSame(
                    that.title, variables.title,
                    "The title should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    Y.Test.Runner.setName("eZ User Menu Item View tests");
    Y.Test.Runner.add(renderTest);
}, '', {requires: ['test', 'ez-usermenuitemview']});
