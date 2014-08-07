/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateplugin-tests', function (Y) {
    var tests, eventsTest, registerTest;

    tests = new Y.Test.Case({
        name: 'eZ Content Create Plugin tests',

        setUp: function () {
            this.root = '/shell';
            this.addContentRouteName = 'addContent';
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app',
                viewContainer: '.view-container',
                root: this.root
            });

            this.service = new Y.eZ.LocationViewViewService({app: this.app});
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.app.destroy();
            delete this.service;
            delete this.plugin;
            delete this.app;
        },

        'Should add the `addContent` route to the PlatformUI app': function () {
            var routes,
                that = this,
                routeFound = false;

            routes = this.app.get('routes');

            routeFound = Y.Array.find(routes, function (route) {
                return route.name === that.addContentRouteName;
            });

            Y.Assert.isObject(routeFound, 'The `addContent` route should be added to the PlatformUI app');
        },

        'Should use contentEditView view': function () {
            var routes,
                that = this,
                viewName = 'contentEditView',
                routeFound = false;

            routes = this.app.get('routes');

            routeFound = Y.Array.find(routes, function (route) {
                return route.name === that.addContentRouteName;
            });

            Y.Assert.areEqual(
                viewName,
                routeFound.view,
                'The `addContent` route should point to contentEditView view'
            );
        },

        'Should use contentEditViewService service': function () {
            var routes,
                that = this,
                routeFound = false;

            routes = this.app.get('routes');

            routeFound = Y.Array.find(routes, function (route) {
                return route.name === that.addContentRouteName;
            });

            Y.Assert.areEqual(
                'contentEditViewService',
                routeFound.service.NAME,
                'The `addContent` route should use contentEditViewService service'
            );
        },

        'Should set next view service parameters': function () {
            var service = new Y.eZ.LocationViewViewService({plugins: [this.plugin]}),
                newService = new Y.eZ.ViewService(),
                locationId = '/api/ezp/v2/content/locations/1/2/90/93';

            service.get('location').set('id', locationId);
            service.setNextViewServiceParameters(newService);
        }
    });

    eventsTest = new Y.Test.Case({
        name: 'eZ Create Content plugin events tests',

        setUp: function () {
            var that = this;

            this.capiMock = new Y.Test.Mock();
            this.contentTypeServiceMock = new Y.Test.Mock();

            this.root = '/shell';
            this.addContentRouteName = 'addContent';
            this.app = new Y.eZ.PlatformUIApp({
                container: '.app',
                viewContainer: '.view-container',
                root: this.root
            });

            Y.Mock.expect(this.capiMock, {
                method: 'getContentTypeService',
                run: function () {
                    return that.contentTypeServiceMock;
                }
            });

            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capiMock
            });
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.app.destroy();
            delete this.service;
            delete this.plugin;
            delete this.app;
            delete this.contentTypeServiceMock;
            delete this.capiMock;
        },

        'Should navigate to add content form': function () {
            var contentTypeLang = 'eng-GB',
                contentTypeIdentifier = 'article',
                locationId = '/api/ezp/v2/content/locations/1/2/90/93',
                host = this.plugin.get('host');

            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: [this.addContentRouteName, Y.Mock.Value.Object],
                run: function (route, params) {
                    Y.Assert.areEqual(contentTypeLang, params.contentTypeLang);
                    Y.Assert.areEqual(contentTypeIdentifier, params.contentTypeIdentifier);

                    return locationId;
                }
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [locationId]
            });

            host.get('location').set('id', locationId);

            this.service.fire('createContent', {
                contentTypeLang: contentTypeLang,
                contentTypeIdentifier: contentTypeIdentifier
            });
        },

        'Should get content types list without using REST': function () {
            var host = this.plugin.get('host'),
                contentGroupsList = {};

            this.plugin.set('contentGroupsList', contentGroupsList);
            host.fire('createContentActionView:activeChange');

            Y.Assert.areSame(
                contentGroupsList,
                host.get('contentGroupsList'),
                'The service\'s contentGroupsList property value should be set correctly'
            );
        },

        'Should get content types list using REST': function () {
            var host = this.plugin.get('host');

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    return callback(false, {
                        document: {
                            ContentTypeGroupList: {
                                ContentTypeGroup: [{id: 1, identifier: 'Content'}]
                            }
                        }
                    });
                }
            });

            host.fire('createContentActionView:activeChange');

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.contentTypeServiceMock);
        },

        'Should throw an error when REST request fails': function () {
            var host = this.plugin.get('host'),
                errorObject = {message: 'Error test'};

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    return callback(true, errorObject);
                }
            });

            host.fire('createContentActionView:activeChange');

            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.contentTypeServiceMock);
        }
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentCreate;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName('eZ Content Create Plugin tests');
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: [
    'test',
    'base',
    'ez-contentcreateplugin',
    'ez-pluginregister-tests',
    'ez-locationviewviewservice',
    'ez-platformuiapp',
    'ez-contenteditviewservice',
    'ez-viewservice',
    'array-extras',
    'promise'
]});
