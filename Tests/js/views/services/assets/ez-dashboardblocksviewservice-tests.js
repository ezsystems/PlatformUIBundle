/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksviewservice-tests', function (Y) {
    'use strict';

    var successTest,
        errorTests,
        loadRootLocationErrorMessage = 'Cannot load root location',
        loadRootLocationErrorIdentifier ='load-root-location-error',
        loadLocationModelErrorMessage = 'Cannot load root location data into model',
        loadLocationModelErrorIdentifier = 'load-root-location-model-data-error';

    Y.eZ.Location = Y.Model;
    Y.eZ.Plugin.Search = Y.eZ.Plugin.ViewServiceBase;

    successTest = new Y.Test.Case({
        name: 'eZ Dashboard Blocks View Service load success test',

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();
            this.discoveryService = new Y.Mock();
            this.rootLocationModel = new Y.Mock();

            Y.Mock.expect(this.capi, {
                method: 'getDiscoveryService',
                run: Y.bind(function () {
                    return this.discoveryService;
                }, this)
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
            var rootLocationId = 'root-location',
                loadLocationResponse = {
                    document: {
                        Location: {}
                    }
                };

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

                    callback(false, loadLocationResponse);
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
                run: Y.bind(function () {
                    return this.discoveryService;
                }, this)
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

            this.service.on('notify', Y.bind(function (event) {
                this.resume(function () {
                    Y.Assert.areSame(loadRootLocationErrorMessage, event.notification.text, 'Should show correct error message');
                    Y.Assert.areSame(loadRootLocationErrorIdentifier, event.notification.identifier, 'Should show correct error identifier');
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

            this.service.on('notify', Y.bind(function (event) {
                this.resume(function () {
                    Y.Assert.areSame(loadLocationModelErrorMessage, event.notification.text, 'Should show correct error message');
                    Y.Assert.areSame(loadLocationModelErrorIdentifier, event.notification.identifier, 'Should show correct error identifier');
                });
            }, this));
            this.service.load(function () {
                Y.Assert.fail('The service should not be loaded');
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName('eZ Dashboard Blocks View Service tests');
    Y.Test.Runner.add(successTest);
    Y.Test.Runner.add(errorTests);
}, '', {
    requires: [
        'test',
        'model',
        'ez-viewservicebaseplugin',
        'ez-dashboardblocksviewservice'
    ]
});
