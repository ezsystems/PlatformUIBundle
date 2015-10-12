/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewviewservice-tests', function (Y) {
    var functionalTest, unitTest, eventTest, getViewParametersTest, sendToTrashButtonTest, moveContentTest,
        Assert = Y.Assert, Mock = Y.Mock;

    functionalTest = new Y.Test.Case({
        name: "eZ Location View View Service 'functional' tests",

        setUp: function () {
            this.rootLocationId = '/api/ezp/v2/content/locations/1/2';
            this.leafLocationId = '/api/ezp/v2/content/locations/1/2/67/68/111';
            this.contentTypeId = '/api/ezp/v2/content/types/38';
            this.request = {params: {languageCode: 'fre-FR'}};
            this.capiMock = new Y.Test.Mock();
            this.contentTypeServiceMock = new Y.Test.Mock();
            this.discoveryServiceMock = new Y.Test.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentTypeService',
                returns: this.contentTypeServiceMock
            });
            Y.Mock.expect(this.capiMock, {
                method: 'getDiscoveryService',
                returns: this.discoveryServiceMock
            });

            this.locationIds = [
                this.rootLocationId,
                '/api/ezp/v2/content/locations/1/2/67',
                '/api/ezp/v2/content/locations/1/2/67/68',
                this.leafLocationId,
            ];
            this.contentIds = {
                '/api/ezp/v2/content/locations/1/2': '/api/ezp/v2/content/objects/109',
                '/api/ezp/v2/content/locations/1/2/67': '/api/ezp/v2/content/objects/66',
                '/api/ezp/v2/content/locations/1/2/67/68': '/api/ezp/v2/content/objects/65',
                '/api/ezp/v2/content/locations/1/2/67/68/111': '/api/ezp/v2/content/objects/57',
            };
            this.locations = {};
            this.contents = {};
        },

        _initContentTypeService: function (fail) {
            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentType',
                args: [this.contenTypeId, Y.Mock.Value.Function],
                run: function (typeId, callback) {
                    callback(fail ? true : false, {document: {ContentType: {}}});
                }
            });
        },

        _initDiscoveryService: function (fail) {
            Y.Mock.expect(this.discoveryServiceMock, {
                method: 'getInfoObject',
                args: ['rootLocation', Y.Mock.Value.Function],
                run: function (object, callback) {
                    callback(fail ? true : false, {"_href": 'basile-boli'});
                }
            });
        },

        _initTree: function (failLocationId, failContentId) {
            var prevLocationId;

            Y.Array.each(this.locationIds, function (locationId, key) {
                var contentId = functionalTest.contentIds[locationId];

                functionalTest.locations[locationId] = new Y.Test.Mock(
                    new Y.eZ.Location({
                        id: locationId,
                        depth: locationId.split('/').length - functionalTest.rootLocationId.split('/').length + 1,
                        resources: {
                            Content: contentId,
                            ParentLocation: prevLocationId
                        }
                    })
                );
                Y.Mock.expect(functionalTest.locations[locationId], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: function (options, callback) {
                        Y.Assert.areSame(
                            functionalTest.capiMock, options.api,
                            "The location load function should receive the CAPI"
                        );
                        callback(locationId === failLocationId ? true : false);
                    }
                });
                functionalTest.contents[contentId] = new Y.Test.Mock(
                    new Y.eZ.Content({
                        id: contentId,
                        resources: {
                            ContenType: functionalTest.contentTypeId
                        }
                    })
                );
                Y.Mock.expect(functionalTest.contents[contentId], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: function (options, callback) {
                        Y.Assert.areSame(
                            functionalTest.capiMock, options.api,
                            "The content load function should receive the CAPI"
                        );
                        Y.Assert.areEqual(
                            functionalTest.request.params.languageCode,
                            options.languageCode,
                            "The content load function should receive the language"
                        );
                        callback(contentId === failContentId ? true : false);
                    }
                });

                prevLocationId = locationId;
            });
        },

        _normalLoading: function (locationId) {
            var service, callbackCalled = false,
                response = {},
                location, content;

            this._initContentTypeService();
            this._initDiscoveryService();
            this._initTree();
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            service = new Y.eZ.LocationViewViewService({
                capi: this.capiMock,
                location: location,
                content: content,
                response: response,
                request: this.request
            });
            service._newLocation = function (params) {
                return functionalTest.locations[params.id];
            };
            service._newContent = function (params) {
                return functionalTest.contents[params.id];
            };
            service.load(function (param) {
                var depth, prevLocation,
                    response = service.get('response'),
                    variables = service.getViewParameters();

                callbackCalled = true;
                Y.Assert.areSame(
                    service, param,
                    "The service should be available in the parameter of the load callback"
                );

                Y.Assert.areSame(
                    location, variables.location,
                    "The variables should get the location"
                );
                Y.Assert.areSame(
                    content, variables.content,
                    "The variables should get the content"
                );
                Y.Assert.isArray(
                    variables.path, "The path should be an array"
                );
                depth = location.get('id').split('/').length - functionalTest.rootLocationId.split('/').length;
                Y.Assert.areSame(
                    depth, variables.path.length,
                    "The path should have " + depth + " entries"
                );
                Y.Array.each(variables.path, function (entry) {
                    Y.Assert.isInstanceOf(
                        Y.eZ.Location, entry,
                        "Each path entry should been a Y.eZ.Location instance"
                    );
                    if ( prevLocation ) {
                        Y.Assert.areSame(
                            prevLocation.get('id'),
                            entry.get('resources').ParentLocation,
                            "Each location entry should be the parent of the next one"
                        );
                    }

                    prevLocation = entry.location;
                });

                Y.Assert.areSame(
                    variables.path,
                    response.view.path,
                    "The path should be available in `response.view`"
                );
                Y.Assert.areSame(
                    variables.location,
                    response.view.location,
                    "The location should be available in `response.view`"
                );
                Y.Assert.areSame(
                    variables.content,
                    response.view.content,
                    "The content should be available in `response.view`"
                );
            });

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.discoveryServiceMock);
        },

        _errorLoading: function (locationId, contentServiceError, locationIdError, contentIdError, contentTypeError) {
            var service, errorCalled = false,
                response = {},
                location, content;

            this._initContentTypeService(contentTypeError);
            this._initDiscoveryService(true);
            this._initTree(locationIdError, contentIdError);
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            service = new Y.eZ.LocationViewViewService({
                capi: this.capiMock,
                location: location,
                content: content,
                response: response,
                request: this.request
            });
            service._newLocation = function (params) {
                return functionalTest.locations[params.id];
            };
            service._newContent = function (params) {
                return functionalTest.contents[params.id];
            };
            service.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });
            service.load(function () {
                Y.Assert.fail("The load callback should not be called");
            });

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

        "Should load the location and the path for the leaf location": function () {
            this._normalLoading(this.leafLocationId);
        },

        "Should load the location and the path for an intermediate location": function () {
            this._normalLoading('/api/ezp/v2/content/locations/1/2/67/68');
        },

        "Should load the location and the path for the root location": function () {
            this._normalLoading(this.rootLocationId);
        },

        "Should handle error on the REST root loading": function () {
            this._errorLoading(this.rootLocationId, true, false, false);
        },

        "Should handle error on the root location loading": function () {
            this._errorLoading(this.rootLocationId, false, this.rootLocationId, false);
        },

        "Should handle error on the root location loading (2)": function () {
            this._errorLoading(this.leafLocationId, false, this.rootLocationId, false);
        },

        "Should handle error on the left location loading": function () {
            this._errorLoading(this.leafLocationId, false, this.leafLocationId, false);
        },

        "Should handle error on an intermediate location loading": function () {
            this._errorLoading(this.leafLocationId, false, '/api/ezp/v2/content/locations/1/2/67', false);
        },

        "Should handle error on the main content loading": function () {
            this._errorLoading(this.rootLocationId, false, false, this.contentIds[this.rootLocationId]);
        },

        "Should handle error on the main content loading (2)": function () {
            this._errorLoading(this.leafLocationId, false, false, this.contentIds[this.leafLocationId]);
        },

        "Should handle error on the content type loading": function () {
            this._errorLoading(this.rootLocationId, false, false, false, true);
        },

        "Should handle error on the leaf content loading": function () {
            this._errorLoading(this.leafLocationId, false, false, this.contentIds[this.leafLocationId]);
        },

        "Should handle error on an intermediate content loading": function () {
            this._errorLoading(this.leafLocationId, false, false, '/api/ezp/v2/content/objects/65');
        }
    });

    unitTest = new Y.Test.Case({
        name: "eZ Location View View Service unit test",

        setUp: function () {
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
        },

        tearDown: function () {
            delete this.request;
            delete this.languageCode;
        },

        "Should sort path by location depth": function () {
            var service,
                pathInput = [], pathOut, i;

            pathInput.push(new Y.eZ.Location({depth: 2}));
            pathInput.push(new Y.eZ.Location({depth: 3}));
            pathInput.push(new Y.eZ.Location({depth: 1}));
            pathInput.push(new Y.eZ.Location({depth: 0}));

            service = new Y.eZ.LocationViewViewService({request: this.request});
            service.set('path', pathInput);
            pathOut = service.get('path');

            Y.Assert.areSame(
                pathInput.length, pathOut.length,
                "The input path and the out path should have the same length"
            );

            for (i = 0; i != pathOut.length; ++i) {
                Y.Assert.areSame(
                    i, pathOut[i].get('depth'),
                    "The path should be sorted by depth"
                );
            }
        },

        "Should create a location": function () {
            var TestService, service, id = 'myid';

            TestService = Y.Base.create('testService', Y.eZ.LocationViewViewService, [], {
                testNewLocation: function (conf) {
                    return this._newLocation(conf);
                }
            });

            service = new TestService({request: this.request});
            Y.Assert.isInstanceOf(Y.eZ.Location, service.testNewLocation());
            Y.Assert.areSame(id, service.testNewLocation({'id': id}).get('id'));
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Location View View Service event tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = {};
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capi,
                request: this.request,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.content;
        },

        "Should navigate to the content edit when receiving an editAction event": function () {
            var contentMock, contentId = 'aContentId',
                editUri = '/i/want/to/edit/aContentId/pol-PL',
                app = this.app;

            contentMock = new Y.Test.Mock();
            Y.Mock.expect(contentMock, {
                method: 'get',
                args: ['id'],
                returns: contentId
            });

            Y.Mock.expect(app, {
                method: 'routeUri',
                args: ['editContent', Y.Mock.Value.Object],
                run: function (routeName, params) {
                    Y.Assert.isObject(
                        params,
                        "routeUri should be called with an object in parameter"
                    );
                    Y.Assert.areEqual(
                        params.id,
                        contentId,
                        "routeUri should receive the content id in parameter"
                    );
                    return editUri;
                }
            });

            Y.Mock.expect(app, {
                method: 'navigate',
                args: [editUri]
            });

            this.service.fire('whatever:editAction', {content: contentMock});
            Y.Mock.verify(app);
            Y.Mock.verify(contentMock);
        },
    });

    moveContentTest = new Y.Test.Case({
        name: "eZ Location View View Service move content tests",

        setUp: function () {
            var that = this;
            this.capiMock = new Y.Test.Mock();
            this.locationMock = new Y.Test.Mock();
            this.responseMock = new Y.Test.Mock();
            this.locationId = 'location/2/2/2/2';
            this.parentLocationId = 'location/1/2/3/4';
            this.finalLocation = 'finalLocation/4/5/6/7';
            this.parentContentName = 'Dad';
            this.error = false;
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};

            Y.Mock.expect(this.responseMock, {
                method: 'getHeader',
                args: ['location'],
                returns: this.finalLocation
            });

            Y.Mock.expect(this.locationMock, {
                method: 'get',
                args: ['id'],
                returns: this.locationId
            });

            Y.Mock.expect(this.locationMock, {
                method: 'move',
                args: [Y.Mock.Value.Object, this.parentLocationId, Y.Mock.Value.Function],
                run: function (options, parentLocationId, callback) {
                    Assert.areSame(
                        options.api,
                        that.capiMock,
                        "option should have the JS REST client instance"
                    );
                    callback(that.error, that.responseMock);
                }
            });

            this.app = new Y.Mock();
            this.activeView = new Y.View({});
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['activeView'],
                returns: this.activeView
            });
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['viewLocation', Y.Mock.Value.Object],
                run: function (viewLocation, idObject) {
                    Assert.areSame(
                        idObject.id,
                        that.finalLocation,
                        "The application should have redirect the user to the new content's location"
                    );
                }
            });

            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capiMock,
                location: this.locationMock,
                request: this.request
            });
        },

        _assertOnNotification: function (e, firstState, secondState, firstTimeout, secondTimeout, parentLocationId, locationId) {
            Assert.areEqual(
                firstState, e.notification.state,
                "The notification state should be 'started'"
            );
            Assert.isString(
                e.notification.text,
                "The notification text should be a String"
            );
            Assert.areSame(
                firstTimeout, e.notification.timeout,
                "The notification timeout should be set to 0"
            );
            Assert.areSame(
                'move-notification-' + parentLocationId + '-' + locationId,
                e.notification.identifier,
                "The notification identifier should match"
            );
            this.service.once('notify', function (e) {
                Assert.areEqual(
                    secondState, e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a String"
                );
                Assert.areSame(
                    secondTimeout, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
                Assert.areSame(
                    'move-notification-' + parentLocationId + '-' + locationId,
                    e.notification.identifier,
                    "The notification identifier should match"
                );
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.locationMock;
            delete this.capiMock;
            delete this.discoveryServiceMock;
            delete this.responseMock;
        },

        "Should launch the universal discovery widget when receiving an moveAction event": function () {
            var contentDiscovered = false;

            this.service.on('contentDiscover', function (e) {
                contentDiscovered = true;
                Y.Assert.isObject(e.config, "contentDiscover config should be an object");
                Y.Assert.isFunction(e.config.contentDiscoveredHandler, "config should have a function named contentDiscoveredHandler");
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(contentDiscovered, "The contentDiscover event should have been fired");
        },

        "Should notify when trying to move a content but get an error": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, content : parentContentMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.error = true;
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that._assertOnNotification(e,'started', 'error', 5, 0, that.parentLocationId, that.locationId);
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should NOT send movedContent event when trying to move a content but get an error": function () {
            var that = this,
                eventFired = false,
                parentLocationMock = new Y.Mock(),
                parentContentMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, content : parentContentMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });
            this.error = true;
            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('movedContent', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('location'), e.location,
                    "movedDraft event should store the service location"
                );
                Assert.areSame(
                    that.locationId, e.oldParentLocationId,
                    "movedDraft event should store the service parentLocationId"
                );
            });
            this.service.fire('whatever:moveAction');
            Assert.isFalse(eventFired, "The movedContent event should NOT have been fired");
        },

        "Should notify when trying to move a content without redirection": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, content : parentContentMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });

            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that.activeView = new Y.View({location: 'newLocation/1/2/3/4'});
                Y.Mock.expect(that.app, {
                    method: 'get',
                    args: ['activeView'],
                    returns: that.activeView
                });
                that._assertOnNotification(e,'started', 'done', 5, 5, that.parentLocationId, that.locationId);
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should notify when trying to move a content and redirect to new content's location": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, content : parentContentMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });

            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('notify', function (e) {
                notified = true;
                that._assertOnNotification(e,'started', 'done', 5, 5, that.parentLocationId, that.locationId);
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should send movedContent event after moving a content and redirect to new content's location": function () {
            var that = this,
                eventFired = false,
                parentLocationMock = new Y.Mock(),
                parentContentMock = new Y.Mock(),
                fakeEventFacade = {selection : {location : parentLocationMock, content : parentContentMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentMock, {
                method: 'get',
                args: ['name'],
                returns: this.parentContentName
            });

            this.service.on('contentDiscover', function (e) {
                e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
            });

            this.service.once('movedContent', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('location'), e.location,
                    "movedDraft event should store the service location"
                );
                Assert.areSame(
                    that.locationId, e.oldParentLocationId,
                    "movedDraft event should store the service parentLocationId"
                );
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(eventFired, "The moveContent event should have been fired");
        },
    });

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Location View View Service getViewParameters tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = {};
            this.content = {};
            this.contentType = {};
            this.location = {};
            this.path = [];
            this.config = {};
            this.request = {params: {languageCode: 'fre-FR'}};
            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capi,
                content: this.content,
                contentType: this.contentType,
                location: this.location ,
                path: this.path,
                config: this.config,
                request: this.request,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.content;
            delete this.contentType;
            delete this.location;
            delete this.path;
            delete this.config;
        },

        "Should get the view parameters": function () {
            var params = this.service.getViewParameters();

            Y.Assert.areSame(this.content, params.content, 'Service should get the content');
            Y.Assert.areSame(this.contentType, params.contentType, 'Service should get the contentType');
            Y.Assert.areSame(this.location, params.location, 'Service should get the location');
            Y.Assert.areSame(this.path, params.path, 'Service should get the path');
            Y.Assert.areSame(this.config, params.config, 'Service should get the config');

            Y.Assert.areSame(this.content, this.service.get('content'), 'Service should get the content');
        },
    });

    sendToTrashButtonTest = new Y.Test.Case({
        name: "eZ Location View View Service send to trash button tests",

        setUp: function () {
            this.app = new Mock();
            this.capi = new Mock();
            this.location = new Mock();
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capi,
                location: this.location,
                request: this.request
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should fire the confirBoxOpen event": function () {
            var confirmBoxOpenEvent = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenEvent = true;
                Assert.isObject(e.config, "The event facade should contain a config object");
                Assert.isString(e.config.title, "The title should be defined");
                Assert.isFunction(e.config.confirmHandler, "A confirmHandler should be provided");
            });

            this.service.fire('whatever:sendToTrashAction', {content: {}});
            Assert.isTrue(confirmBoxOpenEvent, "The confirmBoxOpen event should have been fired");
        },

        "Should notify the user when starting to send to trash": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                locationId = 'raul-gonzalez-blanco',
                contentName = 'pierlugi-collina',
                notified = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName,
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: 'alan-shearer'
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "started", e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a string"
                );
                Assert.isTrue(
                    e.notification.text.indexOf(contentName) !== -1,
                    "The notification text should contain content name"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(locationId) !== -1,
                    "The notification identifier should contain location id"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should notify user about error when sending to trash failed": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                locationId = 'raul-gonzalez-blanco',
                contentName = 'pierlugi-collina',
                notified = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName,
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: 'alan-shearer'
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(true);
                }
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "error", e.notification.state,
                        "The notification state should be 'error'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.isTrue(
                        e.notification.text.indexOf(contentName) !== -1,
                        "The notification text should contain content name"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(locationId) !== -1,
                        "The notification identifier should contain location id"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should NOT fire sentToTrash event when sending to trash failed": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                that = this,
                locationId = 'raul-gonzalez-blanco',
                contentName = 'pierlugi-collina',
                eventFired = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName,
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: 'alan-shearer'
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(true);
                }
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('sentToTrash', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('location'), e.location,
                    "sentToTrash event should store the service location"
                );
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Assert.isFalse(eventFired, "The sentToTrash event should NOT have been fired");
        },

        "Should notify user about success of sending content to trash": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                locationId = 'raul-gonzalez-blanco',
                parentLocationId = 'real-madrid',
                contentName = 'pierlugi-collina',
                languageCode = 'eng-GB',
                notified = false;

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });
            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: parentLocationId
            });

            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === "name") {
                        return contentName;
                    } else if (attr === "mainLanguageCode") {
                        return languageCode;
                    } else {
                        Y.fail("Unexpected parameter for content mock");
                    }

                }
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(false);
                }
            });

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: [Mock.Value.String, Mock.Value.Object]
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.isTrue(
                        e.notification.text.indexOf(contentName) !== -1,
                        "The notification text should contain content name"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(locationId) !== -1,
                        "The notification identifier should contain location id"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should fire sentToTrash event after sending content to the trash": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                that = this,
                locationId = 'raul-gonzalez-blanco',
                parentLocationId = 'real-madrid',
                contentName = 'pierlugi-collina',
                languageCode = "eng-GB",
                eventFired = false;

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: parentLocationId
            });

            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === "name") {
                        return contentName;
                    } else if (attr === "mainLanguageCode") {
                        return languageCode;
                    } else {
                        Y.fail("Unexpected parameter for content mock");
                    }

                }
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(false);
                }
            });

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: [Mock.Value.String, Mock.Value.Object]
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('sentToTrash', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('location'), e.location,
                    "sentToTrash event should store the service location"
                );
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Assert.isTrue(eventFired, "The sentToTrash event should have been fired");
        },

        "Should navigate the app to view of parent location": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                locationId = 'raul-gonzalez-blanco',
                contentName = 'pierlugi-collina',
                parentLocationId = 'alan-shearer',
                mainLanguageCode = 'eng-GB';

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === "name") {
                        return contentName;
                    } else if (attr === "mainLanguageCode") {
                        return mainLanguageCode;
                    } else {
                        Y.fail("Unexpected parameter `" + attr + "` for content mock");
                    }

                }
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: parentLocationId
            });

            Mock.expect(this.location, {
                method: 'trash',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(false);
                }
            });

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['viewLocation', Mock.Value.Object],
                run: function (routeName, params) {
                    Assert.areEqual(routeName, 'viewLocation', 'The route should be `viewLocation`');
                    Assert.isObject(params, "Params passed to navigateTo should be an object");
                    Assert.areEqual(
                        params.id,
                        parentLocationId,
                        'The id of location should be the parent location id'
                    );
                    Assert.areEqual(
                        params.languageCode,
                        mainLanguageCode,
                        'The languageCode should be the main language code of content'
                    );
                }
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.fire('whatever:sendToTrashAction', {content: content});
            Mock.verify(this.app);
        },
    });

    Y.Test.Runner.setName("eZ Location View View Service tests");
    Y.Test.Runner.add(unitTest);
    Y.Test.Runner.add(functionalTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(sendToTrashButtonTest);
    Y.Test.Runner.add(moveContentTest);
}, '', {requires: ['test', 'ez-locationviewviewservice']});
