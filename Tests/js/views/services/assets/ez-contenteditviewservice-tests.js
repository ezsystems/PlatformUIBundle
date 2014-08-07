/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditviewservice-tests', function (Y) {
    var cevlTest, eventTest;

    cevlTest = new Y.Test.Case({
        name: "eZ Content Edit View Service tests",

        setUp: function () {
            var that = this;

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

            Y.Mock.expect(this.mainLocation, {
                method: 'get',
                args: ['id'],
                returns: this.locationId,
                callCount: 3
            });
            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Y.Mock.Value.Object],
                callCount: 3,
                run: function (route, params) {
                    Y.Assert.areEqual(
                        that.locationId,
                        params.id
                    );
                    return that.viewLocationRoute;
                }
            });
        },

        "Should create a new version and load the content, the location, the content type and the owner": function () {
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
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['resources'],
                returns: this.resources
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

            Y.Mock.expect(this.version, {
                method: 'loadNew',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Y.Assert.areEqual(
                        that.request.params.id,
                        options.contentId,
                        "The content id should passed to the loadNew method"
                    );
                    runLoadCallback(options, callback);
                }
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

        'Should create a new version, load the location, the owner and the content type by identifer': function () {
            var response = {}, service, callback,
                resources = {
                    'Owner': '/api/ezp/v2/user/users/14',
                    'MainLocation': '/api/ezp/v2/content/locations/1/2/61',
                    'ContentType': '/api/ezp/v2/content/types/16'
                },
                callbackCalled = false,
                app = new Y.Test.Mock(),
                request = {
                    params: {
                        contentTypeIdentifier: 'article',
                        id: '/api/ezp/v2/content/locations/1/2/61'
                    }
                },
                runLoadCallback = function (options, cb) {
                    Y.Assert.areSame(
                        options.api, cevlTest.capiMock,
                        "The 'api' property should be the CAPI"
                    );
                    cb(false);
                };

            Y.Mock.expect(app, {
                method: 'get',
                args: ['user'],
                run: function () {
                    return {
                        get: function (name) {
                            if (name === 'id') {
                                return '/api/ezp/v2/user/users/14';
                            }
                        }
                    };
                }
            });

            Y.Mock.expect(app, {
                method: 'routeUri',
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function () {
                    return 'test';
                }
            });

            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', request.params.id]
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['resources'],
                returns: resources
            });

            Y.Object.each(resources, function (val, key) {
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

            Y.Mock.expect(this.version, {
                method: 'loadNew',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, cb) {
                    Y.Assert.areEqual(
                        request.params.id,
                        options.contentId,
                        "The content id should passed to the loadNew method"
                    );
                    runLoadCallback(options, cb);
                }
            });

            Y.Mock.expect(this.capiMock, {
                method: 'getContentTypeService',
                run: function () {
                    return {
                        loadContentTypeByIdentifier: function (name, cb) {
                            service.set('contentTypeId', '/api/ezp/v2/content/types/16');
                            service._loadContentType('/api/ezp/v2/content/types/16', callback);
                        }
                    };
                }
            });

            callback = function () {
                callbackCalled = true;
            };

            service = new Y.eZ.ContentEditViewService({
                capi: this.capiMock,
                app: app,
                request: request,
                response: response,
                content: this.content,
                contentType: this.contentType,
                location: this.mainLocation,
                owner: this.owner,
                version: this.version
            });

            service.load(callback);

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
        },

        "Should fire the 'error' event when the content loading fails": function () {
            var service, callback,
                errorTriggered = false;

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
                content: this.content
            });

            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.app);
            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
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

            Y.Mock.expect(this.content, {
                method: 'set',
                args: ['id', this.request.params.id]
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['resources'],
                returns: this.resources
            });

            Y.Mock.expect(this.mainLocation, {
                method: 'get',
                args: ['id'],
                returns: this.locationId,
                callCount: 3
            });

            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Y.Mock.Value.Object],
                callCount: 3,
                run: function (route, params) {
                    Y.Assert.areEqual(
                        that.locationId,
                        params.id
                    );
                    return that.viewLocationRoute;
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

            Y.Mock.expect(this.version, {
                method: 'loadNew',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: fail === 'version' ? runLoadCallbackFail : runLoadCallbackSuccess
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

        "Should fire the error event when the version creation fails":  function () {
            this._testSubloadError('version');
        },

        'Should create and set an empty version model': function () {
            var isCreated = false,
                service = new Y.eZ.ContentEditViewService({
                    app: this.app,
                    capi: this.capiMock,
                    content: this.content,
                    version: this.version,
                    location: this.mainLocation
                });

            service.after('versionChange', function (event) {
                isCreated = true;
            });

            service._createEmptyPropertyObject('version');

            Y.Assert.isTrue(isCreated, 'A new empty version model has been created and set as a service attribute as expected');
            Y.Mock.verify(service);
        },

        'Should not create and set an empty undefined model': function () {
            var service = new Y.eZ.ContentEditViewService({
                    app: this.app,
                    capi: this.capiMock,
                    content: this.content,
                    version: this.version,
                    location: this.mainLocation
                }),
                isCreated = false;

            service.after('anyChange', function (event) {
                isCreated = true;
            });

            service._createEmptyPropertyObject('any');

            Y.Assert.isFalse(isCreated, 'A new empty any model has not been created and set as a service attribute as expected');
        }
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View Service events tests",

        setUp: function () {
            var that = this;

            this.viewLocationRoute = '/view/something';
            this.locationId = 'something';

            this.version = new Y.Mock();
            this.location = new Y.Mock();
            this.capi = new Y.Mock();
            this.app = new Y.Mock();
            this.contentTypeModel = new Y.Mock();

            Y.Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: this.locationId
            });
            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Y.Mock.Value.Object],
                callCount: 3,
                run: function (route, params) {
                    Y.Assert.areEqual(
                        that.locationId,
                        params.id
                    );
                    return that.viewLocationRoute;
                }
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.viewLocationRoute],
                callCount: 1
            });

            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                capi: this.capi,
                version: this.version,
                location: this.location,
                contentType: this.contentTypeModel
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should discard the draft": function () {
            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });

            Y.Mock.expect(this.version, {
                method: 'destroy',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Y.Assert.areSame(
                        options.api,
                        eventTest.capi,
                        "The destroy options should contain the CAPI"
                    );
                    Y.Assert.isTrue(
                        options.remove,
                        "The remove option should be set to true"
                    );
                    callback();
                }
            });

            this.service.fire('whatever:discardAction');
        },

        "Should not store the draft": function () {
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    Y.Assert.fail("The version should not be saved");
                }
            });
            this.service.fire('whatever:saveAction', {
                formIsValid: false
            });
        },

        "Should store the draft": function () {
            var fields = [{}, {}];

            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Y.Assert.areSame(
                        eventTest.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    Y.Assert.areSame(
                        fields,
                        options.fields,
                        "The fields from the event facade should be passed in the save options"
                    );
                    callback();
                }
            });
            this.service.fire('whatever:saveAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.version);
        },

        'Should create a draft for a new content': function () {
            var fields = [{}, {}],
                service = this.service,
                isCalled = false,
                contentService = new Y.Mock();

            Y.Mock.expect(this.contentTypeModel, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (name) {
                    return {
                        title: {
                            isRequired: true,
                            id: 181
                        },
                        tags: {
                            isRequired: false,
                            id: 190
                        },
                        intro: {
                            isRequired: true,
                            id: 184
                        }
                    };
                }
            });
            Y.Mock.expect(contentService, {
                method: 'newLocationCreateStruct',
                args: [Y.Mock.Value.String],
                run: function () {
                    return {
                        body: {
                            LocationCreate: {
                                ParentLocation: {"_href":"/api/ezp/v2/content/locations/1/2/90/93"},
                                sortField: "PATH",
                                sortOrder: "ASC"
                            }
                        },
                        headers: {
                            Accept: "application/vnd.ez.api.Location+json",
                            "Content-Type": "application/vnd.ez.api.LocationCreate+json"
                        }
                    };
                }
            });
            Y.Mock.expect(contentService, {
                method: 'newContentCreateStruct',
                args: [Y.Mock.Value.String, Y.Mock.Value.Object, Y.Mock.Value.String],
                run: function () {
                    return {
                        setField: function (id, name, value) {
                            return this.body.ContentCreate.fields.field.push({
                                id: id,
                                fieldDefinitionIdentifier: name,
                                fieldValue: value,
                                languageCode: this.body.ContentCreate.mainLanguageCode
                            });
                        },
                        getField: function (name) {
                            return this.body.ContentCreate.fields.field[name];
                        },
                        "body": {
                            "ContentCreate": {
                                "ContentType": {"_href":"/api/ezp/v2/content/types/16"},
                                "mainLanguageCode": "eng-GB",
                                "LocationCreate": {
                                    "ParentLocation": {"_href": "/api/ezp/v2/content/locations/1/2/90/93"},
                                    "sortField": "PATH",
                                    "sortOrder": "ASC"
                                },
                                "Section": null,
                                "alwaysAvailable": "true",
                                "remoteId": null,
                                "modificationDate": "2014-09-05T12:50:57.589Z",
                                "fields":{"field":[]}
                            }
                        },
                        "headers": {
                            "Accept": "application/vnd.ez.api.Content+json",
                            "Content-Type": "application/vnd.ez.api.ContentCreate+json"
                        }
                    };
                }
            });
            Y.Mock.expect(contentService, {
                method: 'createContent',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    isCalled = true;
                }
            });
            Y.Mock.expect(this.capi, {
                method: 'getContentService',
                run: function () {
                    return contentService;
                }
            });

            service.set('createMode', true);
            service.set('contentTypeId', '/api/ezp/v2/content/types/16');
            service.set('request', {
                params: {
                    contentTypeIdentifier: "article",
                    contentTypeLang: "eng-GB",
                    id: "/api/ezp/v2/content/locations/1/2/90/93"
                }
            });
            service.fire('test:saveAction', {
                fields: fields,
                formIsValid: true
            });

            Y.Assert.isTrue(isCalled, '_createNewContentStruct() method was called as expected');
        },

        "Should publish the draft": function () {
            var fields = [{}, {}];

            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Y.Assert.areSame(
                        eventTest.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    Y.Assert.areSame(
                        fields,
                        options.fields,
                        "The fields from the event facade should be passed in the save options"
                    );
                    Y.Assert.isTrue(
                        options.publish,
                        "The publish option should be set true"
                    );
                    callback();
                }
            });

            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });

            this.service.fire('whatever:publishAction', {
                formIsValid: true,
                fields: fields
            });
        },

        'Should publish a draft of new content': function () {
            var fields = [{}, {}],
                isCalled = false;

            Y.Mock.expect(this.service, {
                method: '_createNewContentStruct',
                args: [Y.Mock.Value.Any, Y.Mock.Value.Function],
                run: function (fields, callback) {
                    isCalled = true;
                }
            });

            this.service.set('createMode', true);
            this.service.set('isNewContentDraftCreated', false);
            this.service.fire('test:publishAction', {
                fields: fields,
                formIsValid: true
            });

            Y.Assert.isTrue(isCalled, '_createNewContentStruct() method was called as expected');
        },

        "Should not publish the draft": function () {
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    Y.Assert.fail("The version should not be saved");
                }
            });
            this.service.fire('whatever:publishAction', {
                formIsValid: false
            });
        },

        'Should close the view': function () {
            this.service.fire('test:closeView');
            Y.Mock.verify(this.app);
        }
    });

    Y.Test.Runner.setName("eZ Content Edit View Service tests");
    Y.Test.Runner.add(cevlTest);
    Y.Test.Runner.add(eventTest);

}, '', {requires: ['test', 'ez-contenteditviewservice', 'promise']});
