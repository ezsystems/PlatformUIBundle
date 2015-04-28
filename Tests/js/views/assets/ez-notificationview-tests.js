/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationview-tests', function (Y) {
    var viewTest, stateTest, textTest, destroyTest, closeTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Notification View render test",

        setUp: function () {
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: 'playing',
            });
            this.view = new Y.eZ.NotificationView({
                notification: this.notification,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should use a LI element as container": function () {
            this.view.render();

            Assert.areEqual(
                'LI', this.view.get('container').get('tagName'),
                "The container should be a li element"
            );
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
        },

        "Should provide the notification ot the template": function () {
            var origTpl, that = this;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.isObject(vars.notification, "The template should receive a notification object");
                Assert.areEqual(
                    Y.Object.keys(that.notification.toJSON()).length,
                    Y.Object.keys(vars.notification).length,
                    "The notification object should be the result of toJSON"
                );
                Y.Object.each(that.notification.toJSON(), function (value, key) {
                    Assert.areEqual(
                        value, vars.notification[key],
                        "The notification object should be the resulf of toJSON"
                    );
                });
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    stateTest = new Y.Test.Case({
        name: "eZ Notification View state change test",

        setUp: function () {
            this.container = Y.one('.container');
            this.containerClass = this.container.getAttribute('class');
            this.state = 'playing';
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: this.state,
            });
            this.view = new Y.eZ.NotificationView({
                container: this.container,
                notification: this.notification,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.container.setAttribute('class', this.containerClass).setContent('');
        },

        "Should set the state class": function () {
            this.view.render();
            Assert.isTrue(
                this.view.get('container').hasClass('is-state-' + this.state),
                "The view container should get the state class"
            );
        },

        "Should update the state class": function () {
            var state = 'ended';

            this.notification.set('state', state);
            Assert.isTrue(
                this.view.get('container').hasClass('is-state-' + state),
                "The view container should get the state class"
            );
        },

        "Should remove the state class": function () {
            this.view.render();
            this.notification.set('state', null);
            Assert.isFalse(
                this.view.get('container').hasClass('is-state-' + this.state),
                "The state class should have been removed"
            );
        },
    });
    
    textTest= new Y.Test.Case({
        name: "eZ Notification View text change test",

        setUp: function () {
            this.container = Y.one('.container');
            this.containerClass = this.container.getAttribute('class');
            this.state = 'playing';
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: this.state,
            });
            this.view = new Y.eZ.NotificationView({
                container: this.container,
                notification: this.notification,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.container.setAttribute('class', this.containerClass).setContent('');
        },

        "Should update the text": function () {
            var text = 'Foo Fighters - Congregation';
            this.view.render();
            this.notification.set('text', text);

            Assert.areEqual(
                text,
                this.view.get('container').one('.ez-notification-text').get('text'),
                "The notification text should have been updated"
            );
        },
    });

    closeTest = new Y.Test.Case({
        name: "eZ Notification View close test",

        setUp: function () {
            this.container = Y.one('.container');
            this.initialContainer = this.container.get('outerHTML');
            this.parent = this.container.get('parentNode');
            this.state = 'playing';
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: this.state,
            });
            this.view = new Y.eZ.NotificationView({
                container: '.container',
                notification: this.notification,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.parent.append(this.initialContainer);
        },

        "Should destroy the corresponding notification model": function () {
            var that = this;

            this.notification.on('destroy', function () {
                that.resume();
            });
            this.container.one('a').simulateGesture('tap');
            this.wait();
        },
    });

    destroyTest= new Y.Test.Case({
        name: "eZ Notification View destroy test",

        setUp: function () {
            this.container = Y.one('.container');
            this.initialContainer = this.container.get('outerHTML');
            this.parent = this.container.get('parentNode');
            this.state = 'playing';
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: this.state,
            });
            this.view = new Y.eZ.NotificationView({
                container: this.container,
                notification: this.notification,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.parent.append(this.initialContainer);
        },

        "Should destroy and remove the view container": function () {
            this.view.render();
            this.notification.destroy();

            Assert.isTrue(
                this.view.get('destroyed'),
                "The view should have been destroyed"
            );
            Assert.isFalse(
                this.container.inDoc(),
                "The container should have been removed from the DOM"
            );
        },
    });

    Y.Test.Runner.setName("eZ Notification View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(stateTest);
    Y.Test.Runner.add(textTest);
    Y.Test.Runner.add(destroyTest);
    Y.Test.Runner.add(closeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-notificationview']});
