/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuitemfireeventview-tests', function (Y) {
    var renderTest, eventTest, dataTest;

    renderTest = new Y.Test.Case({
        name: "eZ User Menu Item Fire Event render test",

        setUp: function () {
            this.title = "Welcome to the jungle";
            this.view = new Y.eZ.UserMenuItemFireEventView({
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

    eventTest = new Y.Test.Case({
        name: "eZ User Menu Item Fire Event test",

        setUp: function () {
            this.view = new Y.eZ.UserMenuItemFireEventView({
                container: '.container',
                eventName: 'logOut'
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire the configured event": function () {
            var container = this.view.render().get('container'),
                that = this;

            this.view.on('logOut', function (e) {
                that.resume(function () {
                    Y.Assert.areEqual(
                        'tap', e.originalEvent.type,
                        "The original DOM event should be provided in the logOut event facade"
                    );
                    Y.Assert.isTrue(
                        !!e.originalEvent.prevented,
                        "The tap event should have been prevented"
                    );
                });
            });
            container.simulateGesture('tap');
            this.wait();
        },

        "Should hide the user menu": function () {
            var container = this.view.render().get('container'),
                that = this,
                userMenuView = new Y.Mock();

            Y.Mock.expect(userMenuView, {
                method: 'hide',
                args: [Y.Mock.Value.Object]
            });

            this.view.fire('addedToUserMenu', {userMenu: userMenuView});

            this.view.on('logOut', function () {
                that.resume(function () {
                    Y.Mock.verify(userMenuView);
                });
            });

            container.simulateGesture('tap');
            this.wait();
        },
    });

    dataTest = new Y.Test.Case({
        name: "eZ User Menu Item Fire Event data test",

        setUp: function () {
            this.view = new Y.eZ.UserMenuItemFireEventView({
                eventName: 'logOut'
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should pass the event name to the container": function () {
            var container = this.view.get('container');

            Y.Assert.isTrue(
                container.hasAttribute('data-event-name'),
                'Should have a data event name attribute in the container'
            );
            Y.Assert.areEqual(
                this.view.get('eventName'), container.getAttribute('data-event-name'),
                'Should have the correct data event name value in the container'
            );
        },

    });

    Y.Test.Runner.setName("eZ User Menu Item Fire Event View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(dataTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-usermenuitemfireeventview']});
