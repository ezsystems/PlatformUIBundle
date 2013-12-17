YUI.add('ez-contenteditviewloader-tests', function (Y) {
    var cevlTest;

    cevlTest = new Y.Test.Case({
        name: "eZ Content Edit View Loader tests",

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
        },

        "Should load the content, the location, the content type and the owner": function () {
            var response = {}, loader, callback,
                callbackCalled = false,
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

            callback = function () {
                Y.Assert.areSame(response.variables.content, cevlTest.content);
                callbackCalled = true;
            };

            loader = new Y.eZ.ContentEditViewLoader({
                capi: this.capiMock,
                request: this.request,
                response: response,

                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner
            });

            loader.load(callback);

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.owner);

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
        },

        "Should fire the 'error' event when the content loading fails": function () {
            var loader, callback, errorTriggered = false;

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

            loader = new Y.eZ.ContentEditViewLoader({
                capi: this.capiMock,
                request: this.request,

                content: this.content
            });

            loader.on('error', function (e) {
                errorTriggered = true;
            });

            loader.load(callback);

            Y.Mock.verify(this.content);
            Y.Assert.isTrue(errorTriggered, "The error event should have been triggered");
        },

        /**
         * @param {String} fail one of the value in this.mocks
         */
        _testSubloadError: function (fail) {
            var response = {}, loader, callback,
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

            callback = function () {
                Y.Assert.fail("The load callback should not be called");
            };

            loader = new Y.eZ.ContentEditViewLoader({
                capi: this.capiMock,
                request: this.request,
                response: response,

                content: this.content,
                location: this.mainLocation,
                contentType: this.contentType,
                owner: this.owner
            });


            loader.on('error', function (e) {
                errorTriggered = true;
            });

            loader.load(callback);

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.mainLocation);
            Y.Mock.verify(this.contentType);
            Y.Mock.verify(this.owner);

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
        }
    });

    Y.Test.Runner.setName("eZ Content Edit View Loader tests");
    Y.Test.Runner.add(cevlTest);

}, '0.0.1', {requires: ['test', 'ez-contenteditviewloader']});
