/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarviewservice-tests', function (Y) {
    var serviceTest, eventTest, findActionEventTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    serviceTest = new Y.Test.Case({
        name: "eZ Discovery Bar View Service tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();

            this.service = new Y.eZ.DiscoveryBarViewService({
                app: this.app,
                capi: this.capi,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.capi;
        },

        "load should call the next callback": function () {
            var nextCalled = false,
                that = this;

            this.service.load(function (param) {
                nextCalled = true;
                Assert.areSame(
                    that.service,
                    param,
                    "The service should be passed to the `next` callback"
                );
            });

            Assert.isTrue(nextCalled, "The `next` callback was not called");
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Discovery Bar View Service event tests",

        setUp: function () {
            this.app = new Mock();
            this.capi = new Mock();

            this.service = new Y.eZ.DiscoveryBarViewService({
                app: this.app,
                capi: this.capi,
            });

        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.capi;
        },

        "Should call navigateTo() on viewTrashAction event": function () {
            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ["viewTrash"],
            });

            this.service.fire('viewTrashAction');

            Mock.verify(this.app);
        },
        
        "Should call navigateTo() on viewSearchAction event": function () {
            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ["viewSearch"],
            });

            this.service.fire('viewSearchAction');

            Mock.verify(this.app);
        },
    });

    findActionEventTest = new Y.Test.Case({
        name: "eZ Discovery Bar View Service tree action event tests",

        setUp: function () {
            this.locationId = '08/09/1986';
            this.mainLanguage = 'LYO-69';
            this.location = new Y.Base();
            this.location.set('id', this.locationId);

            Y.eZ.LocationViewView = Y.Base.create('locationView', Y.Base, [], {}, {
                ATTRS: {
                    location: {
                        value: this.location
                    }
                }
            });

            this.activeView = new Y.eZ.LocationViewView();
            this.app = new Mock();
            this.capi = new Mock();

            Mock.expect(this.app, {
                method: 'get',
                args: ["activeView"],
                returns: this.activeView
            });

            this.service = new Y.eZ.DiscoveryBarViewService({
                app: this.app,
                capi: this.capi,
            });
        },

        tearDown: function () {
            delete Y.eZ.LocationViewView;
            delete Y.eZ.Location;
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.capi;
        },
        
        "Should fire contentDiscover with a starting location on browseAction event": function () {
            var contentDiscoverFired = false,
                otherLocation = new Y.Base();

            otherLocation.set('id', 'AnyOtherId');
            this.service.on('contentDiscover', Y.bind(function (e) {
                contentDiscoverFired = true;

                Assert.isFunction(e.config.isSelectable, "config should have a function named isSelectable");

                Assert.areSame(
                    e.config.startingLocationId, this.locationId,
                    "startingLocationId should have the id of the current location of the locationViewView"
                );

                Assert.areSame(
                    e.config.minDiscoverDepth, 1,
                    "minDiscoverDepth should be 1"
                );
            }, this));
            this.service.fire('browseAction');

            Assert.isTrue(contentDiscoverFired, 'contentDiscover should be fired');
        },

        "Should NOT be able to select the current location when content discovering": function () {
            var contentDiscoverFired = false;

            this.service.on('contentDiscover', Y.bind(function (e) {
                contentDiscoverFired = true;

                Y.Assert.isFalse(
                    e.config.isSelectable({location: this.location}),
                    "isSelectable should return FALSE if location is the same"
                );
            }, this));
            this.service.fire('browseAction');

            Assert.isTrue(contentDiscoverFired, 'contentDiscover should be fired');
        },

        "Should be able to select any other location than the current location when content discovering": function () {
            var contentDiscoverFired = false,
                otherLocation = new Y.Base();

            otherLocation.set('id', 'AnyOtherId');
            this.service.on('contentDiscover', Y.bind(function (e) {
                contentDiscoverFired = true;

                Y.Assert.isTrue(
                    e.config.isSelectable({location: otherLocation}),
                    "isSelectable should return TRUE if location is not the same"
                );
            }, this));
            this.service.fire('browseAction');

            Assert.isTrue(contentDiscoverFired, 'contentDiscover should be fired');
        },
        
        "Should fire contentDiscover without starting location and minimum discover depth when current view is NOT a locationViewView": function () {
            var contentDiscoverFired = false;

            this.activeView = new Y.Base();

            Mock.expect(this.app, {
                method: 'get',
                args: ["activeView"],
                returns: this.activeView
            });
            this.service.on('contentDiscover', Y.bind(function (e) {
                contentDiscoverFired = true;

                Assert.isUndefined(
                    e.config.startingLocationId,
                    "startingLocationId should be undefined"
                );

                Assert.isUndefined(
                    e.config.minDiscoverDepth,
                    "minDiscoverDepth should be undefined"
                );
            }, this));
            this.service.fire('browseAction');

            Assert.isTrue(contentDiscoverFired, 'contentDiscover should be fired');
        },

        "Should navigate to the selected location when content is discovered": function () {
            var contentMock = new Y.Mock(),
                newLocationId = '06/03/2017',
                fakeEventFacade = {selection: {location: this.location, content: contentMock}};

            this.location.set('id', newLocationId);
            Mock.expect(this.app, {
                method: 'get',
                args: ["activeView"],
                callCount: 2,
                returns: this.activeView
            });

            Y.Mock.expect(contentMock, {
                method: 'get',
                args: ['mainLanguageCode'],
                returns: this.mainLanguage
            });

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ["viewLocation", Y.Mock.Value.Object],
                run: Y.bind(function (routeName, config) {
                    Assert.areSame(
                        config.id, newLocationId,
                        "location id of the selected location should be provided"
                    );
                    Assert.areSame(
                        config.languageCode, this.mainLanguage,
                        "Main language code of the selected content should be provided"
                    );
                }, this)
            });

            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.fire('browseAction');

            Mock.verify(this.app);
            Mock.verify(contentMock);
        },
    });

    Y.Test.Runner.setName("eZ Discovery Bar View Service tests");
    Y.Test.Runner.add(serviceTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(findActionEventTest);
}, '', {requires: ['test', 'base', 'ez-discoverybarviewservice']});
