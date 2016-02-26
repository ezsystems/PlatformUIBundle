/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userprofileview-tests', function (Y) {
    var renderTest, eventTest, attrTest, userMenuDisplayTest,
        SELECTOR_USER_PROFILE = '.ez-user-profile',
        SELECTOR_OUTSIDE = '.outside',
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ User Profile render test",

        setUp: function () {
            this.userMenuView = new Y.View();
            this.userMock = new Y.Mock();
            this.userJson = {};
            this.userAvatar = {
                uri: 'some-url'
            };
            this.avatarAltText = 'Some alternative text';
            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: this.userJson,
            });
            this.view = new Y.eZ.UserProfileView({
                userMenuView: this.userMenuView,
                container: '.container',
                user: this.userMock,
                avatarAltText: this.avatarAltText
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
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                Y.Assert.areSame(
                    that.avatarAltText, variables.avatarAltText,
                    "The avatar alternative text should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Test available user avatar in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                Y.Assert.areSame(
                    that.avatarAltText, variables.avatarAltText,
                    "The avatar alternative text should be available in the template"
                );
                Y.Assert.areSame(
                    that.userAvatar.uri, variables.userAvatar,
                    "The avatar should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };

            this.view.set('userAvatar', this.userAvatar);
            this.view.render();
        },


    });

    attrTest = new Y.Test.Case({
        name: "eZ User Profile attribute test",

        setUp: function () {
            Y.eZ.UserMenuView = Y.View;
            this.view = new Y.eZ.UserProfileView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UserMenuView;
        },

        "Should set event target to the view": function () {
            var item = this.view.get('userMenuView');

            Y.Assert.areSame(this.view, item.getTargets()[0], 'Should set correct event target');
            Y.Assert.isInstanceOf(Y.eZ.UserMenuView, item, "The user menu view should contain an instance of the constructor");
        },

    });

    userMenuDisplayTest = new Y.Test.Case({
        name: "eZ User Profile attribute test",

        setUp: function () {
            var View = Y.Base.create('userMenuView', Y.View, [], {}, {
                    ATTRS: {
                        displayed: {
                            value: false,
                        }
                    }
                });

            this.menuDisplayedClass = 'is-menu-displayed';
            this.view = new Y.eZ.UserProfileView({
                userMenuView: new View(),
            });
            this.view.get('userMenuView').addTarget(this.view);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should add the menu displayed class": function () {
            this.view.get('userMenuView').set('displayed', true);

            Assert.isTrue(
                this.view.get('container').hasClass(this.menuDisplayedClass),
                "The view container should get a the user menu displayed class"
            );
        },

        "Should remove the menu displayed class": function () {
            this["Should add the menu displayed class"]();
            this.view.get('userMenuView').set('displayed', false);

            Assert.isFalse(
                this.view.get('container').hasClass(this.menuDisplayedClass),
                "The view container should get a the user menu displayed class"
            );
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ User Profile Event test",

        setUp: function () {
            this.isHideCalled = false;
            this.userMenuView = new Y.Mock();
            this.userMock = new Y.Mock();
            this.userJson = {};
            this.avatarAltText = 'Some alternative text';

            Y.Mock.expect(this.userMock, {
                method: 'toJSON',
                returns: this.userJson,
            });
            Y.Mock.expect(this.userMenuView, {
                method: 'render',
                returns: this.userMenuView,
            });
            Y.Mock.expect(this.userMenuView, {
                method: 'get',
                args: ['container'],
                returns: '<div/>',
            });
            Y.Mock.expect(this.userMenuView, {
                method: 'hide',
                run: Y.bind(function () {
                    this.isHideCalled = true;
                }, this)
            });

            this.view = new Y.eZ.UserProfileView({
                userMenuView: this.userMenuView,
                container: '.container',
                user: this.userMock,
                avatarAltText: this.avatarAltText
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should show the user menu": function () {
            var userProfileNode = this.view.render().get('container').one(SELECTOR_USER_PROFILE),
                isToggleDisplayedCalled = false;

            Y.Mock.expect(this.userMenuView, {
                method: 'toggleDisplayed',
                run: function () {
                    isToggleDisplayedCalled = true;
                }
            });

            userProfileNode.simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Y.Assert.isTrue(isToggleDisplayedCalled, 'Should call public `toggleDisplayed` method');
                });
            }, this));

            this.wait();
        },

        "Should hide the user menu after clicked outside": function () {
            Y.one(SELECTOR_OUTSIDE).simulateGesture('tap', Y.bind(function () {
                this.resume(function () {
                    Y.Assert.isTrue(this.isHideCalled, 'Should fire the event');
                });
            }, this));

            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ User Profile View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(attrTest);
    Y.Test.Runner.add(userMenuDisplayTest);
    Y.Test.Runner.add(eventTest);
}, '', {requires: ['test', 'node', 'node-event-simulate', 'ez-userprofileview']});
