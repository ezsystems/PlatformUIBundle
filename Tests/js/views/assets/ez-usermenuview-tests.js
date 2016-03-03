/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-usermenuview-tests', function (Y) {
    var renderTest, displayTest, addItemTest, attrTest,
        CLASS_HIDDEN = 'is-user-menu-hidden';

    renderTest = new Y.Test.Case({
        name: "eZ User Menu render test",

        setUp: function () {
            this.userMenuItemFirstView = new Y.View({
                priority: 1
            });
            this.userMenuItemSecondView = new Y.View({
                priority: 2
            });
            this.view = new Y.eZ.UserMenuView({
                items: [this.userMenuItemFirstView, this.userMenuItemSecondView]
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.userMenuItemFirstView.destroy();
            this.userMenuItemSecondView.destroy();
            delete this.view;
            delete this.userMenuItemFirstView;
            delete this.userMenuItemSecondView;
        },

        "Should render the user menu items": function () {
            var container = this.view.render().get('container');

            Y.Assert.areSame(
                2,
                container.get('children').size(),
                'The user menu should have one child'
            );

            Y.Assert.areSame(
                this.userMenuItemSecondView,
                this.view.get('items')[0],
                'Should set as first item view with higher priority'
            );

            Y.Assert.areSame(
                this.userMenuItemFirstView,
                this.view.get('items')[1],
                'Should set as second item view with lower priority'
            );
        },
    });

    addItemTest = new Y.Test.Case({
        name: "eZ User Menu add item test",

        setUp: function () {
            this.userMenuItemFirstView = new Y.View({
                priority: 1
            });
            this.userMenuItemSecondView = new Y.View({
                priority: 2
            });
            this.view = new Y.eZ.UserMenuView({
                items: [this.userMenuItemFirstView]
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.userMenuItemFirstView.destroy();
            this.userMenuItemSecondView.destroy();
            delete this.view;
            delete this.userMenuItemFirstView;
            delete this.userMenuItemSecondView;
        },

        "Should add item to the user menu items": function () {
            var view = this.view,
                userMenuView = this.userMenuItemSecondView,
                eventName = 'logout',
                isEventFired = false,
                isAddedEventFired = false;

            view.on('*:' + eventName, function () {
                isEventFired = true;
            });

            userMenuView.on('addedToUserMenu', function (event) {
                isAddedEventFired = true;

                Y.Assert.areSame(view, event.userMenu, 'The user menu view should be available in the event parameters.');
            });

            view.addMenuItem(userMenuView);

            userMenuView.fire(eventName);

            Y.Assert.areSame(2, this.view.get('items').length, 'Should add menu item to the items attribute');
            Y.Assert.isTrue(isEventFired, "The event should bubble from the item to the hub view");
            Y.Assert.isTrue(isAddedEventFired, "The `addedToUserMenu` event should be fired");

        },
    });

    attrTest = new Y.Test.Case({
        name: "eZ User Menu attribute test",

        setUp: function () {
            Y.eZ.UserMenuItemFireEventView = Y.View;
            this.view = new Y.eZ.UserMenuView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UserMenuItemFireEventView;
        },

        "Should pass the attribute to the view": function () {
            var item = this.view.get('items')[0];

            Y.Assert.areSame('logOut', item.get('eventName'), 'Should pass the correct event name');
            Y.Assert.areSame('Logout', item.get('title'), 'Should pass the correct title');
            Y.Assert.areSame(this.view, item.getTargets()[0], 'Should set correct event target');
        },
    });

    displayTest = new Y.Test.Case({
        name: "eZ User Menu display test",

        setUp: function () {
            this.userMenuItemFireEventView = new Y.View();
            this.view = new Y.eZ.UserMenuView({
                items: [this.userMenuItemFireEventView],
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should show the user menu": function () {
            var view = this.view,
                container = view.render().get('container');

            view.toggleDisplayed();

            Y.Assert.isFalse(container.hasClass(CLASS_HIDDEN), 'The user menu should be visible');
            Y.Assert.isTrue(view.get('displayed'), 'Value of displayed attribute should be true');
        },

        "Should hide the user menu": function () {
            var view = this.view,
                container = view.render().get('container');

            view.toggleDisplayed();
            view.toggleDisplayed();
 
            Y.Assert.isTrue(container.hasClass(CLASS_HIDDEN), 'The user menu should be hidden');
            Y.Assert.isFalse(view.get('displayed'), 'Value of displayed attribute should be false');
        },

        "Should hide the user menu on demand": function () {
            var view = this.view,
                container = view.render().get('container');

            view.toggleDisplayed();
            view.hide();

            Y.Assert.isTrue(container.hasClass(CLASS_HIDDEN), 'The user menu should be hidden');
            Y.Assert.isFalse(view.get('displayed'), 'Value of displayed attribute should be false');
        },
    });

    Y.Test.Runner.setName("eZ User Menu View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(addItemTest);
    Y.Test.Runner.add(attrTest);
    Y.Test.Runner.add(displayTest);
}, '', {requires: ['test', 'ez-usermenuview', 'node-event-simulate']});
