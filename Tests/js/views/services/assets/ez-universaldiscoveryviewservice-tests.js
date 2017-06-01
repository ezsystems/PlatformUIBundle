/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryviewservice-tests', function (Y) {
    var getViewParametersTest, loadStartingLocationTest,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Universal Discovery View Service getViewParameters test",

        setUp: function () {
            this.virtualRootLocation = {};
            this.startingLocation = {};
            this.service = new Y.eZ.UniversalDiscoveryViewService({
                virtualRootLocation: this.virtualRootLocation,
                startingLocation: this.startingLocation,

            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the parameters": function () {
            var parameters = {some: "params"};

            this.service.set('parameters', parameters);
            Assert.isObject(this.service.getViewParameters());
            Assert.areEqual(3, Y.Object.keys(this.service.getViewParameters()).length);
            Assert.areSame(
                parameters.some, this.service.getViewParameters().some,
                "The view parameters should be the parameters"
            );
            Y.Assert.areEqual(
                this.service.virtualRootLocation, parameters.virtualRootLocation,
                "getViewParameters() result should contain the virtual root location"
            );
            Y.Assert.areEqual(
                this.service.startingLocation, parameters.startingLocation,
                "getViewParameters() result should contain the starting location"
            );
        },
    });

    loadStartingLocationTest = new Y.Test.Case({
        name: "eZ Universal Discovery View Service starting location test",

        setUp: function () {
            this.virtualRootLocation = {};
            this.loadError = false;
            this.loadPathError = false;
            this.capi = {};
            this.startingLocationId = 'locationId';
            this.app = new Y.Base();
            this.loadError = false;

            Y.eZ.Location  = Y.Base.create('locationModel', Y.Base, [], {
                loadFromHash: function () {},
                loadPath: Y.bind(function (options, callback) {
                    callback(this.loadPathError);
                }, this),
            }, {ATTRS: {id: {}, locationId: {}, contentInfo: {}}});

            this.location = new Y.eZ.Location({id: this.startingLocationId});
            this.searchResultList = [{location: this.location}];

            this.service = new Y.eZ.UniversalDiscoveryViewService({
                parameters: {startingLocationId: this.startingLocationId},
                capi: this.capi = {},
                app: this.app,
            });
            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findLocations',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    Assert.isFalse(search.loadContent, 'Should NOT load content');
                    Assert.isFalse(search.loadContentType, 'Should NOT load contentType');
                    Assert.areSame(search.limit, 1, 'Search limit should be 1');
                    Assert.areSame(search.offset, 0, 'Search offset should be 0');
                    Assert.areSame(search.viewName, 'location-' + this.startingLocationId, 'View name should contain the location id');
                    Assert.areSame(search.query.LocationIdCriterion, this.startingLocationId, 'Query should have a correct location id criterion');

                    callback(this.loadError, this.searchResultList);
                }, this),
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should set the starting Location to the service": function () {
            this.service.load(Y.bind(function(){
                Assert.isFalse(
                    this.service.get('app').get('loading'),
                    "app should NOT be loading anymore"
                );
                Assert.isInstanceOf(
                    Y.eZ.Location, this.service.get('startingLocation'),
                    "The service's startingLocation attribute value should an instance of eZ.Location"
                );
                Assert.areSame(
                    this.service.get('startingLocation').get('id'), this.startingLocationId,
                    "The startingLocation must have the location Id"
                );
            }, this));
        },

        "Should NOT set the starting Location to the service on location loading error": function () {
            this.loadError = true;
            this.service.load(Y.bind(function(){
                Assert.isFalse(
                    this.service.get('startingLocation'),
                    "The service's startingLocation attribute value should be false"
                );
            }, this));
        },

        "Should NOT set the starting Location to the service on location path loading error": function () {
            this.loadPathError = true;
            this.service.load(Y.bind(function(){
                Assert.isFalse(
                    this.service.get('startingLocation'),
                    "The service's startingLocation attribute value should be false"
                );
            }, this));
        },

        "Should NOT set the starting Location to the service if no starting location Id is provided": function () {
            this.service.get('parameters').startingLocationId = null;

            this.service.load(Y.bind(function(){
                Assert.isFalse(
                    this.service.get('startingLocation'),
                    "The service's startingLocation attribute value should be false"
                );
            }, this));
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(loadStartingLocationTest);
}, '', {requires: ['test', 'view', 'ez-universaldiscoveryviewservice']});
