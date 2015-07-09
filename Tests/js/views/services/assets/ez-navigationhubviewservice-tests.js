/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice-tests', function (Y) {
    var getViewParametersTest, logOutEvtTest, defaultNavigationItemsTest,
        addNavigationItemTest, removeNavigationItemTest, navigateToTest,
        loadTest, rootNodeAttributeTest, getNavigationItemTest,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service getViewParameters test",

        setUp: function () {
            this.app = new Y.Mock();
            this.user = {};
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user
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

            this.rootStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootStruct.location, {
                method: 'get',
                args: ['id']
            });

            Mock.expect(this.rootStruct.content, {
                method: 'get',
                args: ['mainLanguageCode']
            });

            this.rootMediaStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootMediaStruct.location, {
                method: 'get',
                args: ['id']
            });

            Mock.expect(this.rootMediaStruct.content, {
                method: 'get',
                args: ['mainLanguageCode']
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                request: this.request,
                rootStruct: this.rootStruct,
                rootMediaStruct: this.rootMediaStruct,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.user;
            delete this.app;
            delete this.request;
            delete this.rootStruct;
            delete this.rootMediaStruct;
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

        "Should return an object containing the 'studioplus' navigation items": function () {
            this._testNavigationItems('studioplus');
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

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootStruct: {},
                rootMediaStruct: {},
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

    navigateToTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service navigateTo event test",

        setUp: function () {
            this.routeName = 'samplanet';
            this.routeParams = {};
            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: [this.routeName, this.routeParams]
            });

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                rootStruct: {},
                rootMediaStruct: {},
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
        },

        "Should handle the navigateTo event": function () {
            this.service.fire('whatever:navigateTo', {
                route: {name: this.routeName, params: this.routeParams}
            });
            Y.Mock.verify(this.app);
        },
    });


    defaultNavigationItemsTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service default navigation items",

        setUp: function () {
            this.service = new Y.eZ.NavigationHubViewService({
                rootStruct: {},
                rootMediaStruct: {},
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
            var value;

            this.rootStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootStruct.location, {
                method: 'get',
                args: ['id'],
                returns: '/allez/om',
            });

            Mock.expect(this.rootStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            this.service._set('rootStruct', this.rootStruct);


            this.rootMediaStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootMediaStruct.location, {
                method: 'get',
                args: ['id'],
                returns: '/allez/om/media',
            });

            Mock.expect(this.rootMediaStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            this.service._set('rootMediaStruct', this.rootMediaStruct);

            value = this.service.get('platformNavigationItems');

            Assert.isArray(value, "The platformNavigationItems should contain an array");
            Assert.areEqual(
                2, value.length,
                "2 items should be configured by default for the platform zone"
            );

            this._assertLocationNavigationItem(
                value[0], "Content structure", "content-structure", "/allez/om", "fre-FR-root"
            );
            this._assertLocationNavigationItem(
                value[1], "Media library", "media-library", "/allez/om/media", "fre-FR-media"
            );
        },

        "'admin' zone": function () {
            var value = this.service.get('adminNavigationItems');

            Assert.isArray(value, "The adminNavigationItems should contain an array");
            Assert.areEqual(
                4, value.length,
                "4 items should be configured by default for the admin zone"
            );
        },

        "'studioplus' zone": function () {
            var value = this.service.get('studioplusNavigationItems');

            Assert.isArray(value, "The studioplusNavigationItems should contain an array");
            Assert.areEqual(
                1, value.length,
                "studio plus zone should contain only one element"
            );

            this._assertNavigationItem(
                value[0], "eZ Studio Plus presentation", "studioplus-presentation", "studioPlusPresentation"
            );

            Assert.areEqual(
                0, Y.Object.keys(value[0].config.route.params),
                "List of param should be empty"
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
            this.service = new Y.eZ.NavigationHubViewService({
                rootStruct: {},
                rootMediaStruct: {},
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
            this.rootStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootStruct.location, {
                method: 'get',
                args: ['id'],
                returns: '/allez/om',
            });

            Mock.expect(this.rootStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            this.service._set('rootStruct', this.rootStruct);


            this.rootMediaStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootMediaStruct.location, {
                method: 'get',
                args: ['id'],
                returns: '/allez/om/media',
            });

            Mock.expect(this.rootMediaStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            this.service._set('rootMediaStruct', this.rootMediaStruct);

            this._testAttribute('platform');
        },

        "Should add the navigation item to the 'studioplus' zone": function () {
            this._testAttribute('studioplus');
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
            this.service = new Y.eZ.NavigationHubViewService({
                rootStruct: {},
                rootMediaStruct: {},
            });
            this.platformIdentifier = 'peppa-pig';
            this.studioplusIdentifier = 'ben-et-holly';
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
                {config: {identifier: this.studioplusIdentifier}},
                'studioplus'
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
                Assert.areNotEqual(
                    identifier, item.config.identifier,
                    identifier + " should have been removed"
                );
            });
        },

        "Should remove the navigation item to the 'platform' zone": function () {
            this.rootStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootStruct.location, {
                method: 'get',
                args: ['id'],
                returns:'/allez/om',
            });

            Mock.expect(this.rootStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-root',
            });

            this.service._set('rootStruct', this.rootStruct);


            this.rootMediaStruct = {'location': new Mock(), 'content': new Mock()};

            Mock.expect(this.rootMediaStruct.location, {
                method: 'get',
                args: ['id'],
                returns:'/allez/om/media',
            });

            Mock.expect(this.rootMediaStruct.content, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: 'fre-FR-media',
            });

            this.service._set('rootMediaStruct', this.rootMediaStruct);

            this._testLocationAttribute('platform');
        },

        "Should remove the navigation item to the 'studioplus' zone": function () {
            this._testAttribute('studioplus');
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
            this.discoveryServiceMock = new Mock();
            this.contentRootMock = new Mock();
            this.locationRootMock = new Mock();
            this.contentMediaMock = new Mock();
            this.locationMediaMock = new Mock();

            this.service = new Y.eZ.NavigationHubViewService({
                capi: this.capiMock,
                rootStruct: {content: this.contentRootMock, location: this.locationRootMock},
                rootMediaStruct: {content: this.contentMediaMock, location: this.locationMediaMock},
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

        _initLocationMock: function (locationMock, fail) {
            Mock.expect(locationMock, {
                method: 'set',
                args: ['id','david-seaman'],
            });

            Mock.expect(locationMock, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (loadOptions, cb) {
                    Assert.isNotNull(
                        loadOptions.capi,
                        "Load options should provide the CAPI"
                    );
                    cb(fail ? true : false, {});
                }
            });

            Mock.expect(locationMock, {
                method: 'get',
                args: [Mock.Value.String],
                callCount: 3,
                run: function (attr) {
                    if (attr === 'resources') {
                        return {'Content': 'ray-parlour'};
                    } else if (attr === 'id') {
                        return 'robert-pires';
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });
        },

        _initContentMock: function (contentMock, fail, languageCode) {
            Mock.expect(contentMock, {
                method: 'set',
                args: ['id', 'ray-parlour'],
            });

            Mock.expect(contentMock, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (loadOptions, cb) {
                    Assert.isNotNull(
                        loadOptions.capi,
                        "Load options should provide the CAPI"
                    );
                    cb(fail ? true : false, {});
                }
            });

            Mock.expect(contentMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                callCount: 2,
                returns: languageCode,
            });
        },

        "Load method retrieves root nodes": function () {
            this._initDiscoveryService(false);
            this._initLocationMock(this.locationRootMock, false);
            this._initContentMock(this.contentRootMock, false, "fre-FR");
            this._initLocationMock(this.locationMediaMock, false);
            this._initContentMock(this.contentMediaMock, false, "fre-FR-media");

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
            Mock.verify(this.contentRootMock);
            Mock.verify(this.locationMediaMock);
            Mock.verify(this.contentMediaMock);
        },

        "Load method can not reach the REST API": function () {
            var errorCalled = false;

            this._initDiscoveryService(true);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },


        "Load method can not reach the REST API when loading location": function () {
            var errorCalled = false;

            this._initDiscoveryService(false);

            this._initLocationMock(this.locationRootMock, true);
            this._initLocationMock(this.locationMediaMock, true);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

        "Load method can not reach the REST API when loading content": function () {
            var errorCalled = false;

            this._initDiscoveryService(false);
            this._initLocationMock(this.locationRootMock, false);
            this._initLocationMock(this.locationMediaMock, false);
            this._initContentMock(this.contentRootMock, false);
            this._initContentMock(this.contentMediaMock, true);

            this.service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });

            this.service._load(function () {});

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

    });

    rootNodeAttributeTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service root node attribute tests",

        setUp: function () {
            this.service = new Y.eZ.NavigationHubViewService({});
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _testAttribute: function (attribute) {

            Assert.areSame(
                attribute.content.constructor, Y.eZ.Content,
                "The attribute should contain a content"
            );
            Assert.areSame(
                attribute.location.constructor, Y.eZ.Location,
                "The attribute should contain a location"
            );
        },

        "Root nodes are correctly initialized": function () {
            this._testAttribute(this.service.get('rootStruct'));
            this._testAttribute(this.service.get('rootMediaStruct'));
        },
    });

    getNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service getNavigationItem test",

        setUp: function () {
            this.contentRootMock = new Mock();
            this.locationRootMock = new Mock();
            this.contentMediaMock = new Mock();
            this.locationMediaMock = new Mock();

            Mock.expect(this.locationRootMock, {
                method: 'get',
                args:['id'],
                returns: "/root/Waldo",
            });

            Mock.expect(this.contentRootMock, {
                method: 'get',
                args:['mainLanguageCode'],
                returns: "fre-FR",
            });

            Mock.expect(this.locationMediaMock, {
                method: 'get',
                args:['id'],
                returns: "/media/Waldo",
            });

            Mock.expect(this.contentMediaMock, {
                method: 'get',
                args:['mainLanguageCode'],
                returns: "fre-FR",
            });

            this.service = new Y.eZ.NavigationHubViewService({
                rootStruct: {content: this.contentRootMock, location: this.locationRootMock},
                rootMediaStruct: {content: this.contentMediaMock, location: this.locationMediaMock},
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
}, '', {requires: ['test', 'ez-navigationhubviewservice']});
