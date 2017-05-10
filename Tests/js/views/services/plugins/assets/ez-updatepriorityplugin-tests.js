/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-updatepriorityplugin-tests', function (Y) {
    var registerTest, updatePriorityTests,
        Assert = Y.Assert, Mock = Y.Mock;

    updatePriorityTests = new Y.Test.Case({
        name: "eZ Update Priority Plugin tests",

        setUp: function () {
            this.capiMock = new Mock();
            this.locationMock = new Mock();
            this.locationId = 'location/2/2/2/2';
            this.priority = 42;
            this.error = false;

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['locationId'],
                returns: this.locationId
            });

            Mock.expect(this.locationMock, {
                method: 'updatePriority',
                args: [Mock.Value.Object, Mock.Value.Number, Mock.Value.Function],
                run: Y.bind(function (options, priority, callback) {
                    Assert.areSame(
                        options.api,
                        this.capiMock,
                        "option should have the JS REST client instance"
                    );
                    Assert.areSame(
                        priority,
                        this.priority,
                        "The priority should be set"
                    );
                    callback(false);
                }, this)
            });

            this.app = new Mock();

            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.set('capi', this.capiMock);
            this.service.set('location', this.locationMock);

            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.UpdatePriority({
                host: this.service,
            });
        },

        _assertOnNotification: function (e, firstState, secondState, firstTimeout, secondTimeout, parentLocationId, locationId) {
            Assert.areEqual(
                firstState, e.notification.state,
                "The notification state should be 'started'"
            );
            Assert.isString(
                e.notification.text,
                "The notification text should be a String"
            );
            Assert.areSame(
                firstTimeout, e.notification.timeout,
                "The notification timeout should be set to 0"
            );
            Assert.areSame(
                'copy-notification-' + parentLocationId + '-' + locationId,
                e.notification.identifier,
                "The notification identifier should match"
            );
            this.plugin.once('notify', function (e) {
                Assert.areEqual(
                    secondState, e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a String"
                );
                Assert.areSame(
                    secondTimeout, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
                Assert.areSame(
                    'update-priority-' + parentLocationId + '-' + locationId,
                    e.notification.identifier,
                    "The notification identifier should match"
                );
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.plugin;
            delete this.service;
            delete this.locationMock;
            delete this.capiMock;
        },

        "Should update the priority on priorityUpdate event": function () {
            Y.Mock.expect(this.locationMock, {
                method: 'updatePriority',
                args: [Mock.Value.Object, Mock.Value.Number, Mock.Value.Function],
                run: Y.bind(function (options, priority, callback) {
                    Assert.areSame(
                        options.api,
                        this.capiMock,
                        "option should have the JS REST client instance"
                    );
                    Assert.areSame(
                        priority,
                        this.priority,
                        "The priority should be set"
                    );
                    callback(false);
                }, this)
            });
            this.service.fire('whatever:updatePriority', {location: this.locationMock, priority: this.priority});
        },

        "Should send a 'error' notification after error when updating priority": function () {
            var notified = false;

            Mock.expect(this.locationMock, {
                method: 'updatePriority',
                args: [Mock.Value.Object, this.priority, Mock.Value.Function],
                run: function (options, priority, cb) {
                    cb(true);
                },
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['locationId'],
                returns: this.locationId,
            });

            this.service.once('notify', Y.bind(function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "error", e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a string"
                );

                Assert.isTrue(
                    e.notification.identifier.indexOf(this.locationId) !== -1,
                    "The notification identifier should contain the locationId"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            }, this));
            this.service.fire('whatever:updatePriority', {location: this.locationMock, priority: this.priority});
            Assert.isTrue(notified, "The notified event should have been fired");
            Mock.verify(this.locationMock);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UpdatePriority;
    registerTest.components = ['locationViewViewService', 'subitemBoxViewService'];

    Y.Test.Runner.setName("eZ Update Priority Plugin tests");
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(updatePriorityTests);
}, '', {requires: ['test', 'view', 'base', 'ez-updatepriorityplugin', 'ez-pluginregister-tests']});

