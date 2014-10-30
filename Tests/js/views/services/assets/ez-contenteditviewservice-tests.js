/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditviewservice-tests', function (Y) {
    var cevlTest, eventTest, redirectionUrlTest,
        Mock = Y.Mock, Assert = Y.Assert;

    cevlTest = new Y.Test.Case({
        name: "eZ Content Edit View Service tests",

        setUp: function () {
            this.viewLocationRoute = '/view/something';
            this.locationId = 'something';
            this.request = {params: {id: "/api/ezp/v2/content/objects/59"}};
            this.capiMock = new Y.Test.Mock();
            this.resources = {
                'Owner': '/api/ezp/v2/user/users/14',
                'MainLocation': '/api/ezp/v2/content/locations/1/2/61',
                'ContentType': '/api/ezp/v2/content/types/23'
            };

            this.mocks = ['content', 'mainLocation', 'contentType', 'owner'];
            this.content = new Y.Test.Mock();
            this.mainLocation = new Y.Test.Mock();
            this.contentType = new Y.Test.Mock();
            this.owner = new Y.Test.Mock();
            this.version = new Y.Test.Mock();
            this.app = new Y.Test.Mock();
            this.fields = {};
        },

        "Should load the content, the location, the content type and the owner": function () {
            var response = {}, service, callback,
                callbackCalled = false,
                that = this,
                runLoadCallback = function (options, callback) {
                    Y.Assert.areSame(
                        options.api, cevlTest.capiMock,
                        "The 'api' property should be the CAPI"
                    );
                    callback(false);
                };

            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', this.fields]
            });
            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 2,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        return that.fields;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });

            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });

            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: runLoadCallback
                });
            });

            callback = function (param) {
                var variables = service.getViewParameters();

                Y.Assert.areSame(
                    service, param,
                    "The service should be available in the parameter of the load callback"
                );
                Y.Assert.areSame(variables.content, cevlTest.content);
                callbackCalled = true;
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                app: this.app,
                request: this.request,
                response: response,

                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.owner);
            Y.Mock.verify(this.version);

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
        },

        "Should fire the 'error' event when the content loading fails": function () {
            var service, callback,
                errorTriggered = false;

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });

            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    callback(true);
                }
            });

            callback = function () {
                Y.Assert.fail("The load callback should not be called");
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.request,
                app: this.app,
                location: this.mainLocation,
                content: this.content,
                version: this.version,
            });

            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.version);
            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },
        /**
         * @param {String} fail one of the value in this.mocks
         */
        _testSubloadError: function (fail) {
            var response = {}, service, callback,
                that = this,
                errorTriggered = false,
                runLoadCallbackSuccess = function (options, callback) {
                    callback(false);
                },
                runLoadCallbackFail = function (options, callback) {
                    callback(true);
                };

            Y.Mock.expect(this.version, {
                method: 'reset'
            });
            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.version, {
                method: 'set',
                args: ['fields', this.fields]
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                callCount: 2,
                args: [Y.Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'resources' ) {
                        return that.resources;
                    } else if ( attr === 'fields' ) {
                        return that.fields;
                    } else {
                        Y.fail("Unexpected call to content.get(" + attr + ")");
                    }
                }
            });

            Y.Object.each(this.resources, function (val, key) {
                var attr = key.charAt(0).toLowerCase() + key.substr(1);
                Y.Mock.expect(cevlTest[attr], {
                    method: 'set',
                    args: ['id',  val]
                });
            });

            Y.Array.each(this.mocks, function (val) {
                Y.Mock.expect(cevlTest[val], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: fail === val ? runLoadCallbackFail : runLoadCallbackSuccess
                });
            });

            callback = function () {
                Y.Assert.fail("The load callback should not be called");
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                request: this.request,
                response: response,
                app: this.app,
                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version
            });


            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.owner);
            Y.Mock.verify(this.version);

            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        "Should fire the error event when the location loading fails":  function () {
            this._testSubloadError('mainLocation');
        },

        "Should fire the error event when the content type loading fails":  function () {
            this._testSubloadError('contentType');
        },

        "Should fire the error event when the owner loading fails":  function () {
            this._testSubloadError('owner');
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View Service 'closeView' event test",

        setUp: function () {
            this.viewLocationRoute = '/view/something';

            this.app = new Y.Mock();

            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.viewLocationRoute],
            });

            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                closeRedirectionUrl: this.viewLocationRoute,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        'Should redirect to the closeRedirectionUrl value': function () {
            this.service.fire('test:closeView');
            Y.Mock.verify(this.app);
        }
    });

    redirectionUrlTest = new Y.Test.Case({
        name: 'eZ Content Edit View Service redirection urls tests',

        setUp: function () {
            this.location = new Mock();
            this.app = new Mock();
            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                location: this.location,
            });
        },

        _defaultViewLocation: function (attr) {
            var locationId = 'communication-breakdown',
                uri = '/led-zeppelin/' + locationId;

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (routeName, options) {
                    Assert.isObject(options, "The routeUri params should be an object");
                    Assert.areEqual(
                        locationId,
                        options.id,
                        "The current location id should be passed to routeUri"
                    );
                    return uri;
                }
            });

            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " default value should be the view location of the location"
            );
            Mock.verify(this.location);
            Mock.verify(this.service);
        },

        _definedValue: function (attr) {
            var uri = '/led-zeppelin/over-the-hills-and-far-away';

            this.service.set(attr, uri);
            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " value should be the defined one"
            );
        },

        _functionValue: function (attr) {
            var uri = '/led-zeppelin/over-the-hills-and-far-away',
                service = this.service,
                func = function () {
                    Assert.areSame(
                        service, this,
                        "The function should be executed in the service context"
                    );
                    return uri;
                };

            this.service.set(attr, func);
            Assert.areEqual(
                uri, this.service.get(attr),
                "The " + attr + " value should be the result of the function"
            );
        },

        "closeRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "discardRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "publishRedirectionUrl default value": function () {
            this._defaultViewLocation('closeRedirectionUrl');
        },

        "closeRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "discardRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "publishRedirectionUrl defined value": function () {
            this._definedValue('closeRedirectionUrl');
        },

        "closeRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },

        "discardRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },

        "publishRedirectionUrl function value": function () {
            this._functionValue('closeRedirectionUrl');
        },
    });

    Y.Test.Runner.setName("eZ Content Edit View Service tests");
    Y.Test.Runner.add(cevlTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(redirectionUrlTest);
}, '', {requires: ['test', 'ez-contenteditviewservice']});
