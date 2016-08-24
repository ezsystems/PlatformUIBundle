/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionsplugin-tests', function (Y) {
    var loadTest, createDraftTest, registerTest,
        deleteDraftEventTest, deleteVersionTest,
        editVersionTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadTest = new Y.Test.Case({
        name: "eZ Versions Plugin load tests",

        setUp: function () {
            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.versions = [];
            this.content = new Mock();

            this.plugin = new Y.eZ.Plugin.Versions({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _setupContentMock: function (error, versions) {
            Mock.expect(this.content, {
                method: 'loadVersionsSortedByStatus',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(error, versions);
                }
            });
        },

        "Should load versions (sorted by status)": function () {
            this._setupContentMock(false, this.versions);

            this.view.fire('loadVersions', {
                content: this.content
            });

            Assert.areSame(
                this.versions,
                this.view.get('versions'),
                "Versions should have been retrieved"
            );
        },

        "Should load versions with no versions": function () {
            this._setupContentMock(false, this.versions);

            this.view.fire('loadVersions', {
                content: this.content
            });

            Assert.isObject(
                this.view.get('versions'),
                "Versions should be an object"
            );

            Assert.isFalse(
                this.view.get('loadingError'),
                "Error should not be set to true"
            );
        },

        "Should handle loading errors": function () {
            var defaultVersionValue = "flea";

            this._setupContentMock(true, this.versions);

            this.view.set('versions', defaultVersionValue);

            this.view.fire('loadVersions', {
                content: this.content
            });

            Assert.areSame(
                defaultVersionValue,
                this.view.get('versions'),
                "Versions should not have been loaded"
            );
            Assert.isTrue(
                this.view.get('loadingError'),
                "Error should be set to true"
            );
        },
    });

    createDraftTest = new Y.Test.Case({
        name: "eZ Versions Plugin create draft tests",

        setUp: function () {
            this.capi = {};
            this.app = {
                navigate: Y.bind(function (param) {
                    Assert.areSame(
                        "truc",
                        param,
                        "Result of routeUri should have been provided to navigate"
                    );

                    this.navigateCalled = true;
                }, this),

                routeUri: Y.bind(function (routeName, routeParams) {
                    Assert.areSame(
                        'editContentVersion',
                        routeName,
                        "The route provided should be 'editContentVersion'"
                    );
                    Assert.areSame(
                        this.contentId,
                        routeParams.id,
                        "The id provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.initialLanguageCode,
                        routeParams.languageCode,
                        "The language code provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.versionId,
                        routeParams.versionId,
                        "The versionsId provided to the route doesn't match"
                    );

                    return "truc";
                }, this)
            };
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.service.set('app', this.app);
            this.content = new Mock();
            this.versionNo = "42";
            this.contentId = "/zinedine/zidane";
            this.contentName = "zidane";
            this.initialLanguageCode = "eng-US";
            this.versionId = "/path/to/version/42";
            this.navigateCalled = false;

            this.plugin = new Y.eZ.Plugin.Versions({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _setupContentMock: function (error) {
            var version = {};

            if(!error) {
                version = new Mock();

                Mock.expect(version, {
                    method: 'get',
                    args: [Mock.Value.String],
                    run: Y.bind(function (attr) {
                        if ( attr === 'id' ) {
                            return this.versionId;
                        } else if ( attr === 'initialLanguageCode' ) {
                            return this.initialLanguageCode;
                        }
                        Y.fail('Unexpected call to get("' + attr + '")');
                    }, this),
                });
            }

            Mock.expect(this.content, {
                method: 'createDraft',
                args: [Mock.Value.Object, this.versionNo, Mock.Value.Function],
                run: function (options,versionId, callback) {
                    callback(error, version);
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'id' ) {
                        return this.contentId;
                    } else if ( attr === 'name' ) {
                        return this.contentName;
                    }
                    Y.fail('Unexpected call to get("' + attr + '")');
                }, this),
            });
        },

        "Should create a draft from archived version and redirect to edit page": function () {

            this._setupContentMock(false);

            this.view.fire('createDraft', {
                content: this.content,
                versionNo: this.versionNo
            });

            Assert.isTrue(
                this.navigateCalled,
                "Navigate should have been called"
            );
        },

        "Should not redirect on load error": function () {
            var notified = false;

            this._setupContentMock(true);

            this.service.on('notify', Y.bind(function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "error", e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isTrue(
                    (e.notification.text.indexOf(this.contentName) >= 0),
                    "The notification text should contain the content name"
                );
                Assert.isTrue(
                    (e.notification.text.indexOf(this.versionNo) >= 0),
                    "The notification text should contain the version Number"
                );
                Assert.areSame(
                    "create-draft-from-archived-" + this.contentId,
                    e.notification.identifier,
                    "The notification identifier should be create-draft-from-archived-" + this.contentId
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            }, this));

            this.view.fire('createDraft', {
                content: this.content,
                versionNo: this.versionNo
            });

            Assert.isFalse(
                this.navigateCalled,
                "Navigate should have been called"
            );

            Assert.isTrue(
                notified,
                "A notification should have been displayed"
            );
        },
    });

    editVersionTest = new Y.Test.Case({
        name: "eZ Versions Plugin create draft tests",

        setUp: function () {
            this.app = {
                navigate: Y.bind(function (param) {
                    Assert.areSame(
                        "truc",
                        param,
                        "Result of routeUri should have been provided to navigate"
                    );

                    this.navigateCalled = true;
                }, this),

                routeUri: Y.bind(function (routeName, routeParams) {
                    Assert.areSame(
                        'editContentVersion',
                        routeName,
                        "The route provided should be 'editContentVersion'"
                    );
                    Assert.areSame(
                        this.contentId,
                        routeParams.id,
                        "The id provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.initialLanguageCode,
                        routeParams.languageCode,
                        "The language code provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.versionId,
                        routeParams.versionId,
                        "The versionsId provided to the route doesn't match"
                    );

                    return "truc";
                }, this)
            };
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('app', this.app);
            this.content = new Mock();
            this.version = new Mock();
            this.versionNo = "42";
            this.contentId = "/zinedine/zidane";
            this.contentName = "zidane";
            this.initialLanguageCode = "eng-US";
            this.versionId = "/path/to/version/42";
            this.navigateCalled = false;

            this.plugin = new Y.eZ.Plugin.Versions({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _setupMocks: function () {
            Mock.expect(this.version, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'id' ) {
                        return this.versionId;
                    } else if ( attr === 'initialLanguageCode' ) {
                        return this.initialLanguageCode;
                    }
                    Y.fail('Unexpected call to get("' + attr + '")');
                }, this),
            });

            Mock.expect(this.content, {
                method: 'get',
                args: ['id'],
                returns: this.contentId,
            });
        },

        "Should redirect to edit page for a given version": function () {
            this._setupMocks();

            this.view.fire('editVersion', {
                content: this.content,
                version: this.version
            });

            Assert.isTrue(
                this.navigateCalled,
                "Navigate should have been called"
            );
        },
    });

    deleteDraftEventTest = new Y.Test.Case({
        name: "eZ Versions Plugin delete draft event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();

            this.plugin = new Y.eZ.Plugin.Versions({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        "Should trigger confirm box open on `deleteVersion` event": function () {
            var confirmBoxOpenTriggered = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.confirmHandler,
                    'The `confirmHandler` param should be function'
                );
                Assert.isFunction(
                    e.config.cancelHandler,
                    'The `cancelHandler` param should be function'
                );
            });

            this.service.fire('deleteVersion', {});

            Assert.isTrue(
                confirmBoxOpenTriggered,
                "The `confirmBoxOpen` event should have been fired"
            );
        },

        "Should call `afterDeleteVersionsCallback` function with FALSE when cancelHandler is triggered": function () {
            var confirmBoxOpenTriggered = false,
                afterDeleteVersionsCallbackCalled = false,
                afterDeleteVersionsCallback = function (versionsRemoved) {
                    afterDeleteVersionsCallbackCalled = true;
                    Assert.isFalse(
                        versionsRemoved,
                        'Callback function should be called with FALSE param'
                    );
                };

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.confirmHandler,
                    'The `confirmHandler` param should be function'
                );
                Assert.isFunction(
                    e.config.cancelHandler,
                    'The `cancelHandler` param should be function'
                );

                e.config.cancelHandler();
            });

            this.service.fire('deleteVersion', {
                versions: [],
                afterDeleteVersionsCallback: afterDeleteVersionsCallback
            });

            Assert.isTrue(
                confirmBoxOpenTriggered,
                "The `confirmBoxOpen` event should have been fired"
            );
            Assert.isTrue(
                afterDeleteVersionsCallbackCalled,
                'Should call afterDeleteVersionsCallback function'
            );
        },
    });

    deleteVersionTest = new Y.Test.Case({
        name: "eZ Versions Plugin delete tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.addTarget(this.service);
            this.capi = new Mock();
            this.contentJson = {
                'id': '/content/The/Memory/Remains',
                'name': 'One',
            };
            this.firstVersion = this._getVersionMock({id: '/first/version'});
            this.secondVersion = this._getVersionMock({id: '/second/version'});
            this.thirdVersion = this._getVersionMock({id: '/third/version'});
            this.content = this._getContentMock(this.contentJson);

            this.service.set('capi', this.capi);
            this.service.set('content', this.content);

            this.plugin = new Y.eZ.Plugin.Versions({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _getContentMock: function (attrs) {
            var contentMock = new Mock();

            Mock.expect(contentMock, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return attrs.id;
                        case 'name':
                            return attrs.name;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute `' + attr + '` from content mock');
                            break;
                    }
                }
            });

            return contentMock;
        },

        _getVersionMock: function (attrs) {
            var versionMock = new Mock();

            Mock.expect(versionMock, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return attrs.id;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute from location mock');
                            break;
                    }
                }
            });

            return versionMock;
        },

        _setupVersionForRemoval: function(versionMockList) {
            var versionsForRemoval = [],
                that = this;

            Y.Array.each(versionMockList, function (versionMockItem) {
                Mock.expect(versionMockItem.object, {
                    method: 'destroy',
                    args: [Mock.Value.Object, Mock.Value.Function],
                    run: function (options, callback) {
                        Assert.areSame(
                            options.api,
                            that.capi,
                            "The CAPI should be passed"
                        );
                        Assert.isTrue(
                            options.remove,
                            "The remove parameter should be set to TRUE"
                        );

                        callback(versionMockItem.error);
                    }
                });

                versionsForRemoval.push(versionMockItem.object);
            });

            return versionsForRemoval;
        },

        _assertStartedNotification: function (notification, nbItems) {
            if (notification.state === 'started') {
                this.startNotificationFired = true;
                Assert.isTrue(
                    (notification.text.indexOf(this.contentJson.name) >= 0),
                    "The notification should contain name of content"
                );
                Assert.isTrue(
                    (notification.identifier.indexOf(this.contentJson.id) >= 0),
                    "The notification identifier should contain id of content"
                );
                Assert.isTrue(
                    (notification.identifier.indexOf(nbItems) >= 0),
                    "The notification identifier should contain number of versions for removal"
                );
                Assert.areEqual(
                    notification.timeout, 5,
                    "The timeout of notification should be set to 5"
                );
            }
        },

        _assertDoneNotification: function (notification, nbItems) {
            if (notification.state === 'done') {
                this.successNotificationFired = true;
                Assert.isTrue(
                    (notification.text.indexOf(this.contentJson.name) >= 0),
                    "The notification should contain name of content"
                );
                Assert.isTrue(
                    (notification.identifier.indexOf(this.contentJson.id) >= 0),
                    "The notification identifier should contain id of content"
                );
                Assert.isTrue(
                    (notification.identifier.indexOf(nbItems) >= 0),
                    "The notification identifier should contain number of versions for removal"
                );
                Assert.areEqual(
                    notification.timeout, 5,
                    "The timeout of notification should be set to 5"
                );
            }
        },

        _assertErrorNotification: function (notification) {
            if (notification.state === 'error') {
                this.errorNotificationFired = true;
            }
        },

        "Should remove versions and fire notifications": function () {
            var afterDeleteVersionsCallbackCalled = false,
                afterDeleteVersionsCallback = function (versionsRemoved) {
                    afterDeleteVersionsCallbackCalled = true;
                    Assert.isTrue(versionsRemoved, 'Callback function should be called with TRUE param');
                },
                versionsForRemoval = this._setupVersionForRemoval([
                    {object:this.firstVersion, error: false},
                    {object:this.secondVersion, error: false}
                ]);

            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            this.service.on('notify', Y.bind(function (e) {
                this._assertStartedNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertDoneNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertErrorNotification(e.notification);
            },this));

            this.service.fire('deleteVersion', {
                versions: versionsForRemoval,
                afterDeleteVersionsCallback: afterDeleteVersionsCallback
            });

            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(this.successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(this.errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isTrue(
                afterDeleteVersionsCallbackCalled,
                'Should call afterDeleteVersionsCallbackCalled function'
            );
        },

        "Should display an error and success message when only one deletion fails": function () {
            var afterDeleteVersionsCallbackCalled = false,
                afterDeleteVersionsCallback = function (versionsRemoved) {
                    afterDeleteVersionsCallbackCalled = true;
                    Assert.isTrue(versionsRemoved, 'Callback function should be called with TRUE param');
                },
                versionsForRemoval = this._setupVersionForRemoval([
                    {object:this.firstVersion, error: false},
                    {object:this.secondVersion, error: true},
                    {object:this.thirdVersion, error: false}
                ]);

            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            this.service.on('notify', Y.bind(function (e) {
                this._assertStartedNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertDoneNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertErrorNotification(e.notification);
            }, this));

            this.service.fire('deleteVersion', {
                versions: versionsForRemoval,
                afterDeleteVersionsCallback: afterDeleteVersionsCallback
            });

            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(this.successNotificationFired, 'Should fire notification with `done` state');
            Assert.isTrue(this.errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(
                afterDeleteVersionsCallbackCalled,
                'Should call afterDeleteVersionsCallbackCalled function'
            );
        },

        "Should display an error message when deleting a single item fails": function () {
            var afterDeleteVersionsCallbackCalled = false,
                afterDeleteVersionsCallback = function (versionsRemoved) {
                    afterDeleteVersionsCallbackCalled = true;
                    Assert.isFalse(versionsRemoved, 'Callback function should be called with FALSE param');
                },
                versionsForRemoval = this._setupVersionForRemoval([
                    {object:this.firstVersion, error: true},
                ]);

            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler();
            });

            this.service.on('notify', Y.bind(function (e) {
                this._assertStartedNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertDoneNotification(
                    e.notification,
                    versionsForRemoval.length
                );

                this._assertErrorNotification(e.notification);

                Assert.isFalse(
                    (e.notification.identifier.indexOf("-error") >= 0),
                    "When all items errored, the notification should replace the `started` one"
                );

            }, this));

            this.service.fire('deleteVersion', {
                versions: versionsForRemoval,
                afterDeleteVersionsCallback: afterDeleteVersionsCallback
            });

            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(this.successNotificationFired, 'Should not fire notification with `done` state');
            Assert.isTrue(this.errorNotificationFired, 'Should fire notification with `error` state');
            Assert.isTrue(
                afterDeleteVersionsCallbackCalled,
                'Should call afterDeleteVersionsCallbackCalled function'
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.Versions;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Versions Load Plugin tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(createDraftTest);
    Y.Test.Runner.add(deleteDraftEventTest);
    Y.Test.Runner.add(deleteVersionTest);
    Y.Test.Runner.add(editVersionTest);
}, '', {requires: ['test', 'view', 'base', 'ez-versionsplugin', 'ez-pluginregister-tests']});
