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
            var that = this;
            this.virtualRootLocation = {};
            this.startingLocation = new Mock();
            this.loadError = false;
            this.loadPathError = false;
            this.capi = {};
            this.startingLocationId = 'startingLocId';
            this.app = new Y.Base();

            Y.eZ.Location  = Y.Base.create('locationModel', Y.Base, [], {
                loadFromHash: function () {},
                loadPath: Y.bind(function (options, callback) {
                    callback(this.loadPathError);
                }, this),
                load: function (options, callback) {
                    if (!that.loadError) {
                        Assert.areSame(
                            that.startingLocationId, this.get('id'),
                            "The location id should be the one provided by the view"
                        );
                        Assert.isTrue(
                            that.app.get('loading'),
                            "app should be loading"
                        );
                        callback(that.loadError);
                    } else {
                        callback(that.loadError);
                    }
                },
            }, {ATTRS: {id: {}, locationId: {}, contentInfo: {}}});

            this.startingLocationId = 'locationId';
            this.service = new Y.eZ.UniversalDiscoveryViewService({
                parameters: {startingLocationId: this.startingLocationId},
                capi: this.capi = {},
                app: this.app,
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
