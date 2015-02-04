/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-navigationhubviewservice-tests', function (Y) {
    var getViewParametersTest, logOutEvtTest, defaultNavigationItemsTest,
        addNavigationItemTest, removeNavigationItemTest,
        Assert = Y.Assert;

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

            this.service = new Y.eZ.NavigationHubViewService({
                app: this.app,
                request: this.request,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.user;
            delete this.app;
            delete this.request;
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
            var items = [];

            this.service._set(zone + 'NavigationItems', items);

            Assert.areSame(
                items, this.service.getViewParameters()[zone + 'NavigationItems'],
                "The navigation items for the zone '" + zone + "' should be available in the view parameters"
            );
        },

        "Should return an object containing the 'create' navigation items": function () {
            this._testNavigationItems('create');
        },

        "Should return an object containing the 'optimize' navigation items": function () {
            this._testNavigationItems('optimize');
        },

        "Should return an object containing the 'deliver' navigation items": function () {
            this._testNavigationItems('deliver');
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
            this.service = new Y.eZ.NavigationHubViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _assertLocationNavigationItem: function (item, title, identifier, locationId) {
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
                "viewLocation", item.config.route.name,
                "The navigation item route name does not match"
            );
            Assert.areEqual(
                locationId, item.config.route.params.id,
                "The navigation item location id does not match"
            );
        },

        "'create' zone": function () {
            var value = this.service.get('createNavigationItems');

            Assert.isArray(value, "The createNavigationItems should contain an array");
            Assert.areEqual(
                2, value.length,
                "2 items should be configured by default for the create zone"
            );
            this._assertLocationNavigationItem(
                value[0], "Content structure", "content-structure", "/api/ezp/v2/content/locations/1/2"
            );
            this._assertLocationNavigationItem(
                value[1], "Media library", "media-library", "/api/ezp/v2/content/locations/1/43"
            );
        },

        "'optimize' zone": function () {
            var value = this.service.get('optimizeNavigationItems');

            Assert.isArray(value, "The optimizeNavigationItems should contain an array");
            Assert.areEqual(
                0, value.length,
                "optimize zone should be empty"
            );
        },

        "'deliver' zone": function () {
            var value = this.service.get('deliverNavigationItems');

            Assert.isArray(value, "The deliverNavigationItems should contain an array");
            Assert.areEqual(
                0, value.length,
                "deliver zone should be empty"
            );
        },
    });

    addNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service add navigation item tests",

        setUp: function () {
            this.service = new Y.eZ.NavigationHubViewService();
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

        "Should add the navigation item to the 'create' zone": function () {
            this._testAttribute('create');
        },

        "Should add the navigation item to the 'optimize' zone": function () {
            this._testAttribute('optimize');
        },

        "Should add the navigation item to the 'deliver' zone": function () {
            this._testAttribute('deliver');
        },
    });

    removeNavigationItemTest = new Y.Test.Case({
        name: "eZ Navigation Hub View Service remove navigation item test",

        setUp: function () {
            this.service = new Y.eZ.NavigationHubViewService();
            this.createIdentifier = 'peppa-pig';
            this.optimizeIdentifier = 'ben-et-holly';
            this.deliverIdentifier = 'paw-patrol';
            this.service.addNavigationItem(
                {config: {identifier: this.createIdentifier}},
                'create'
            );
            this.service.addNavigationItem(
                {config: {identifier: this.deliverIdentifier}},
                'deliver'
            );
            this.service.addNavigationItem(
                {config: {identifier: this.optimizeIdentifier}},
                'optimize'
            );
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
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

        "Should remove the navigation item to the 'create' zone": function () {
            this._testAttribute('create');
        },

        "Should remove the navigation item to the 'optimize' zone": function () {
            this._testAttribute('optimize');
        },

        "Should remove the navigation item to the 'deliver' zone": function () {
            this._testAttribute('deliver');
        },
    });


    Y.Test.Runner.setName("eZ Navigation Hub View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(logOutEvtTest);
    Y.Test.Runner.add(defaultNavigationItemsTest);
    Y.Test.Runner.add(addNavigationItemTest);
    Y.Test.Runner.add(removeNavigationItemTest);
}, '', {requires: ['test', 'ez-navigationhubviewservice']});
