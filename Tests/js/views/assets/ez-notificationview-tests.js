/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationview-tests', function (Y) {
    var viewTest, stateTest, textTest, closeTest, activeTest, vanishTest,
        autohideTest,
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
            this.state = 'playing';
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: this.state,
            });
            this.view = new Y.eZ.NotificationView({
                notification: this.notification,
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should destroy the corresponding notification model": function () {
            var that = this;

            this.notification.on('destroy', function () {
                that.resume();
            });
            this.view.get('container').one('a').simulateGesture('tap');
            this.wait();
        },
    });

    activeTest = new Y.Test.Case({
        name: "eZ Notification View active test",

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

        "Should add the active class on the container": function () {
            this.view.set('active', true);

            Assert.isTrue(
                this.view.get('container').hasClass('is-active'),
                "The view container should get the is-active class"
            );
        },

        "Should remove the active class on the container": function () {
            this["Should add the active class on the container"]();
            this.view.set('active', false);

            Assert.isFalse(
                this.view.get('container').hasClass('is-active'),
                "The view container should not get the is-active class"
            );
        },
    });

    vanishTest = new Y.Test.Case({
        name: "eZ Notification View vanish test",

        setUp: function () {
            this.notification = new Y.eZ.Notification({
                identifier: 'something-from-nothing',
                text: 'Playing Foo Fighters - Something from nothing',
                state: 'playing',
            });
            this.view = new Y.eZ.NotificationView({
                notification: this.notification,
                container: '.container2',
                active: true,
            });
            this.view.render();
        },

        "Should destroy the view after the transition": function () {
            this.view.on('destroy', Y.bind(function () {
                this.resume(function () {
                    Assert.isFalse(
                        this.view.get('active'),
                        "active should be set to false"
                    );
                });
            }, this));
            this.view.vanish();
            this.wait();
        },
    });

    autohideTest = new Y.Test.Case({
        name: "eZ Notification View active test",

        setUp: function () {
            this.identifier = 'dani-california';
            this.timeout = 0.2;
            this.notification = new Y.eZ.Notification({
                identifier: this.identifier,
                text: 'Playing Red Hot Chili Peppers - Dani California',
                state: 'playing',
                timeout: this.timeout,
            });
            this.view = new Y.eZ.NotificationView({
                notification: this.notification,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.notification.destroy();
        },

        "Should autohide the notification": function () {
            this.notification.once('destroy', Y.bind(function () {
                this.resume();
            }, this));
            this.view.render();
            this.view.set('active', true);
            this.wait();
        },

        "Should not autohide the notification": function () {
            var subscription;

            subscription = this.notification.on('destroy', Y.bind(function () {
                Y.fail("The notification should not be destroyed");
            }, this));
            this.notification.set('timeout', 0);
            this.view.render();
            this.view.set('active', true);
            setTimeout(Y.bind(function () {
                this.resume(function () {
                    subscription.detach();
                });
            }, this), this.timeout + 0.1);
            this.wait();
        },

        "Should cancel the autohide of the notification": function () {
            var subscription;

            subscription = this.notification.on('destroy', Y.bind(function () {
                Y.fail("The notification should not be destroyed");
            }, this));
            this.view.render();
            this.view.set('active', true);
            this.notification.set('timeout', 0);
            setTimeout(Y.bind(function () {
                this.resume(function () {
                    subscription.detach();
                });
            }, this), this.timeout + 0.1);
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Notification View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(stateTest);
    Y.Test.Runner.add(textTest);
    Y.Test.Runner.add(closeTest);
    Y.Test.Runner.add(activeTest);
    Y.Test.Runner.add(vanishTest);
    Y.Test.Runner.add(autohideTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-notificationview']});
