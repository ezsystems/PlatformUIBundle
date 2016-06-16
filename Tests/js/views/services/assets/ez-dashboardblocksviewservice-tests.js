/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksviewservice-tests', function (Y) {
    'use strict';

    var successTest,
        errorTests,
        getViewParametersTest,
        rootLocationDefaultValueTest,
        loadRootLocationErrorMessage = 'Cannot load root location',
        loadLocationModelErrorMessage = 'Cannot load root location data into model';

    successTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View Service load success test',

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();
            this.discoveryService = new Y.Mock();
            this.rootLocationModel = new Y.Mock();

            Y.Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                returns: this.discoveryService,
            });

            this.service = new Y.eZ.DashboardBlocksViewService({
                app: this.app,
                capi: this.capi,
                rootLocation: this.rootLocationModel
            });
        },

        tearDown: function () {
            this.service.destroy();
        },

        'Should load root location data when being loaded': function () {
            var rootLocationId = 'root-location';

            Y.Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: ['rootLocation', Y.Mock.Value.Function],
                run: function (identifier, callback) {
                    callback(false, {
                        _href: rootLocationId
                    });
                }
            });

            Y.Mock.expect(this.rootLocationModel, {
                method: 'set',
                args: ['id', rootLocationId],
                returns: this.rootLocationModel
            });

            Y.Mock.expect(this.rootLocationModel, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Y.Assert.areSame(this.capi, options.api, 'Should pass correct API to the `load` method of root location model');

                    callback(false);
                }, this)
            });

            this.service.load(Y.bind(function () {
                this.resume(Y.bind(function () {
                    Y.Mock.verify(this.rootLocationModel);
                    Y.Mock.verify(this.capi);
                    Y.Mock.verify(this.discoveryService);
                }, this));
            }, this));
            this.wait();
        }
    });

    errorTests = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View Service load error handling tests',

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();
            this.discoveryService = new Y.Mock();
            this.rootLocationModel = new Y.Mock();

            Y.Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                returns: this.discoveryService,
            });

            this.service = new Y.eZ.DashboardBlocksViewService({
                app: this.app,
                capi: this.capi,
                rootLocation: this.rootLocationModel
            });
        },

        tearDown: function () {
            this.service.destroy();
        },

        'Should fail when trying to get root location info object': function () {
            Y.Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: ['rootLocation', Y.Mock.Value.Function],
                run: function (identifier, callback) {
                    callback(true);
                }
            });

            this.service.on('error', Y.bind(function (event) {
                this.resume(function () {
                    Y.Assert.areSame(loadRootLocationErrorMessage, event.message, 'Should show correct error message');
                });
            }, this));
            this.service.load(function () {
                Y.Assert.fail('The service should not be loaded');
            });
            this.wait();
        },

        'Should fail when loading root location model fails': function () {
            var rootLocationId = 'root-location';

            Y.Mock.expect(this.discoveryService, {
                method: 'getInfoObject',
                args: ['rootLocation', Y.Mock.Value.Function],
                run: function (identifier, callback) {
                    callback(false, {
                        _href: rootLocationId
                    });
                }
            });

            Y.Mock.expect(this.rootLocationModel, {
                method: 'set',
                args: ['id', rootLocationId],
                returns: this.rootLocationModel
            });

            Y.Mock.expect(this.rootLocationModel, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Y.Assert.areSame(this.capi, options.api, 'Should pass correct API to the `load` method of root location model');

                    callback(true);
                }, this)
            });

            this.service.on('error', Y.bind(function (event) {
                this.resume(function () {
                    Y.Assert.areSame(loadLocationModelErrorMessage, event.message, 'Should show correct error message');
                });
            }, this));
            this.service.load(function () {
                Y.Assert.fail('The service should not be loaded');
            });
            this.wait();
        },
    });

    getViewParametersTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View Service get view parameters test',

        setUp: function () {
            this.rootLocationModel = new Y.Mock();
            this.app = new Y.Mock();
            this.user = new Y.Model();

            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user
            });
            this.service = new Y.eZ.DashboardBlocksViewService({
                rootLocation: this.rootLocationModel,
                app: this.app,
            });
        },

        tearDown: function () {
            this.service.destroy();
        },

        'Should return a correct set of data when running `getViewParameters` method': function () {
            Y.Assert.areSame(this.rootLocationModel, this.service.getViewParameters().rootLocation, 'Should return `rootLocation` model');
            Y.Assert.areSame(this.user, this.service.getViewParameters().currentUser, 'Should return `user` model');
        }
    });

    rootLocationDefaultValueTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View Service root location default value test',

        setUp: function () {
            Y.eZ.Location = Y.Base.create('locationModel', Y.Model, [], {});

            this.service = new Y.eZ.DashboardBlocksViewService();
        },

        tearDown: function () {
            this.service.destroy();

            delete Y.eZ.Location;
        },

        'Should return a model': function () {
            Y.Assert.isInstanceOf(Y.eZ.Location, this.service.get('rootLocation'), 'Should return a location model');
        }
    });

    Y.Test.Runner.setName('eZ Dashboard Blocks View Service tests');
    Y.Test.Runner.add(successTest);
    Y.Test.Runner.add(errorTests);
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(rootLocationDefaultValueTest);
}, '', {
    requires: [
        'test',
        'model',
        'ez-viewservicebaseplugin',
        'ez-dashboardblocksviewservice'
    ]
});
