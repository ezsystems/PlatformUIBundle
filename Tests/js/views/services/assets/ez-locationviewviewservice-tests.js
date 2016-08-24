/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewviewservice-tests', function (Y) {
    var functionalTest, eventTest, getViewParametersTest, sendToTrashButtonTest,
        moveContentTest, deleteContentTest, translateContent,
        Assert = Y.Assert, Mock = Y.Mock;

    functionalTest = new Y.Test.Case({
        name: "eZ Location View View Service 'functional' tests",

        setUp: function () {
            this.rootLocationId = '/api/ezp/v2/content/locations/1/2';
            this.leafLocationId = '/api/ezp/v2/content/locations/1/2/67/68/111';
            this.contentTypeId = '/api/ezp/v2/content/types/38';
            this.request = {params: {languageCode: 'fre-FR'}};
            this.capiMock = new Y.Test.Mock();
            this.contentServiceMock = new Y.Test.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentServiceMock
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
            this.contentType = new Mock();
            this.locations = {};
            this.contents = {};
        },

        _initContentType: function (fail) {
            Mock.expect(this.contentType, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capiMock, options.api,
                        "The CAPI should be provided to the Content Type load method"
                    );
                    Assert.isTrue(
                        options.loadGroups,
                        "The `loadGroups` flag should be set"
                    );
                    callback(fail ? true : false);
                }, this),
            });
            Mock.expect(this.contentType, {
                method: 'set',
                args: ['id', this.contentTypeId]
            });
            Mock.expect(this.contentType, {
                method: 'get',
                args: ['id'],
                returns: this.contentTypeId,
            });
        },

        _initTree: function (failLocationId, failContentId, loadPathError) {
            var prevLocationId;

            Y.Array.each(this.locationIds, function (locationId, key) {
                var contentId = functionalTest.contentIds[locationId];

                functionalTest.locations[locationId] = new Y.Test.Mock(
                    new Y.eZ.Location({
                        id: locationId,
                        depth: locationId.split('/').length - functionalTest.rootLocationId.split('/').length + 1,
                        pathString: locationId.replace('/api/ezp/v2/content/locations', ''),
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
                Y.Mock.expect(functionalTest.locations[locationId], {
                    method: 'loadPath',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: function (options, callback) {
                        var path = [];

                        if (!loadPathError) {
                            Y.Assert.areSame(
                                functionalTest.capiMock, options.api,
                                "The location load function should receive the CAPI"
                            );

                            Y.Object.each(functionalTest.locations, function (obj, key) {
                                if (locationId.indexOf(key) > -1 && key !== locationId) {
                                    path.push(obj);
                                }
                            });
                        }

                        callback(loadPathError, path);
                    }
                });
                functionalTest.contents[contentId] = new Y.Test.Mock(
                    new Y.eZ.Content({
                        id: contentId,
                        resources: {
                            ContentType: functionalTest.contentTypeId
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

            this._initContentType();
            this._initTree();
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            service = new Y.eZ.LocationViewViewService({
                capi: this.capiMock,
                location: location,
                content: content,
                contentType: this.contentType,
                response: response,
                request: this.request
            });
            service.load(function (param) {
                var response = service.get('response'),
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
        },

        _errorLoading: function (locationId, contentServiceError, locationIdError, contentIdError, contentTypeError, loadPathError) {
            var service, errorCalled = false,
                response = {},
                location, content;

            this._initContentType(contentTypeError);
            this._initTree(locationIdError, contentIdError, loadPathError);
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            service = new Y.eZ.LocationViewViewService({
                capi: this.capiMock,
                location: location,
                content: content,
                contentType: this.contentType,
                response: response,
                request: this.request
            });
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

        "Should handle error on the left location loading": function () {
            this._errorLoading(this.leafLocationId, false, this.leafLocationId, false);
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

        "Should handle error when loading the path fails": function () {
            this._errorLoading(this.leafLocationId, false, false, false, false, true);
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Location View View Service event tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();
            this.contentServiceMock = new Y.Mock();
            this.locationMock = new Y.Mock();
            this.loadOptions = {api: this.capi};
            this.locationId = '42';
            this.sortField = "PRIORITY";
            this.sortOrder = 'ASC';
            this.priority = '50';
            this.updateStruct = {
                body: {
                    LocationUpdate: {
                        sortField: this.sortField,
                        sortOrder: this.sortOrder,
                        priority: this.priority,
                    }
                }
            };
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capi,
                request: this.request,
                location: this.locationMock,
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentServiceMock
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.content;
        },

        "Should fire `editContentRequest` when receiving an editAction event": function () {
            var content = {},
                contentType = {},
                languageCode = {};

            this.service.set('contentType', contentType);
            this.service.set('languageCode', languageCode);

            this.service.on('*:editContentRequest', function (e) {
                Assert.areSame(
                    content,
                    e.content,
                    "Content provided in the EventFacade is not the same"
                );
                Assert.areSame(
                    contentType,
                    e.contentType,
                    "ContentType provided in the EventFacade is not the same"
                );
                Assert.areSame(
                    languageCode,
                    e.languageCode,
                    "LanguageCode provided in the EventFacade is not the same"
                );
            });

            this.service.fire('whatever:editAction', {content: content});
        },

        "Should update the sort methods on sortUpdate event": function () {
            var that = this,
                updatedLocationSortingFired = false;

            Mock.expect(this.locationMock, {
                method: 'updateSorting',
                args: [Mock.Value.Object, this.sortField, this.sortOrder, Mock.Value.Function],
                run: function (options, sortField, sortOrder, cb) {
                    Assert.areSame(options.api, that.capi, "load options should contain JS REST API");
                    cb(false);
                },
            });
            this.service.on('updatedLocationSorting', Y.bind(function (e) {
                updatedLocationSortingFired = true;

                Assert.areSame(
                    this.locationMock,
                    e.location,
                    "The Location should be provided in the updatedLocationSorting event facade"
                );

            }, this));
            this.service.fire('whatever:sortUpdate', {sortType: this.sortField, sortOrder: this.sortOrder});

            Mock.verify(this.locationMock);
            Assert.isTrue(
                updatedLocationSortingFired,
                "The updatedLocationSorting event should have been fired"
            );
        },

        "Should send a started notification on sortUpdate event": function () {
            var notified = false,
                that = this;

            Mock.expect(this.locationMock, {
                method: 'updateSorting',
                args: [Mock.Value.Object, this.sortField, this.sortOrder, Mock.Value.Function],
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
                    e.notification.identifier.indexOf(that.sortField) !== -1,
                    "The notification identifier should contain the sortField"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(that.sortOrder) !== -1,
                    "The notification identifier should contain the sortOrder"
                );
                Assert.areSame(
                    5, e.notification.timeout,
                    "The notification timeout should be set to 5"
                );
            });

            this.service.fire('whatever:sortUpdate', {sortType: this.sortField, sortOrder: this.sortOrder});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should send a 'done' notification after updating sorting with success": function () {
            var notified = false,
                that = this;

            Mock.expect(this.locationMock, {
                method: 'updateSorting',
                args: [Mock.Value.Object, this.sortField, this.sortOrder, Mock.Value.Function],
                run: function (options, sortField, sortOrder, cb) {
                    cb(false);
                },
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
                        e.notification.identifier.indexOf(that.sortField) !== -1,
                        "The notification identifier should contain the sortField"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(that.sortOrder) !== -1,
                        "The notification identifier should contain the sortOrder"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 5"
                    );
                });
            });
            this.service.fire('whatever:sortUpdate', {sortType: this.sortField, sortOrder: this.sortOrder});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should send a 'error' notification after error when updating sorting": function () {
            var notified = false,
                that = this;

            Mock.expect(this.locationMock, {
                method: 'updateSorting',
                args: [Mock.Value.Object, this.sortField, this.sortOrder, Mock.Value.Function],
                run: function (options, sortField, sortOrder, cb) {
                    cb(true);
                },
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
                        e.notification.identifier.indexOf(that.sortField) !== -1,
                        "The notification identifier should contain the sortField"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(that.sortOrder) !== -1,
                        "The notification identifier should contain the sortOrder"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });
            this.service.on('updatedLocationSorting', function () {
                Assert.fail('The updatedLocationSorting should not be fired');
            });
            this.service.fire('whatever:sortUpdate', {sortType: this.sortField, sortOrder: this.sortOrder});
            Assert.isTrue(notified, "The notified event should have been fired");
            Mock.verify(this.locationMock);
        },

        "Should update the priority on priorityUpdate event": function () {
            var that = this;

            Mock.expect(this.locationMock, {
                method: 'updatePriority',
                args: [Mock.Value.Object, this.priority, Mock.Value.Function],
                run: function (options, priority, cb) {
                    Assert.areSame(options.api, that.capi, "load options should contain JS REST API");
                    cb(false);
                },
            });
            this.service.fire('whatever:updatePriority', {location: this.locationMock, priority: this.priority});

            Mock.verify(this.locationMock);
        },

        "Should send a 'error' notification after error when updating priority": function () {
            var notified = false,
                that = this;

            Mock.expect(this.locationMock, {
                method: 'updatePriority',
                args: [Mock.Value.Object, this.priority, Mock.Value.Function],
                run: function (options, priority, cb) {
                    cb(true);
                },
            });

            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['locationId'],
                returns: this.locationId,
            });

            this.service.once('notify', function (e) {
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
                    e.notification.identifier.indexOf(that.locationId) !== -1,
                    "The notification identifier should contain the locationId"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });
            this.service.fire('whatever:updatePriority', {location: this.locationMock, priority: this.priority});
            Assert.isTrue(notified, "The notified event should have been fired");
            Mock.verify(this.locationMock);
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
            delete this.responseMock;
        },

        "Should launch the universal discovery widget when receiving an moveAction event": function () {
            var contentDiscovered = false,
                containerContentType = new Y.Mock(),
                nonContainerContentType = new Y.Mock();

            Y.Mock.expect(containerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });
            Y.Mock.expect(nonContainerContentType, {
                method: 'get',
                args: ['isContainer'],
                returns: false
            });

            this.service.on('contentDiscover', function (e) {
                contentDiscovered = true;
                Y.Assert.isObject(e.config, "contentDiscover config should be an object");
                Y.Assert.isFunction(e.config.contentDiscoveredHandler, "config should have a function named contentDiscoveredHandler");
                Y.Assert.isFunction(e.config.isSelectable, "config should have a function named isSelectable");

                Y.Assert.isTrue(
                    e.config.isSelectable({contentType: containerContentType}),
                    "isSelectable should return TRUE if selected content is container"
                );
                Y.Assert.isFalse(
                    e.config.isSelectable({contentType: nonContainerContentType}),
                    "isSelectable should return FALSE if selected content is container"
                );
            });
            this.service.fire('whatever:moveAction');
            Assert.isTrue(contentDiscovered, "The contentDiscover event should have been fired");
        },

        "Should notify when trying to move a content but get an error": function () {
            var that = this,
                notified = false,
                parentLocationMock = new Y.Mock(),
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
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
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
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
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock }};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
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
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
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
                parentContentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {location: parentLocationMock, contentInfo: parentContentInfoMock}};

            Y.Mock.expect(parentLocationMock, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId
            });
            Y.Mock.expect(parentContentInfoMock, {
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

    deleteContentTest = new Y.Test.Case({
        "name": "eZ Location View View Service delete content tests",

        setUp: function () {
            this.app = new Mock();
            this.capi = new Mock();
            this.content = new Mock();
            this.location = new Mock();
            this.languageCode = 'pol-PL';
            this.request = {params: {languageCode: this.languageCode}};
            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                capi: this.capi,
                content: this.content,
                location: this.location,
                request: this.request
            });
            this.contentName = 'pierlugi-collina';
            this.contentId = 'aContentId';
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _initializeMocks: function(content, parentLocation, callbackArgument) {
            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === "name") {
                        return this.contentName;
                    } else if (attr === "id") {
                        return this.contentId;
                    } else if (attr === "mainLanguageCode") {
                        return this.languageCode;
                    } else {
                        Y.fail("Unexpected parameter for content mock");
                    }
                }
            });

            Mock.expect(parentLocation, {
                method: 'get',
                args: ['id'],
                returns: 'alan-shearer'
            });

            Mock.expect(content, {
                method: 'delete',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback){
                    callback(callbackArgument);
                }
            });
        },

        "Should fire the confirmBoxOpen event": function () {
            var confirmBoxOpenEvent = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenEvent = true;
                Assert.isObject(e.config, "The event facade should contain a config object");
                Assert.isString(e.config.title, "The title should be defined");
                Assert.isFunction(e.config.confirmHandler, "A confirmHandler should be provided");
            });

            this.service.fire('whatever:deleteContentAction', {content: {}});
            Assert.isTrue(confirmBoxOpenEvent, "The confirmBoxOpen event should have been fired");
        },

        "Should notify the user when starting to delete the content item": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                notified = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            this._initializeMocks(content, parentLocation, true);

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
                    e.notification.text.indexOf(this.contentName) !== -1,
                    "The notification text should contain content name"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(this.contentId) !== -1,
                    "The notification identifier should contain content id"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should notify user about error when deleting content item failed": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                notified = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            this._initializeMocks(content, parentLocation, true);

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
                        e.notification.text.indexOf(this.contentName) !== -1,
                        "The notification text should contain content name"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(this.contentId) !== -1,
                        "The notification identifier should contain content id"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should NOT fire deletedContent event when deleting content item failed": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                that = this,
                eventFired = false;

            this.service.set('path', [{location: parentLocation}]);
            this.service.set('content', content);

            this._initializeMocks(content, parentLocation, true);

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('deletedContent', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('content'), e.content,
                    "deletedContent event should store the service content"
                );
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Assert.isFalse(eventFired, "The deletedContent event should NOT have been fired");
        },

        "Should notify user about success of deleting the content item": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                locationId = 'raul-gonzalez-blanco',
                notified = false;

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId,
            });

            this._initializeMocks(content, parentLocation, false);

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
                        e.notification.text.indexOf(this.contentName) !== -1,
                        "The notification text should contain content name"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(this.contentId) !== -1,
                        "The notification identifier should contain content id"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should fire deletedContent event after deleting a content item": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                that = this,
                eventFired = false;

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            this._initializeMocks(content, parentLocation, false);

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: [Mock.Value.String, Mock.Value.Object]
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('deletedContent', function (e) {
                eventFired = true;
                Assert.areSame(
                    that.service.get('content'), e.content,
                    "deletedContent event should store the service content"
                );
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Assert.isTrue(eventFired, "The sentToTrash event should have been fired");
        },

        "Should navigate the app to view of parent location": function () {
            var content = new Mock(),
                parentLocation = new Mock(),
                parentLocationId = 'alan-shearer';

            this.service.set('path', [parentLocation]);
            this.service.set('content', content);

            this._initializeMocks(content, parentLocation, false);

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
                        this.languageCode,
                        'The languageCode should be the main language code of content'
                    );
                }
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.fire('whatever:deleteContentAction', {content: content});
            Mock.verify(this.app);
        },
    });

    translateContent = new Y.Test.Case({
        name: "eZ Location View View Service translate content tests",

        setUp: function () {
            this.app = new Mock();

            this.service = new Y.eZ.LocationViewViewService({
                app: this.app,
                request: {params: {}},
            });
            this.view = new Y.View();
            this.view.addTarget(this.service);
        },

        tearDown: function () {
            this.service.destroy();
            this.view.destroy();
            delete this.service;
            delete this.view;
            delete this.app;
        },

        _getContent: function (id) {
            var content = new Y.Base();

            content.set('id', id);
            return content;
        },

        _configureAppNavigate: function (uri) {
            Mock.expect(this.app, {
                method: 'navigate',
                args: [uri],
            });
        },

        "Should redirect to the editContent route": function () {
            var contentId = 'red-hot-chili-peppers-the-getaway',
                content = this._getContent(contentId),
                languageCode = 'fre-FR',
                routeUri = '/edit/';

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['editContent', Mock.Value.Object],
                run: function (name, params) {
                    Assert.areEqual(
                        contentId, params.id,
                        "The content id should be in the route params"
                    );
                    Assert.areEqual(
                        languageCode, params.languageCode,
                        "The language code should be in the route params"
                    );
                    return routeUri;
                },
            });
            this._configureAppNavigate(routeUri);
            this.view.fire('translateContent', {
                content: content,
                toLanguageCode: languageCode,
            });
            Mock.verify(this.app);
        },

        "Should redirect to the translateContent route with the base language": function () {
            var contentId = 'red-hot-chili-peppers-the-getaway',
                content = this._getContent(contentId),
                languageCode = 'fre-FR',
                baseLanguageCode = 'eng-GB',
                routeUri = '/translate/';

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['translateContent', Mock.Value.Object],
                run: function (name, params) {
                    Assert.areEqual(
                        contentId, params.id,
                        "The content id should be in the route params"
                    );
                    Assert.areEqual(
                        languageCode, params.languageCode,
                        "The language code should be in the route params"
                    );
                    Assert.areEqual(
                        baseLanguageCode, params.baseLanguageCode,
                        "The base language code should be in the route params"
                    );
                    return routeUri;
                },
            });
            this._configureAppNavigate(routeUri);
            this.view.fire('translateContent', {
                content: content,
                toLanguageCode: languageCode,
                baseLanguageCode: baseLanguageCode,
            });
            Mock.verify(this.app);
        },
    });

    Y.Test.Runner.setName("eZ Location View View Service tests");
    Y.Test.Runner.add(functionalTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(sendToTrashButtonTest);
    Y.Test.Runner.add(moveContentTest);
    Y.Test.Runner.add(deleteContentTest);
    Y.Test.Runner.add(translateContent);
}, '', {requires: ['test', 'base', 'view', 'ez-locationviewviewservice']});
