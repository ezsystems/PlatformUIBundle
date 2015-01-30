/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationitemview-tests', function (Y) {
    var viewTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Navigation Item View test",

        setUp: function () {
            this.title = "Title";
            this.route = {
                name: "viewLocation",
                params: {
                    id: 42,
                }
            };
            this.view = new Y.eZ.NavigationItemView({
                title: this.title,
                route: this.route,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use a LI element as a container": function () {
            var c = this.view.get('container');

            Assert.areEqual(
                'LI', c.get('tagName'),
                "The container should be li element"
            );
            Assert.isTrue(
                c.hasClass('ez-view-navigationitemview'),
                "The container should have the ez-view-navigationitemview"
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
            Y.Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.areEqual(
                    2, Y.Object.keys(variables).length,
                    "The template should receive 2 variables"
                );
                Y.Assert.areSame(
                    that.title, variables.title,
                    "The template should receive the title"
                );
                Y.Assert.areSame(
                    that.route, variables.route,
                    "The template should receive the route"
                );

                return origTpl.call(this, variables);
            };
            this.view.render();
        },
    });

    Y.Test.Runner.setName("eZ Navigation Item View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-navigationitemview']});
