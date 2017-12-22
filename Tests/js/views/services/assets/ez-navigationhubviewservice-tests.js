/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice-tests', function (Y) {
    var getViewParametersTest, logOutEvtTest, defaultNavigationItemsTest,
        addNavigationItemTest, removeNavigationItemTest, navigateToTest,
        loadTest, rootNodeAttributeTest, getNavigationItemTest,
        navigateToFirstItemTest,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service getViewParameters test",

        setUp: function () {
            var that = this;

            this.app = new Y.Mock();
            this.user = {};
            this.contentInfoMock = new Mock();
            this.rootLocation = new Mock();
            this.rootMediaLocation = new Mock();

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user
            });

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.request = {
                params: {},
                route: {
                    name: "routeName",
                    serviceInstance: {},
                    service: function () {},
                    callbacks: [],
                }
            };

            Mock.expect(this.contentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode']
            });

            Mock.expect(this.rootLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '42';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            Mock.expect(this.rootMediaLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '43';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });
            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                request: this.request,
                rootLocation: this.rootLocation,
                rootMediaLocation: this.rootMediaLocation,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.user;
            delete this.app;
            delete this.request;
            delete this.rootLocation;
            delete this.rootMediaLocation;
            delete this.contentInfoMock;
        },

        "Should return an object containing the application user": function () {
            var param = this.service.getViewParameters();

            Y.Assert.areSame(
                this.user, param.user,
                "The view parameter should contain the app's user"
            );
            Y.Mock.verify(this.app);
        },

        _testNavigationItems: function (zone) {
            var items = this.service.get(zone + 'NavigationItems');

            this.service._set(zone + 'NavigationItems', items);

            Assert.areSame(
                items, this.service.getViewParameters()[zone + 'NavigationItems'],
                "The navigation items for the zone '" + zone + "' should be available in the view parameters"
            );
        },

        "Should return an object containing the 'platform' navigation items": function () {
            this._testNavigationItems('platform');
        },

        "Should return an object containing the 'admin' navigation items": function () {
            this._testNavigationItems('admin');
        },

        "Should return an object containing the 'studio' navigation items": function () {
            this._testNavigationItems('studio');
        },

        "Should provide a matched route object": function () {
            var params = this.service.getViewParameters();

            Assert.isObject(params.matchedRoute, "The matchedRoute entry should be an object");
            Assert.areNotSame(
                this.request.route, params.matchedRoute,
                "The matchedRoute object should not be the app route"
            );
            Assert.areEqual(
                this.request.route.name, params.matchedRoute.name,
                "The matchedRoute should keep the route properties"
            );
            Assert.areSame(
                this.request.params, params.matchedRoute.parameters,
                "The request parameters should be added to the matchedRoute"
            );
            Assert.isUndefined(
                params.matchedRoute.service,
                "The service property should be removed"
            );
            Assert.isUndefined(
                params.matchedRoute.serviceInstance,
                "The serviceInstance property should be removed"
            );
            Assert.isUndefined(
                params.matchedRoute.callbacks,
                "The callbacks property should be removed"
            );
        },
    });

    logOutEvtTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service logOut event testr",

        setUp: function () {
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true],
            });

            Y.Mock.expect(this.app, {
                method: 'logOut',
                args: [Y.Mock.Value.Function],
                run: function (cb) {
                    cb();
                },
            });

            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['loginForm']
            });

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootLocation: {},
                rootMediaLocation: {},
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
        },

        "Should handle the logOut event": function () {
            this.service.fire('whatever:logOut');
        },
    });

    defaultNavigationItemsTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service default navigation items",

        setUp: function () {
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootLocation: {},
                rootMediaLocation: {},
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _assertLocationNavigationItem: function (item, title, identifier, locationId, languageCode) {
            Assert.isInstanceOf(
                Y.eZ.NavigationItemView, item,
                "Item should be an instance of NavigationItemView"
            );
            Assert.areEqual(
                title, item.get('title'),
                "The navigation item title does not match"
            );
            Assert.areEqual(
                identifier, item.get('identifier'),
                "The navigation item identifier does not match"
            );
            Assert.areEqual(
                "viewLocation", item.get('route').name,
                "The navigation item route name does not match"
            );
            Assert.areEqual(
                locationId, item.get('route').params.id,
                "The navigation item location id does not match"
            );
            Assert.areEqual(
                languageCode, item.get('route').params.languageCode,
                "The navigation item language code does not match"
            );
        },

        _assertNavigationItem: function (item, title, identifier, routeName) {

            Assert.areSame(
                Y.eZ.NavigationItemView, item.Constructor,
                "The constructor should be eZ.NavigationItemView"
            );
            Assert.areEqual(
                title, item.config.title,
                "The navigation item title does not match"
            );
            Assert.areEqual(
                identifier, item.config.identifier,
                "The navigation item identifier does not match"
            );
            Assert.areEqual(
                routeName, item.config.route.name,
                "The navigation item route name does not match"
            );
        },

        "'platform' zone": function () {
            var value,
                that = this;

            this.contentInfoMock = new Mock();
            this.mediaContentInfoMock = new Mock();
            this.rootLocation = new Mock();
            this.rootMediaLocation = new Mock();

            Mock.expect(this.contentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            Mock.expect(this.rootLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootLocation', this.rootLocation);

            Mock.expect(this.mediaContentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            Mock.expect(this.rootMediaLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om/media';
                    } else if (attr === 'contentInfo') {
                        return that.mediaContentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootMediaLocation', this.rootMediaLocation);

            value = this.service.get('platformNavigationItems');

            Assert.isArray(value, "The platformNavigationItems should contain an array");
            Assert.areEqual(
                2, value.length,
                "2 items should be configured by default for the platform zone"
            );

            this._assertLocationNavigationItem(
                value[0], "navigationhub.content.structure domain=navigationhub", "content-structure", "/allez/om", "fre-FR-root"
            );
            this._assertLocationNavigationItem(
                value[1], "navigationhub.media.library domain=navigationhub", "media-library", "/allez/om/media", "fre-FR-media"
            );
        },

        "'admin' zone": function () {
            var value = this.service.get('adminNavigationItems');

            Assert.isArray(value, "The adminNavigationItems should contain an array");
            Assert.areEqual(
                7, value.length,
                "7 items should be configured by default for the admin zone"
            );
        },

        "'studio' zone": function () {
            var value = this.service.get('studioNavigationItems');

            Assert.isArray(value, "The studioNavigationItems should contain an array");
            Assert.areEqual(
                1, value.length,
                "studio zone should contain only one element"
            );
            this._assertNavigationItem(
                value[0], "eZ Studio presentation", "studio-presentation", "studioPresentation"
            );

            Assert.areEqual(
                0, Y.Object.keys(value[0].config.route.params),
                "List of param should be empty"
            );
        },
    });

    addNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service add navigation item tests",

        setUp: function () {
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootLocation: {},
                rootMediaLocation: {},
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _testAttribute: function (zone) {
            var attr = zone + 'NavigationItems',
                item = {},
                value = this.service.get(attr),
                origLength = value.length;

            this.service.addNavigationItem(item, zone);

            Assert.areEqual(
                origLength + 1, this.service.get(attr).length,
                "The item should be added to the zone '" + zone + "'"
            );
            Assert.areSame(
                this.service.get(attr)[origLength], item,
                "The item should be added to the zone '" + zone + "'"
            );
        },

        "Should add the navigation item to the 'platform' zone": function () {
            var that = this;

            this.contentInfoMock = new Mock();
            this.rootLocation = new Mock();
            this.mediaContentInfoMock = new Mock();
            this.rootMediaLocation = new Mock();

            Mock.expect(this.contentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            Mock.expect(this.rootLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootLocation', this.rootLocation);

            Mock.expect(this.mediaContentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            Mock.expect(this.rootMediaLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om/media';
                    } else if (attr === 'contentInfo') {
                        return that.mediaContentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootMediaLocation', this.rootMediaLocation);

            this._testAttribute('platform');
        },

        "Should add the navigation item to the 'admin' zone": function () {
            this._testAttribute('admin');
        },

        "Should add the navigation item to the 'studio' zone": function () {
            this._testAttribute('studio');
        },
    });

    removeNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service remove navigation item test",

        setUp: function () {
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootLocation: {},
                rootMediaLocation: {},
            });
            this.platformIdentifier = 'peppa-pig';
            this.studioIdentifier = 'paw-patrol';
            this.adminIdentifier = 'dora';
            this.service.addNavigationItem(
                {config: {identifier: this.platformIdentifier}},
                'platform'
            );
            this.service.addNavigationItem(
                {config: {identifier: this.studioIdentifier}},
                'studio'
            );
            this.service.addNavigationItem(
                {config: {identifier: this.adminIdentifier}},
                'admin'
            );
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _testLocationAttribute: function (zone) {
            var identifier = this[zone + "Identifier"];

            this.service.removeNavigationItem(identifier, zone);

            Y.Array.each(this.service.get(zone + "NavigationItems"), function (item) {
                Assert.areNotEqual(
                    identifier, item.get('identifier'),
                    identifier + " should have been removed"
                );
            });
        },

        _testAttribute: function (zone) {
            var identifier = this[zone + "Identifier"];

            this.service.removeNavigationItem(identifier, zone);

            Y.Array.each(this.service.get(zone + "NavigationItems"), function (item) {
                var itemIdentifier;

                if (item instanceof Y.eZ.NavigationItemSubtreeView) {
                    itemIdentifier = item.get('identifier');
                } else {
                    itemIdentifier = item.config.identifier;
                }

                Assert.areNotEqual(
                    identifier, itemIdentifier,
                    identifier + " should have been removed"
                );
            });
        },

        "Should remove the navigation item to the 'platform' zone": function () {
            var that = this;
            this.contentInfoMock = new Mock();
            this.rootLocation = new Mock();
            this.mediaContentInfoMock = new Mock();
            this.rootMediaLocation = new Mock();

            Mock.expect(this.contentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            Mock.expect(this.rootLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootLocation', this.rootLocation);

            Mock.expect(this.mediaContentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            Mock.expect(this.rootMediaLocation, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/allez/om/media';
                    } else if (attr === 'contentInfo') {
                        return that.mediaContentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service._set('rootMediaLocation', this.rootMediaLocation);

            this._testLocationAttribute('platform');
        },

        "Should remove the navigation item to the 'admin' zone": function () {
            this._testAttribute('admin');
        },

        "Should remove the navigation item to the 'studio' zone": function () {
            this._testAttribute('studio');
        },
    });

    loadTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service load test",

        setUp: function () {
            this.capiMock = new Mock();
            this.app = new Mock();
            this.user = new Mock();
            this.discoveryServiceMock = new Mock();
            this.locationRootMock = new Mock();
            this.contentInfoRootMock = new Mock();
            this.locationMediaMock = new Mock();
            this.contentInfoMediaMock = new Mock();
            this.getContentServiceMock = new Mock();
            this.avatar = {
                variations: {
                    platformui_profileview: { //jshint ignore:line
                        href: 'user-avatar-path'
                    }
                }
            };

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                capi: this.capiMock,
                rootLocation: this.locationRootMock,
                rootMediaLocation: this.locationMediaMock,
                app: this.app
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _initDiscoveryService: function (fail) {
            Mock.expect(this.capiMock, {
                method: 'getDiscoveryService',
                returns: this.discoveryServiceMock,
            });

            Y.Mock.expect(this.discoveryServiceMock, {
                method: 'getInfoObject',
                args: [Mock.Value.String, Y.Mock.Value.Function],
                run: function (name, callback) {
                    Assert.isTrue(
                        name === "rootLocation" || name === "rootMediaFolder",
                        "getInfoObject should be called with rootLocation or rootMediaFolder"
                    );
                    callback(fail ? true : false, {"_href": 'david-seaman'});
                }
            });
        },

        _initContentService: function (fail, userAvatar, res) {
            var expectedAvatarUrl = userAvatar ? null : this.avatar.variations.platformui_profileview.href, //jshint ignore:line
                response = res ? res : {document: {ContentImageVariation: 'user avatar'}};

            Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.getContentServiceMock,
            });

            Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user,
            });
            Mock.expect(this.user, {
                method: 'get',
                args: ['avatar'],
                returns: userAvatar ? null : this.avatar,
            });

            Y.Mock.expect(this.getContentServiceMock, {
                method: 'loadImageVariation',
                args: [Mock.Value.String, Y.Mock.Value.Function],
                callCount: userAvatar ? 0 : 1,
                run: function (avatarPath, callback) {
                    Y.Assert.areSame(expectedAvatarUrl, avatarPath, 'Should pass the correct url');
                    callback(fail ? true : false, response);
                }
            });
        },

        _initLocationMock: function (locationMock, contentInfoMock, languageCode, fail) {
            this._initContentInfoMock(contentInfoMock, languageCode);

            Mock.expect(locationMock, {
                method: 'set',
                args: ['id','david-seaman'],
            });

            Mock.expect(locationMock, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (loadOptions, cb) {
                    Assert.areSame(
                        this.capiMock,
                        loadOptions.capi,
                        "Load options should provide the CAPI"
                    );
                    cb(fail ? true : false, {});
                }
            });

            Mock.expect(locationMock, {
                method: 'get',
                args: [Mock.Value.String],
                callCount: 4,
                run: function (attr) {
                    if (attr === 'resources') {
                        return {'Content': 'ray-parlour'};
                    } else if (attr === 'id') {
                        return 'robert-pires';
                    } else if (attr === 'contentInfo') {
                        return contentInfoMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });
        },

        _initContentInfoMock: function (contentInfoMock, languageCode) {
            Mock.expect(contentInfoMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                callCount: 2,
                returns: languageCode,
            });
        },

        "Load method retrieves root nodes": function () {
            this._initDiscoveryService(false);
            this._initContentService();
            this._initLocationMock(this.locationRootMock, this.contentInfoRootMock, "fre-FR", false);
            this._initLocationMock(this.locationMediaMock, this.contentInfoMediaMock, "fre-FR-media", false);

            this.service._load(function () {});

            Assert.areSame(
                "fre-FR",
                this.service.getNavigationItem('content-structure').get('route').params.languageCode,
                "content-structure has not been loaded properly"
            );
            Assert.areSame(
                "fre-FR-media",
                this.service.getNavigationItem('media-library').get('route').params.languageCode,
                "media-library has not been loaded properly"
            );

            Mock.verify(this.locationRootMock);
            Mock.verify(this.contentInfoRootMock);
            Mock.verify(this.locationMediaMock);
            Mock.verify(this.contentInfoMediaMock);
            Mock.verify(this.getContentServiceMock);
        },

        "Load method not set user avatar when user don't have avatar": function () {
            this._initDiscoveryService(false);
            this._initContentService(false, true);
            this._initLocationMock(this.locationRootMock, this.contentInfoRootMock, "fre-FR", false);
            this._initLocationMock(this.locationMediaMock, this.contentInfoMediaMock, "fre-FR-media", false);

            this.service._load(function () {});

            Y.Assert.isNull(this.service.get('userAvatar'), 'Should not set user avatar');

            Mock.verify(this.locationRootMock);
            Mock.verify(this.contentInfoRootMock);
            Mock.verify(this.locationMediaMock);
            Mock.verify(this.contentInfoMediaMock);
            Mock.verify(this.getContentServiceMock);
        },

        "Load method can not reach the REST API": function () {
            var errorCalled = false;

            this._initContentService();
            this._initDiscoveryService(true);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

        "Load method can not reach the REST API when loading user avatar": function () {
            var errorCalled = false;

            this._initContentService(true);
            this._initDiscoveryService(false);

            this._initLocationMock(this.locationRootMock, this.contentInfoRootMock, "fre-FR", false);
            this._initLocationMock(this.locationMediaMock, this.contentInfoMediaMock, "fre-FR-media", false);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

        "Load method can not reach the REST API when loading user avatar and have no permission": function () {
            var errorCalled = false;

            this._initContentService(true, false, {status: 401, document: {}});
            this._initDiscoveryService(false);

            this._initLocationMock(this.locationRootMock, this.contentInfoRootMock, "fre-FR", false);
            this._initLocationMock(this.locationMediaMock, this.contentInfoMediaMock, "fre-FR-media", false);

            this.service.on('error', function () {
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isFalse(errorCalled, "The error event should not have been fired");
        },

        "Load method can not reach the REST API when loading location": function () {
            var errorCalled = false;

            this._initContentService();
            this._initDiscoveryService(false);

            this._initLocationMock(this.locationRootMock, this.contentInfoRootMock, "fre-FR", true);
            this._initLocationMock(this.locationMediaMock, this.contentInfoMediaMock, "fre-FR-media", true);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        }
    });

    rootNodeAttributeTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service root node attribute tests",

        setUp: function () {
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _testAttribute: function (attribute) {
            Assert.areSame(
                attribute.constructor, Y.eZ.Location,
                "The attribute should contain a location"
            );
        },

        "Root nodes are correctly initialized": function () {
            this._testAttribute(this.service.get('rootLocation'));
            this._testAttribute(this.service.get('rootMediaLocation'));
        },
    });

    getNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service getNavigationItem test",

        setUp: function () {
            var that = this;
            this.contentInfoRootMock = new Mock();
            this.locationRootMock = new Mock();
            this.contentInfoMediaMock = new Mock();
            this.locationMediaMock = new Mock();
            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.app
            });

            Mock.expect(this.contentInfoRootMock, {
                method: 'get',
                args: ['mainLanguageCode']
            });

            Mock.expect(this.locationRootMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/root/Waldo';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoRootMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            Mock.expect(this.contentInfoMediaMock, {
                method: 'get',
                args: ['mainLanguageCode']
            });

            Mock.expect(this.locationMediaMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return '/media/Waldo';
                    } else if (attr === 'contentInfo') {
                        return that.contentInfoMediaMock;
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for rootLocation mock");
                    }
                }
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootLocation: this.locationRootMock,
                rootMediaLocation: this.locationMediaMock,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Navigation item can not be found": function () {
            Assert.isNull(
                this.service.getNavigationItem("Random stuff"),
                "Navigation item should not be returned"
            );
        },

        "Navigation item can be found": function () {
            Assert.areSame(
                "content-structure", this.service.getNavigationItem("content-structure").get('identifier'),
                "Navigation item should have been found"
            );
        },
    });

    navigateToFirstItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service navigate to first item tests",

        setUp: function () {
            this.zoneName = "midfield";

            this.routeName = "Lass";
            this.routeParams = [];
            this.item = new Y.Base();

            this.item.set('route', {
                name: this.routeName,
                params: this.routeParams
            });

            this.parameterItem = {
                config: {
                    route: {
                        name: this.routeName,
                        params: this.routeParams,
                    }
                }
            };

            this.appMock = new Mock();

            Mock.expect(this.appMock, {
                method: 'navigateTo',
                args: [this.routeName, this.routeParams],
            });

            Y.Mock.expect(this.appMock, {
                method: 'on',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function, Y.Mock.Value.Object],
                returns: this.appMock
            });

            this.service = new Y.eZ.NavigationHubViewService({app: this.appMock});

            this.view = new Y.View({
                'bubbleTargets': this.service,
                'activeNavigation': ''
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            this.view.destroy();
            delete this.view;
        },

        "Should not do anything when no item": function () {
            Mock.expect(this.appMock, {
                method: 'navigateTo',
                callCount: 0
            });

            this.view.set('activeNavigation', this.zoneName);

            Mock.verify(this.appMock);
        },

        "Should not do anything when accessing directly to the URL": function () {
            Mock.expect(this.appMock, {
                method: 'navigateTo',
                callCount: 0
            });

            this.view = new Y.View({
                'bubbleTargets': this.service,
                'activeNavigation': null
            });

            this.service.set(this.zoneName + 'NavigationItems', [this.item]);
            this.view.set('activeNavigation', this.zoneName);

            Mock.verify(this.appMock);
        },

        "Should process navigation item": function () {
            this.service.set(this.zoneName + 'NavigationItems', [this.item]);
            this.view.set('activeNavigation', this.zoneName);
            Mock.verify(this.appMock);
        },

        "Should process navigation parameter item": function () {
            this.service.set(this.zoneName + 'NavigationItems', [this.parameterItem]);
            this.view.set('activeNavigation', this.zoneName);
            Mock.verify(this.appMock);
        },
    });

    Y.Test.Runner.setName("eZ Navigation Hub View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(logOutEvtTest);
    Y.Test.Runner.add(navigateToTest);
    Y.Test.Runner.add(defaultNavigationItemsTest);
    Y.Test.Runner.add(addNavigationItemTest);
    Y.Test.Runner.add(removeNavigationItemTest);
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(rootNodeAttributeTest);
    Y.Test.Runner.add(getNavigationItemTest);
    Y.Test.Runner.add(navigateToFirstItemTest);
}, '', {requires: ['test', 'ez-navigationhubviewservice']});
