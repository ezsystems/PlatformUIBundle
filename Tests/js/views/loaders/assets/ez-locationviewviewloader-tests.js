YUI.add('ez-locationviewviewloader-tests', function (Y) {
    var functionalTest, unitTest;

    functionalTest = new Y.Test.Case({
        name: "eZ Location View View Loader 'functional' tests",

        setUp: function () {
            this.rootLocationId = '/api/ezp/v2/content/locations/1/2';
            this.leafLocationId = '/api/ezp/v2/content/locations/1/2/67/68/111';
            this.request = {};
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
            this.locations = {};
            this.contents = {};
        },

        _initContentService: function (fail) {
            Y.Mock.expect(this.contentServiceMock, {
                method: 'loadRoot',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(
                        fail ? true : false,
                        {document: {Root: {rootLocation: {_href: functionalTest.rootLocationId}}}}
                    );
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
                        depth: locationId.split('/').length - functionalTest.rootLocationId.split('/').length,
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
                    new Y.eZ.Content({id: contentId})
                );
                Y.Mock.expect(functionalTest.contents[contentId], {
                    method: 'load',
                    args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                    run: function (options, callback) {
                        Y.Assert.areSame(
                            functionalTest.capiMock, options.api,
                            "The content load function should receive the CAPI"
                        );
                        callback(contentId === failContentId ? true : false);
                    }
                });

                prevLocationId = locationId;
            });
        },

        _normalLoading: function (locationId) {
            var loader, callbackCalled = false,
                response = {},
                location, content;

            this._initContentService();
            this._initTree();
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            loader = new Y.eZ.LocationViewViewLoader({
                capi: this.capiMock,
                location: location,
                content: content,
                response: response,
                request: this.request
            });
            loader._newLocation = function (params) {
                return functionalTest.locations[params.id];
            };
            loader._newContent = function (params) {
                return functionalTest.contents[params.id];
            };
            loader.load(function () {
                var depth, prevLocation;

                callbackCalled = true;
                Y.Assert.areSame(
                    location, response.variables.location,
                    "The response.variables should get the location"
                );
                Y.Assert.areSame(
                    content, response.variables.content,
                    "The response.variables should get the content"
                );
                Y.Assert.isArray(
                    response.variables.path, "The path should be an array"
                );
                depth = location.get('id').split('/').length - functionalTest.rootLocationId.split('/').length;
                Y.Assert.areSame(
                    depth, response.variables.path.length,
                    "The path should have " + depth + " entries"
                );
                Y.Array.each(response.variables.path, function (entry) {
                    Y.Assert.isInstanceOf(
                        Y.eZ.Content, entry.content,
                        "Each path entry should have Y.eZ.Content instance"
                    );
                    Y.Assert.isInstanceOf(
                        Y.eZ.Location, entry.location,
                        "Each path entry should have Y.eZ.Location instance"
                    );
                    Y.Assert.isTrue(
                        entry.location.get('resources').Content === entry.content.get('id'),
                        "The content and the location in each path entry should match"
                    );
                    if ( prevLocation ) {
                        Y.Assert.areSame(
                            prevLocation.get('id'),
                            entry.location.get('resources').ParentLocation,
                            "Each location entry should be the parent of the next one"
                        );
                    }

                    prevLocation = entry.location;
                });
            });

            Y.Assert.isTrue(callbackCalled, "The load callback should have been called");
            Y.Mock.verify(this.capiMock);
            Y.Mock.verify(this.contentServiceMock);
        },

        _errorLoading: function (locationId, contentServiceError, locationIdError, contentIdError) {
            var loader, errorCalled = false,
                response = {},
                location, content;

            this._initContentService(contentServiceError);
            this._initTree(locationIdError, contentIdError);
            this.request = {params: {id: locationId}};

            location = this.locations[this.request.params.id];
            content = this.contents[location.get('resources').Content];
            loader = new Y.eZ.LocationViewViewLoader({
                capi: this.capiMock,
                location: location,
                content: content,
                response: response,
                request: this.request
            });
            loader._newLocation = function (params) {
                return functionalTest.locations[params.id];
            };
            loader._newContent = function (params) {
                return functionalTest.contents[params.id];
            };
            loader.on('error', function (e) {
                Y.Assert.isObject(e, "An event facade should be provided");
                Y.Assert.isString(e.message, "The message property should be filled");
                errorCalled = true;
            });
            loader.load(function () {
                Y.Assert.fail("The load callback should not be called");
            });

            Y.Assert.isTrue(errorCalled, "The error event should have been fired");
        },

        "Should load the location, the content and the path for the leaf location": function () {
            this._normalLoading(this.leafLocationId);
        },

        "Should load the location, the content and the path for an intermediate location": function () {
            this._normalLoading('/api/ezp/v2/content/locations/1/2/67/68');
        },

        "Should load the location, the content and the path for the root location": function () {
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

        "Should handle error on the leaf content loading": function () {
            this._errorLoading(this.leafLocationId, false, false, this.contentIds[this.leafLocationId]);
        },

        "Should handle error on an intermediate content loading": function () {
            this._errorLoading(this.leafLocationId, false, false, '/api/ezp/v2/content/objects/65');
        }
    });

    unitTest = new Y.Test.Case({
        name: "eZ Location View View Loader unit test",

        "Should sort path by location depth": function () {
            var loader,
                pathInput = [], pathOut, i;

            pathInput.push({
                location: new Y.eZ.Location({depth: 2}),
                content: {}
            });
            pathInput.push({
                location: new Y.eZ.Location({depth: 3}),
                content: {}
            });
            pathInput.push({
                location: new Y.eZ.Location({depth: 1}),
                content: {}
            });
            pathInput.push({
                location: new Y.eZ.Location({depth: 0}),
                content: {}
            });

            loader = new Y.eZ.LocationViewViewLoader();
            loader.set('path', pathInput);
            pathOut = loader.get('path');

            Y.Assert.areSame(
                pathInput.length, pathOut.length,
                "The input path and the out path should have the same length"
            );

            for (i = 0; i != pathOut.length; ++i) {
                Y.Assert.areSame(
                    i, pathOut[i].location.get('depth'),
                    "The path should be sorted by depth"
                );
            }
        },

        "Should create a location": function () {
            var TestLoader, loader, id = 'myid';

            TestLoader = Y.Base.create('testLoader', Y.eZ.LocationViewViewLoader, [], {
                testNewLocation: function (conf) {
                    return this._newLocation(conf);
                }
            });

            loader = new TestLoader();
            Y.Assert.isInstanceOf(Y.eZ.Location, loader.testNewLocation());
            Y.Assert.areSame(id, loader.testNewLocation({'id': id}).get('id'));
        },

        "Should create a content": function () {
            var TestLoader, loader, id = 'myid';

            TestLoader = Y.Base.create('testLoader', Y.eZ.LocationViewViewLoader, [], {
                testNewContent: function (conf) {
                    return this._newContent(conf);
                }
            });

            loader = new TestLoader();
            Y.Assert.isInstanceOf(Y.eZ.Content, loader.testNewContent());
            Y.Assert.areSame(id, loader.testNewContent({'id': id}).get('id'));
        }
    });

    Y.Test.Runner.setName("eZ Location View View Loader tests");
    Y.Test.Runner.add(unitTest);
    Y.Test.Runner.add(functionalTest);

}, '0.0.1', {requires: ['test', 'ez-locationviewviewloader']});
