/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationswapplugin-tests', function (Y) {
    var tests, registerTest, swapLocationTest,
        Assert = Y.Assert, Mock = Y.Mock,
        getModelMock = function(attributes) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attributes.hasOwnProperty(attr)) {
                        return attributes[attr];
                    } else {
                        Assert.fail("Unexpected call to get('" + attr + "')");
                    }
                },
            });

             return mock;
        };

    tests = new Y.Test.Case({
        name: "eZ Location Swap Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.locationJsonWithChildren = {
                'id': '/location/Sergio/Aguero',
                'childCount': 5
            };
            this.locationJsonWithoutChildren = {
                'id': '/location/Sergio/Aguero',
                'childCount': 0
            };
            this.containerContentTypeJson = {
                'id': 'contentType',
                'isContainer': true
            };
            this.nonContainerContentTypeJson = {
                'id': 'contentType',
                'isContainer': false
            };

            this.locationWithChildren = getModelMock(this.locationJsonWithChildren);
            this.locationWithoutChildren = getModelMock(this.locationJsonWithoutChildren);
            this.containerContentType = getModelMock(this.containerContentTypeJson);
            this.nonContainerContentType = getModelMock(this.nonContainerContentTypeJson);

            this.plugin = new Y.eZ.Plugin.LocationSwap({
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

        "Should trigger content discovery widget on `swapLocation` event for containers with children": function () {
            var contentDiscoverTriggered = false,
                containerContentType = getModelMock({'isContainer': true}),
                nonContainerContentType = getModelMock({'isContainer': false}),
                destinationLocationWithSameLocationId = getModelMock({'id': '/location/Sergio/Aguero'}),
                destinationLocationWithDifferentLocationId = getModelMock({'id': '/location/Fernando/Torres'});

            this.service.set('location', this.locationWithChildren);
            this.service.set('contentType', this.containerContentType);

            this.service.on('contentDiscover', function (e) {
                contentDiscoverTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.contentDiscoveredHandler,
                    'The `contentDiscoveredHandler` param should be function'
                );
                Assert.isFalse(e.config.multiple, 'The `multiple` param in config should be set to TRUE');
                Assert.isFunction(e.config.isSelectable, 'config should have a function named isSelectable');
                Assert.isFalse(
                    e.config.isSelectable({
                        location: destinationLocationWithSameLocationId,
                        contentType: containerContentType
                    }),
                    "isSelectable should return FALSE if both locations are the same"
                );
                Assert.isTrue(
                    e.config.isSelectable({
                        location: destinationLocationWithDifferentLocationId,
                        contentType: containerContentType
                    }),
                    "isSelectable should return TRUE if locations are not the same, location 1 has children and location 2 is container"
                );
                Assert.isFalse(
                    e.config.isSelectable({
                        location: destinationLocationWithDifferentLocationId,
                        contentType: nonContainerContentType
                    }),
                    "isSelectable should return FALSE if locations are not the same, location 1 has children and location 2 is non container"
                );
            });

            this.service.fire('swapLocation', {location: this.locationWithChildren});

            Assert.isTrue(
                contentDiscoverTriggered,
                "The `contentDiscover` event should have been fired"
            );
        },

        "Should trigger content discovery widget on `swapLocation` event for containers without children": function () {
            var contentDiscoverTriggered = false,
                containerContentType = getModelMock({'isContainer': true}),
                nonContainerContentType = getModelMock({'isContainer': false}),
                destinationLocationWithDifferentLocationId = getModelMock({'id': '/location/Fernando/Torres'});

            this.service.set('location', this.locationWithoutChildren);
            this.service.set('contentType', this.containerContentType);

            this.service.on('contentDiscover', function (e) {
                contentDiscoverTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.contentDiscoveredHandler,
                    'The `contentDiscoveredHandler` param should be function'
                );
                Assert.isFalse(e.config.multiple, 'The `multiple` param in config should be set to TRUE');
                Assert.isFunction(e.config.isSelectable, 'config should have a function named isSelectable');
                Assert.isTrue(
                    e.config.isSelectable({
                        location: destinationLocationWithDifferentLocationId,
                        contentType: containerContentType
                    }),
                    "isSelectable should return TRUE if location 1 has no children and location 2 is container"
                );
                Assert.isTrue(
                    e.config.isSelectable({
                        location: destinationLocationWithDifferentLocationId,
                        contentType: nonContainerContentType
                    }),
                    "isSelectable should return TRUE if location 1 has no children and location 2 is non container"
                );
            });

            this.service.fire('swapLocation', {location: this.locationWithoutChildren});

            Assert.isTrue(
                contentDiscoverTriggered,
                "The `contentDiscover` event should have been fired"
            );
        },

        "Should trigger content discovery widget on `swapLocation` event for non containers": function () {
            var contentDiscoverTriggered = false,
                containerContentType = new Y.Mock(),
                nonContainerContentType = new Y.Mock(),
                destinationLocationWithChildren = new Y.Mock(),
                destinationLocationWithNoChildren = new Y.Mock();

            this.service.set('location', this.locationWithoutChildren);
            this.service.set('contentType', this.nonContainerContentType);

            Y.Mock.expect(containerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });

            Y.Mock.expect(nonContainerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: false
            });

            Mock.expect(destinationLocationWithChildren, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return '/location/Luis/Suarez';
                        case 'childCount':
                            return 10;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute');
                            break;
                    }
                }
            });

            Mock.expect(destinationLocationWithNoChildren, {
                'method': 'get',
                'args': [Mock.Value.String],
                'run': function (attr) {
                    switch (attr) {
                        case 'id':
                            return '/location/Luis/Suarez';
                        case 'childCount':
                            return 0;
                        default:
                            Assert.fail('Trying to `get` incorrect attribute');
                            break;
                    }
                }
            });


            this.service.on('contentDiscover', function (e) {
                contentDiscoverTriggered = true;
                Assert.isString(e.config.title, 'The `title` param in config should be string');
                Assert.isFunction(
                    e.config.contentDiscoveredHandler,
                    'The `contentDiscoveredHandler` param should be function'
                );
                Assert.isFalse(e.config.multiple, 'The `multiple` param in config should be set to TRUE');
                Assert.isFunction(e.config.isSelectable, 'config should have a function named isSelectable');
                Assert.isFalse(
                    e.config.isSelectable({
                        location: destinationLocationWithChildren,
                        contentType: containerContentType
                    }),
                    "isSelectable should return FALSE if location 1 is not container and location 2 has children"
                );
                Assert.isTrue(
                    e.config.isSelectable({
                        location: destinationLocationWithNoChildren,
                        contentType: containerContentType
                    }),
                    "isSelectable should return TRUE if location 1 is not container and location 2 is container but has no children"
                );
                Assert.isTrue(
                    e.config.isSelectable({
                        location: destinationLocationWithNoChildren,
                        contentType: nonContainerContentType
                    }),
                    "isSelectable should return TRUE if location 1 is not container and location 2 is not container"
                );
            });

            this.service.fire('swapLocation', {location: this.locationWithoutChildren});

            Assert.isTrue(
                contentDiscoverTriggered,
                "The `contentDiscover` event should have been fired"
            );
        }
    });

    swapLocationTest = new Y.Test.Case({
        name: "eZ Location Swap Plugin event tests",

        setUp: function () {
            this.service = new Y.Base();
            this.view = new Y.View();
            this.app = new Mock();
            this.view.addTarget(this.service);
            this.capi = new Mock();
            this.contentServiceMock = new Mock();
            this.contentJson = {
                'id': '/content/Sergio/Aguero',
                'name': 'Sergio Aguero',
                'mainLanguageCode': 'esl-ES'
            };
            this.contentInfoMock = getModelMock(this.contentJson);
            this.locationJson = {
                'id': '/location/Sergio/Aguero',
                'contentInfo': this.contentInfoMock
            };
            this.location = getModelMock(this.locationJson);
            this.nonContainerContentTypeJson = {
                'id': 'contentType',
                'isContainer': false
            };
            this.nonContainerType = getModelMock(this.nonContainerContentTypeJson);

            this.service.set('capi', this.capi);
            this.service.set('location', this.location);
            this.service.set('contentType', this.nonContainerType);

            Mock.expect(this.capi, {
                'method': 'getContentService',
                'returns': this.contentServiceMock
            });

            this.plugin = new Y.eZ.Plugin.LocationSwap({
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
            delete this.app;
        },

        _getSelection: function () {
            this.destinationContent = {'id': '/content/Fernando/Torres', 'name': 'Fernando Torres'};
            this.destinationContentInfo = getModelMock(this.destinationContent);
            this.destinationLocation = {'id': '/location/Fernando/Torres', 'contentInfo': this.destinationContentInfo};

            return {location: getModelMock(this.destinationLocation)};
        },

        _assertNotifications: function() {
            this.service.on('notify', Y.bind(function (e) {
                if (e.notification.state === 'started') {
                    this.startNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(this.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(this.locationJson.id) >= 0),
                        "The notification should contain id of location"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'done') {
                    this.successNotificationFired = true;
                    Assert.isTrue(
                        (e.notification.text.indexOf(this.contentJson.name) >= 0),
                        "The notification should contain name of content"
                    );
                    Assert.isTrue(
                        (e.notification.identifier.indexOf(this.locationJson.id) >= 0),
                        "The notification should contain id of location"
                    );
                    Assert.isTrue(
                        (e.notification.text.indexOf(this.destinationContent.name) >= 0),
                        "The notification should contain name of destination content"
                    );
                    Assert.areEqual(
                        e.notification.timeout, 5,
                        "The timeout of notification should be set to 5"
                    );
                }
                if (e.notification.state === 'error') {
                    this.errorNotificationFired = true;
                }
            }, this));
        },

        "Should swap locations and fire notifications": function () {
            var selection = this._getSelection(),
                swappedLocationFired = false,
                that = this;

            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: [Mock.Value.String, Mock.Value.Object],
                run: Y.bind(function (routeName, params) {
                    Assert.areEqual(
                        params.id,
                        that.locationJson.id,
                        'Id of location of content should be passed as id param'
                    );
                    Assert.areEqual(
                        params.languageCode,
                        that.contentJson.mainLanguageCode,
                        'Main language code of content should be passed as language param'
                    );
                }, this),
            });

            this.service.set('app', this.app);

            this.service.on('contentDiscover', function (e) {
                var config = {
                    selection: selection,
                };

                e.config.contentDiscoveredHandler(config);
            });

            Mock.expect(this.location, {
                'method': 'swap',
                'args': [Mock.Value.Object, selection.location, Mock.Value.Function],
                'run': function (options, destinationLocation, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );

                    callback(false);
                }
            });

            this._assertNotifications();
            this.service.on('swappedLocation', Y.bind(function (e) {
                swappedLocationFired = true;

                Assert.areSame(
                    this.location,
                    e.location,
                    "The swapped Location be provided in the event facade"
                );
            }, this));

            this.service.fire('swapLocation', {location: this.location});

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['viewLocation', Mock.Value.Object],
            });

            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isTrue(this.successNotificationFired, 'Should fire notification with `done` state');
            Assert.isFalse(this.errorNotificationFired, 'Should not fire notification with `error` state');
            Assert.isTrue(
                swappedLocationFired,
                "The swappedLocation event should have been fired"
            );
        },

        "Should fire notifications if swap fails": function () {
            var selection = this._getSelection(),
                that = this;

            this.startNotificationFired = false;
            this.successNotificationFired = false;
            this.errorNotificationFired = false;

            this.service.on('contentDiscover', function (e) {
                var config = {
                    selection: selection,
                };

                e.config.contentDiscoveredHandler(config);
            });

            Mock.expect(this.location, {
                'method': 'swap',
                'args': [Mock.Value.Object, selection.location, Mock.Value.Function],
                'run': function (options, destinationLocation, callback) {
                    Assert.areSame(
                        options.api,
                        that.capi,
                        'CAPI should be passed as param'
                    );
                    callback(true);
                }
            });

            this._assertNotifications();

            this.service.on('swappedLocation', function () {
                Assert.fail('The swappedLocation event should not have been fired');

            });
            this.service.fire('swapLocation', {location: this.location});

            Assert.isTrue(this.startNotificationFired, 'Should fire notification with `started` state');
            Assert.isFalse(this.successNotificationFired, 'Should fire notification with `done` state');
            Assert.isTrue(this.errorNotificationFired, 'Should fire notification with `error` state');
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationSwap;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Location Swap Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(swapLocationTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-locationswapplugin', 'ez-pluginregister-tests']});
