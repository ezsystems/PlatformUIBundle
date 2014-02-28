YUI.add('ez-contenteditviewservice-tests', function (Y) {
    var cevlTest, eventTest;

    cevlTest = new Y.Test.Case({
        name: "eZ Content Edit View Service tests",

        setUp: function () {
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
                request: this.request,
                response: response,

                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner,
                version: this.version
            });

            service.load(callback);

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.owner);
            Y.Mock.verify(this.version);

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
        },

        "Should fire the 'error' event when the content loading fails": function () {
            var service, callback, errorTriggered = false;

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

                content: this.content
            });

            service.on('error', function (e) {
                errorTriggered = true;
            });

            service.load(callback);

            Y.Mock.verify(this.content);
            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        /**
         * @param {String} fail one of the value in this.mocks
         */
        _testSubloadError: function (fail) {
            var response = {}, service, callback,
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

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.contentType);
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
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View Service events tests",

        setUp: function () {
            this.version = new Y.Mock();
            this.location = new Y.Mock();
            this.capi = new Y.Mock();
            this.app = new Y.Mock();
            this.service = new Y.eZ.ContentEditViewService({
                app: this.app,
                capi: this.capi,
                version: this.version,
                location: this.location
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
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

        "Should publish the draft": function () {
            var fields = [{}, {}],
                locationId = 'something',
                viewLocationRoute = '/view/something';

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
            Y.Mock.expect(this.location, {
                method: 'get',
                args: ['id'],
                returns: locationId
            });
            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });
            Y.Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Y.Mock.Value.Object],
                run: function (route, params) {
                    Y.Assert.areEqual(
                        locationId,
                        params.id
                    );
                    return viewLocationRoute;
                }
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [viewLocationRoute]
            });

            this.service.fire('whatever:publishAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.version);
            Y.Mock.verify(this.app);
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
        }

    });

    Y.Test.Runner.setName("eZ Content Edit View Service tests");
    Y.Test.Runner.add(cevlTest);
    Y.Test.Runner.add(eventTest);

}, '0.0.1', {requires: ['test', 'ez-contenteditviewservice']});
