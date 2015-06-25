/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-barview-tests', function (Y) {
    var viewTest, sameTemplateTest, eventsTest, destroyTest;

    viewTest = new Y.Test.Case({
        name: "eZ Bar View test",

        setUp: function () {
            this.content = {};
            this.view = new Y.eZ.BarView({
                container: '.container',
                content: this.content,
                actionsList: [
                    new Y.eZ.ButtonActionView({
                        actionId: "publish",
                        label: "Publish",
                        priority: 0
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "save",
                        label: "Save",
                        priority: 100,
                        hint: "the test hint"
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId: "discard",
                        label: "Discard changes",
                        priority: 200
                    })
                ]
            });
        },

        tearDown: function () {
            this.view.destroy();
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
            Y.Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the this.view"
            );
        },

        "Test available variable in template while render() call": function () {
            var origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(1, Y.Object.keys(variables).length, "The template should receive 1 variable");
                Y.Assert.isString(
                    variables.viewMoreText,
                    "View more text label should be available in the template and should be a string"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "During initialization should sort actions by priority in descending order": function () {
            Y.Assert.isTrue(
                this.view.get('actionsList')[0].get('actionId') == "discard",
                "Discard action should become first according to it's priority after sorting"
            );
        },

        "Should set Content attribute for each of the actionViews, once setting it for itself": function () {
            this.view.set('content', this.content);

            Y.Array.each(this.view.get('actionsList'), function (actionView) {
                Y.Assert.areSame(
                    actionView.get('content'), this.content,
                    "Each of the action views should set correct content attribute"
                );
            }, this);
        },

        "Should add actions to actions list": function () {
            this.view.addAction(
                new Y.eZ.ButtonActionView({
                    actionId: "test",
                    label: "Test",
                    priority: 150,
                    hint: "the test hint"
                })
            );

            Y.Assert.isTrue(
                this.view.get('actionsList').length == 4,
                "New action should have been added to list"
            );
        },

        "Should remove actions from actions list if they exist and return false otherwise": function () {
            this.view.removeAction("save");

            Y.Assert.isTrue(
                this.view.get('actionsList').length == 2,
                "The target action should have been removed from list"
            );
            Y.Assert.isTrue(
                this.view.removeAction("imnotthere") === false,
                "The view should return false if action is not found"
            );
        },

        "Should get action from actionsList": function () {
            Y.Assert.areSame(
                this.view.getAction("save"), this.view.get('actionsList')[1],
                "Should get the actionView"
            );
        },

        "'View more' button should NOT be visible, when all the actions fit on the screen": function () {
            this.view.render();
            this.view.set('active', true);
            Y.Assert.isTrue(
                Y.one('.view-more-button').hasClass('is-hidden'),
                "Button should NOT be visible"
            );
        },

        "'View more' button should become visible, when all the actions don't fit on the screen": function () {
            var counter;

            for (counter = 0; counter < 30; counter++) {
                this.view.addAction(
                    new Y.eZ.ButtonActionView({
                        actionId: "test" + counter,
                        label: "Test",
                        priority: 100,
                        hint: "the test hint"
                    })
                );
            }

            this.view.render();
            this.view.set('active', true);
            Y.Assert.isFalse(
                Y.one('.view-more-button').hasClass('is-hidden'),
                "Button should be visible"
            );
        },

        "Should pull actions from viewMore menu when main menu is shorter than the screen size": function () {
            var container = this.view.get('container'),
                activeMenu;

            this.view.render();

            activeMenu = container.one('.active-actions');

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should be 3 actions in activeMenu initially"
            );

            // Cheating here, but no other way around, since we are not able to resize the screen from script
            this.view._pushLastActionToViewMore();

            Y.Assert.areEqual(
                2, activeMenu.get('children').size(),
                "There should be 2 actions in activeMenu"
            );

            this.view.set('active', true);

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should be 3 actions in activeMenu"
            );
        },

        "When pushing actions to viewMore menu, nothing should happen, when out of active actions": function () {
            var container = this.view.get('container'),
                activeMenu,
                viewMoreMenu;

            this.view.render();
            activeMenu = container.one('.active-actions');
            viewMoreMenu = container.one('.view-more-actions');

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should be 3 actions in activeMenu initially"
            );

            this.view._pushLastActionToViewMore();
            this.view._pushLastActionToViewMore();
            this.view._pushLastActionToViewMore();

            Y.Assert.areEqual(
                0, activeMenu.get('children').size(),
                "There should become 0 actions in activeMenu"
            );
            Y.Assert.areEqual(
                3, viewMoreMenu.get('children').size(),
                "There should become 3 actions in viewMoreMenu"
            );

            this.view._pushLastActionToViewMore();

            Y.Assert.areEqual(
                0, activeMenu.get('children').size(),
                "There should remain 0 actions in activeMenu"
            );
            Y.Assert.areEqual(
                3, viewMoreMenu.get('children').size(),
                "There should remain 3 actions in viewMoreMenu"
            );
        },

        "When pulling actions from viewMore menu, nothing should happen, when out of viewMore actions": function () {
            var container = this.view.get('container'),
                activeMenu,
                viewMoreMenu;

            this.view.render();
            activeMenu = container.one('.active-actions');
            viewMoreMenu = container.one('.view-more-actions');

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should be 3 actions in activeMenu initially"
            );

            this.view._pushLastActionToViewMore();
            this.view._pushLastActionToViewMore();
            this.view._pushLastActionToViewMore();

            Y.Assert.areEqual(
                0, activeMenu.get('children').size(),
                "There should become 0 actions in activeMenu"
            );
            Y.Assert.areEqual(
                3, viewMoreMenu.get('children').size(),
                "There should become 3 actions in viewMoreMenu"
            );

            this.view._pullFirstActionFromViewMore();
            this.view._pullFirstActionFromViewMore();
            this.view._pullFirstActionFromViewMore();

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should become 0 actions in activeMenu"
            );
            Y.Assert.areEqual(
                0, viewMoreMenu.get('children').size(),
                "There should become 3 actions in viewMoreMenu"
            );

            this.view._pullFirstActionFromViewMore();

            Y.Assert.areEqual(
                3, activeMenu.get('children').size(),
                "There should remain 0 actions in activeMenu"
            );
            Y.Assert.areEqual(
                0, viewMoreMenu.get('children').size(),
                "There should remain 3 actions in viewMoreMenu"
            );
        },

        "Should open additional menu when tapping 'View more' button": function () {
            var viewMoreButton, viewMoreMenu, counter, that = this;

            for (counter = 0; counter < 30; counter++) {
                this.view.addAction(new Y.eZ.ButtonActionView({
                    actionId: "test" + counter,
                    label: "Test",
                    priority: 100,
                    hint: "the test hint"
                }));
            }

            this.view.render();
            this.view.set('active', true);

            viewMoreButton = Y.one('.view-more-button');
            viewMoreMenu = Y.one('.view-more-actions');

            Y.Assert.isTrue(
                viewMoreMenu.hasClass('is-hidden'),
                "Additional menu should NOT be visible before the tap"
            );

            viewMoreButton.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(
                        !viewMoreMenu.hasClass('is-hidden'),
                        "Additional menu should be visible after the tap"
                    );
                });
            });

            this.wait();
        },

        "Should forward the active flag": function () {
            this.view.set('active', true);

            Y.Array.each(this.view.get('actionsList'), function (action) {
                Y.Assert.isTrue(
                    action.get('active'),
                    "The action view should be active"
                );
            });
        },
    });

    sameTemplateTest = new Y.Test.Case({
        name: "Class based on eZ Bar View use the same template",

        setUp: function () {
            var Extended = Y.Base.create('extendedBarView', Y.eZ.BarView, [], {});

            this.barView = new Y.eZ.BarView();
            this.extendedView = new Extended();
        },

        tearDown: function () {
            this.barView.destroy();
            this.extendedView.destroy();
        },

        "Views extending BarView should use the same template as BarView": function () {
            Y.Assert.areEqual(
                this.barView.render().get('container').get('innerHTML'),
                this.extendedView.render().get('container').get('innerHTML'),
                "The compiled template should be the same"
            );
        }
    });

    eventsTest = new Y.Test.Case({
        name: "Events bubbling",

        setUp: function () {
            this.button = new Y.eZ.ButtonActionView({actionId: "publish"});
            this.view = new Y.eZ.BarView({
                actionsList: [this.button]
            });
        },

        tearDown: function () {
            this.button.destroy();
            this.view.destroy();
        },

        "Events from the button should bubble to the bar view": function () {
            var bubbled = false;

            this.view.on('*:publishAction', function () {
                bubbled = true;
            });

            this.button.fire('publishAction');
            Y.Assert.isTrue(
                bubbled,
                "The button action view event should bubble to its bar view"
            );
        },

        "Events from the button should bubble to the bar view after being added": function () {
            var bubbled = false,
                button = new Y.eZ.ButtonActionView({actionId: "added"});

            this.view.addAction(button);
            this.view.on('*:addedAction', function () {
                bubbled = true;
            });

            this.button.fire('addedAction');
            Y.Assert.isTrue(
                bubbled,
                "The button action view event should bubble to its bar view"
            );
        },

        "Events from the button should NOT bubble to the bar view after being removed": function () {
            this.view.removeAction('publish');
            this.view.on('*:publishAction', function () {
                Y.Assert.fail(
                    "The event should not bubbled since the button was removed from the bar view"
                );
            });
            this.button.fire('publishAction');
        },
    });

    destroyTest = new Y.Test.Case({
        name: "eZ Bar View destroy test",

        setUp: function () {
            this.view = new Y.eZ.BarView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getButtonMock: function () {
            var button;

            button = new Y.Mock();
            Y.Mock.expect(button, {
                method: 'addTarget',
                args: [this.view]
            });
            Y.Mock.expect(button, {
                method: 'get',
                args: ['priority'],
                returns: 0
            });
            Y.Mock.expect(button, {
                method: 'removeTarget',
                args: [this.view]
            });
            Y.Mock.expect(button, {
                method: 'destroy'
            });
            return button;
        },

        "Should destroy the button action views": function () {
            var button1 = this._getButtonMock(),
                button2 = this._getButtonMock();


            this.view.addAction(button1);
            this.view.addAction(button2);

            this.view.destroy();
            Y.Mock.verify(button1);
            Y.Mock.verify(button2);
        },
    });

    Y.Test.Runner.setName("eZ Bar View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(sameTemplateTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(destroyTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-barview', 'ez-buttonactionview']});
