/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchplugin-tests', function (Y) {
    var locationSearchTests, locationSearchEventTests, _configureQueryAndContentServiceMock,
        contentSearchTests, loadResourcesTests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    _configureQueryAndContentServiceMock = function (context, queryMethodName) {
        Mock.expect(context.query, {
            method: queryMethodName,
            args: [Mock.Value.Object],
        });

        Mock.expect(context.contentService, {
            method: 'createView',
            args: [context.query, Mock.Value.Function],
        });
    };

    contentSearchTests = new Y.Test.Case({
        name: "eZ Search Plugin content search tests",

        setUp: function () {
            this.Content = function () {};
            this.Content.prototype.loadFromHash = function (hash) {
                this.hash = hash;
            };
            this.Content.prototype.get = Y.bind(function (whatever) {
                return {ContentType: this.contentTypeId};
            }, this);
            this.contentTypeId = 'this/is/my/content/type/id';
            this.limit = 42;
            this.offset = 69;
            this.capi = new Mock();
            this.contentService = new Mock();
            this.viewName = 'REST-View-Name';
            this.query = new Y.Mock();
            this.sortClauses = {};
            Mock.expect(this.query, {
                method: 'setLimitAndOffset',
                args: [this.limit, this.offset],
            });
            Mock.expect(this.query, {
                method: 'setSortClauses',
                args: [Mock.Value.Object],
                run: Y.bind(function (arg) {
                    Assert.areSame(
                        this.sortClauses,
                        arg,
                        "method argument should be the sortClauses"
                    );
                }, this)
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [this.viewName, 'ContentQuery'],
                returns: this.query,
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.view = new Y.Base({bubbleTargets: this.service});
            this.plugin = new Y.eZ.Plugin.Search({
                host: this.service,
                contentModelConstructor: this.Content,
            });
            Y.eZ.ContentType = Y.Model;
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.capi;
            delete this.contentService;
            delete this.query;
            delete Y.eZ.ContentType;
        },

        "Should create a content search query with criteria": function () {
            var criteria = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setCriteria');
            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    criteria: criteria,
                    sortClauses: sortClauses,
                    offset: this.offset,
                    limit: this.limit,
                }
            });
            Y.Mock.verify(this.query);
        },

        "Should create a content search query with query": function () {
            var query = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setQuery');
            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    query: query,
                    sortClauses: sortClauses,
                    offset: this.offset,
                    limit: this.limit,
                }
            });
            Y.Mock.verify(this.query);
        },

        "Should create a content search query with filter": function () {
            var filter = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setFilter');
            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    filter: filter,
                    sortClauses: sortClauses,
                    offset: this.offset,
                    limit: this.limit,
                }
            });
            Y.Mock.verify(this.query);
        },

        "Should handle the search error": function () {
            var callbackCalled = false,
                err = new Error();

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(err);
                }
            });

            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    offset: this.offset,
                    limit: this.limit,
                },
                callback: function (error) {
                    callbackCalled = true;
                    Assert.areSame(
                        err, error,
                        "The error should be provided to the callback"
                    );
                },
            });

            Assert.isTrue(callbackCalled, "The callback provided in the event should have been called");
        },

        "Should parse the results and provide them to the callback": function () {
            var callbackCalled = false,
                resultCount = 42,
                contents = [{}, {}],
                response = {
                    document: {
                        View: {
                            Result: {
                                count: resultCount,
                                searchHits: {
                                    searchHit: [{
                                        value: {
                                            Content: contents[0]
                                        },
                                    }, {
                                        value: {
                                            Content: contents[1]
                                        }
                                    }]
                                }
                            }
                        }
                    }
                };

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    offset: this.offset,
                    limit: this.limit,
                },
                callback: function (error, result, count) {
                    callbackCalled = true;

                    Assert.areEqual(
                        resultCount, count,
                        "The result count should be provided"
                    );
                    Assert.areSame(
                        contents[0], result[0].content.hash,
                        "The content should have been created from the results"
                    );
                    Assert.areSame(
                        contents[1], result[1].content.hash,
                        "The content should have been created from the results"
                    );
                },
            });

            Assert.isTrue(callbackCalled, "The callback provided in the event should have been called");
        },

        "Should load the content type": function () {
            var callbackCalled = false,
                response = {
                    document: {
                        View: {
                            Result: {
                                count: 1,
                                searchHits: {
                                    searchHit: [{
                                        value: {
                                            Content: {},
                                        },
                                    }]
                                }
                            }
                        }
                    }
                };

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    offset: this.offset,
                    limit: this.limit,
                },
                loadContentType: true,
                callback: Y.bind(function (error, result, count) {
                    callbackCalled = true;

                    Assert.isInstanceOf(
                        Y.eZ.ContentType, result[0].contentType,
                        "The contentType model should be added to the struct"
                    );
                    Assert.areEqual(
                        this.contentTypeId, result[0].contentType.get('id'),
                        "The contentType should have the content type id"
                    );

                }, this),
            });

            Assert.isTrue(callbackCalled, "The callback provided in the event should have been called");
        },

        "Should handle content type loading error": function () {
            var callbackCalled = false,
                response = {
                    document: {
                        View: {
                            Result: {
                                count: 1,
                                searchHits: {
                                    searchHit: [{
                                        value: {
                                            Content: {},
                                        },
                                    }]
                                }
                            }
                        }
                    }
                },
                err = new Error();

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            Y.eZ.ContentType = function () {};
            Y.eZ.ContentType.prototype.load = function (options, callback) {
                callback(err);
            };

            this.view.fire('contentSearch', {
                viewName: this.viewName,
                search: {
                    offset: this.offset,
                    limit: this.limit,
                },
                loadContentType: true,
                callback: Y.bind(function (error) {
                    callbackCalled = true;

                    Assert.areSame(
                        err, error,
                        "The loading content type error should be provided"
                    );
                }, this),
            });

            Assert.isTrue(callbackCalled, "The callback provided in the event should have been called");
        },
    });

    locationSearchTests = new Y.Test.Case({
        name: "eZ Search Plugin findLocations tests",

        setUp: function () {
            this.LocationModelConstructor = function () {};
            this.capi = new Mock();
            this.contentService = new Mock();
            this.viewName = 'REST-View-Name';
            this.query = new Mock();
            this.sortClauses = {};
            this.limit = 42;
            this.offset = 69;

            Mock.expect(this.query, {
                method: 'setLimitAndOffset',
                args: [this.limit, this.offset],
            });
            Mock.expect(this.query, {
                method: 'setSortClauses',
                args: [this.sortClauses],
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [this.viewName, 'LocationQuery'],
                returns: this.query,
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.plugin = new Y.eZ.Plugin.Search({
                host: this.service,
                locationModelConstructor: this.LocationModelConstructor,
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.capi;
            delete this.contentService;
            delete this.query;
        },

        _runSearch: function (search, callback) {
            search.viewName = this.viewName;
            this.plugin.findLocations(search, callback);
        },

        "Should create a LocationQuery with criteria": function () {
            var criteria = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setCriteria');
            this._runSearch({
                criteria: criteria,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            }, function () {});
            Y.Mock.verify(this.query);
        },

        "Should create a LocationQuery with filter": function () {
            var filter = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setFilter');
            this._runSearch({
                filter: filter,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            }, function () {});
            Y.Mock.verify(this.query);
        },

        "Should create a LocationQuery with query": function () {
            var query = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setQuery');
            this._runSearch({
                query: query,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            }, function () {});
            Y.Mock.verify(this.query);
        },

        "Should create a LocationQuery with a criteria": function () {
            var criteria = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setCriteria');
            this._runSearch({
                criteria: criteria,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            }, function () {});
            Y.Mock.verify(this.query);
        },

        "Should set the sort clause based on the given Location": function () {
            var sortClauses = this.sortClauses,
                location = new Mock();

            Mock.expect(location, {
                method: 'getSortClause',
                returns: sortClauses
            });

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: Y.bind(function () {
                    Mock.verify(this.query);
                }, this)
            });

            this._runSearch({
                sortLocation: location,
                offset: this.offset,
                limit: this.limit,
            }, function () {});

        },

        "Should handle the search error": function () {
            var response = {},
                errorObject = {},
                callbackCalled = false;

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(errorObject, response);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit}, function (error, result, count) {
                callbackCalled = true;

                Assert.areSame(
                    errorObject, error,
                    "The CAPI error object should be provided"
                );
                Assert.areSame(
                    response, result,
                    "The CAPI response object should be provided"
                );
                Assert.areEqual(
                    0, count,
                    "The result count should be 0"
                );
            });

            Assert.isTrue(
                callbackCalled,
                "The findLocations callback should have been called"
            );
        },

        "Should provide the result to the callback": function () {
            var response = {
                    document: {
                        View: {
                            Result: {
                                count: 2,
                                searchHits: {
                                    searchHit: [{
                                        value: {
                                            Location: {}
                                        },
                                    }, {
                                        value: {
                                            Location: {}
                                        }
                                    }]
                                }
                            }
                        }
                    }
                },
                callbackCalled = false;

            this.LocationModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;
            };

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit}, Y.bind(function (error, result, count) {
                callbackCalled = true;
                Assert.isFalse(
                    error,
                    "The error parameter should be false"
                );
                Assert.areEqual(
                    response.document.View.Result.count,
                    count,
                    "The result count should be provided"
                );
                Assert.isArray(
                    result,
                    "The result parameter should be an array"
                );
                result.forEach(function (value, i) {
                    Assert.isObject(value, "The result value should be an object");
                    Assert.isInstanceOf(
                        this.LocationModelConstructor,
                        value.location,
                        "The result value should contain location field which should be an instance of the model"
                    );
                    Assert.areSame(
                        response.document.View.Result.searchHits.searchHit[i].value.Location,
                        value.location.hash,
                        "The location from the value should be created from the hash"
                    );
                }, this);
            }, this));

            Assert.isTrue(
                callbackCalled,
                "The findLocations callback should have been called"
            );
        },

        "Should set an empty array on the target when there's no result": function () {
            var response = {
                    document: {
                        View: {
                            Result: {
                                count: 0,
                                searchHits: {
                                    searchHit: []
                                }
                            }
                        }
                    }
                },
                callbackCalled = false;

            this.LocationModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;
            };

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit}, function (error, result, count) {
                callbackCalled = true;
                Assert.isFalse(
                    error,
                    "The error parameter should be false"
                );
                Assert.areEqual(
                    response.document.View.Result.count,
                    count,
                    "The result count should be provided"
                );
                Assert.isArray(
                    result,
                    "The result parameter should be an array"
                );
                Assert.areEqual(
                    0, result.length,
                    "The result parameter should be an empty array"
                );
            });

            Assert.isTrue(
                callbackCalled,
                "The findLocations callback should have been called"
            );
        },
    });

    locationSearchEventTests = new Y.Test.Case({
        name: "eZ Search Plugin location search event tests",

        setUp: function () {
            this.LocationModelConstructor = function () {};
            this.capi = new Mock();
            this.contentService = new Mock();
            this.viewName = 'REST-View-Name';
            this.query = new Mock();
            this.sortClauses = {};
            this.offset = 42;
            this.limit = 99;

            Mock.expect(this.query, {
                method: 'setLimitAndOffset',
                args: [this.limit, this.offset],
            });
            Mock.expect(this.query, {
                method: 'setSortClauses',
                args: [this.sortClauses],
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [this.viewName, 'LocationQuery'],
                returns: this.query,
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.view = new Y.Base({bubbleTargets: this.service});
            this.plugin = new Y.eZ.Plugin.Search({
                host: this.service,
                locationModelConstructor: this.LocationModelConstructor,
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.capi;
            delete this.contentService;
            delete this.query;
        },

        _runSearch: function (search, resultAttr, resultCountAttr) {
            this.view.fire('locationSearch', {
                viewName: this.viewName,
                search: search,
                resultAttribute: resultAttr,
                resultTotalCountAttribute: resultCountAttr,
            });
        },

        "Should create a LocationQuery with criteria": function () {
            var criteria = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setCriteria');
            this._runSearch({
                criteria: criteria,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            });
            Y.Mock.verify(this.query);
        },

        "Should create a LocationQuery with query": function () {
            var query = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setQuery');
            this._runSearch({
                query: query,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            });
            Y.Mock.verify(this.query);
        },

        "Should create a LocationQuery with filter": function () {
            var filter = {}, sortClauses = this.sortClauses;

            _configureQueryAndContentServiceMock(this, 'setFilter');
            this._runSearch({
                filter: filter,
                sortClauses: sortClauses,
                offset: this.offset,
                limit: this.limit,
            });
            Y.Mock.verify(this.query);
        },

        "Should handle the search error": function () {
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(true);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit});

            Assert.isTrue(
                this.view.get('loadingError'),
                "The view should get the loadingError flag set to true"
            );
        },

        "Should set the result on the target": function () {
            var response = {
                    document: {
                        View: {
                            Result: {
                                count: 2,
                                searchHits: {
                                    searchHit: [{
                                        value: {
                                            Location: {}
                                        },
                                    }, {
                                        value: {
                                            Location: {}
                                        }
                                    }]
                                }
                            }
                        }
                    }
                },
                resultAttr = 'whateverAttr',
                resultCountAttr = 'resultCount';

            this.LocationModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;
            };

            this.service.set('locationModelConstructor', this.LocationModelConstructor);
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit}, resultAttr, resultCountAttr);

            Assert.isFalse(
                this.view.get('loadingError'),
                "The loadingError flag should be false"
            );
            Assert.isArray(
                this.view.get(resultAttr),
                "The result should set in the event resultAttribute"
            );

            Y.Array.each(this.view.get(resultAttr), function (value, i) {
                Assert.isObject(value, "The result value should be an object");
                Assert.isInstanceOf(
                    this.LocationModelConstructor,
                    value.location,
                    "The result value should contain location field which should be an instance of the model"
                );
                Assert.areSame(
                    response.document.View.Result.searchHits.searchHit[i].value.Location,
                    value.location.hash,
                    "The location from the value should be created from the hash"
                );
            }, this);

            Assert.isNumber(
                this.view.get(resultCountAttr),
                "The result count should be set in the event resultCountAttr"
            );
            Assert.areEqual(
                response.document.View.Result.count,
                this.view.get(resultCountAttr),
                "The result count set in the event resultCountAttr should be equal to number of search hits"
            );
        },

        "Should set an empty array on the target when there's no result": function () {
            var response = {
                    document: {
                        View: {
                            Result: {
                                count: 0,
                                searchHits: {
                                    searchHit: []
                                }
                            }
                        }
                    }
                },
                resultAttr = 'whateverAttr',
                resultCountAttr = 'resultCount';

            this.LocationModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;
            };

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, response);
                }
            });

            this._runSearch({offset: this.offset, limit: this.limit}, resultAttr, resultCountAttr);

            Assert.isFalse(
                this.view.get('loadingError'),
                "The loadingError flag should be false"
            );
            Assert.isArray(
                this.view.get(resultAttr),
                "The result should be set in the resultAttribute"
            );
            Assert.areEqual(
                0, this.view.get(resultAttr).length,
                "An empty array should be in the resultAttribute"
            );
            Assert.areEqual(
                0,
                this.view.get(resultCountAttr),
                "0 should be set as the number of result"
            );
        },
    });

    loadResourcesTests = new Y.Test.Case({
        name: "eZ Search Plugin load resources tests",

        setUp: function () {
            var that = this;

            this.LocationModelConstructor = function () {};
            this.ContentModelConstructor = function () {};
            this.capi = new Mock();
            this.contentService = new Mock();
            this.viewName = 'REST-View-Name';
            this.filter = {};
            this.limit = 42;
            this.offset = 44;
            this.locationQuery = new Mock();
            this.contentQuery = new Mock();
            this.contentInfo1 = {
                id: '/content/id/4112',
                contentId: '4112',
                resources: {
                    ContentType: '/content/type/id'
                }
            };
            this.contentInfo2 = {
                id: '/content/id/4113',
                contentId: '4113',
                resources: {
                    ContentType: '/content/type/id'
                }
            };
            this.contentInfoMock1 = new Mock();
            this.contentInfoMock2 = new Mock();
            this.contentInfos = {};
            this.contentInfosById = {};
            this.contentInfos[this.contentInfo1.contentId] = [this.contentInfo1];
            this.contentInfos[this.contentInfo2.contentId] = [this.contentInfo2, this.contentInfo2];
            this.contentInfosById[this.contentInfo1.id] = this.contentInfo1;
            this.contentInfosById[this.contentInfo2.id] = this.contentInfo2;
            this.contentInfoMocks = {};
            this.contentInfoMocks[this.contentInfo1.contentId] = this.contentInfoMock1;
            this.contentInfoMocks[this.contentInfo2.contentId] = this.contentInfoMock2;
            this.locationResponse = {
                document: {
                    View: {
                        Result: {
                            searchHits: {
                                searchHit: [{
                                    value: {
                                        Location: {
                                            contentInfo: this.contentInfo1,
                                        }
                                    },
                                }, {
                                    value: {
                                        Location: {
                                            contentInfo: this.contentInfo2,
                                        }
                                    },
                                }, {
                                    value: {
                                        Location: {
                                            contentInfo: this.contentInfo2,
                                        }
                                    },
                                }]
                            }
                        }
                    }
                }
            };
            this.contentResponse = {
                document: {
                    View: {
                        Result: {
                            searchHits: {
                                searchHit: [{
                                    value: {
                                        Content: {
                                            _href: this.contentInfo1.id,
                                        }
                                    },
                                }, {
                                    value: {
                                        Content: {
                                            _href: this.contentInfo2.id,
                                        }
                                    },
                                }]
                            }
                        }
                    }
                }
            };

            this.LocationModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;
                this.get = function (attr) {
                    switch (attr) {
                        case 'contentInfo':
                            return that.contentInfoMocks[hash.contentInfo.contentId];
                        default:
                            Assert.fail('Requested attribute "' + attr + '" does not exist in the location model');
                            break;
                    }
                };
            };

            this.ContentModelConstructor.prototype.loadFromHash = function (hash) {
                this.hash = hash;

                this.get = function (attr) {
                    switch (attr) {
                        case 'id':
                            return that.contentInfosById[hash._href].id;
                        case 'contentId':
                            return that.contentInfosById[hash._href].contentId;
                        default:
                            Assert.fail('Requested attribute "' + attr + '" does not exist in the content model');
                            break;
                    }
                };
            };

            Mock.expect(this.contentQuery, {
                method: 'setFilter',
                args: [Mock.Value.Object],
                run: Y.bind(function (arg) {
                    Assert.areSame(
                        arg.ContentIdCriterion,
                        this.contentInfo1.contentId + ',' + this.contentInfo2.contentId + ',' + this.contentInfo2.contentId
                    );
                }, this),
            });
            Mock.expect(this.locationQuery, {
                method: 'setLimitAndOffset',
                args: [this.limit, this.offset],
            });
            Mock.expect(this.contentQuery, {
                method: 'setLimitAndOffset',
                args: [undefined, undefined],
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [Mock.Value.String, Mock.Value.String],
                run: function (viewName, queryType) {
                    if (queryType == "LocationQuery") {
                        return that.locationQuery;
                    } else if (queryType == "ContentQuery") {
                        return that.contentQuery;
                    } else {
                        Assert.fail('Arguments of contentService.newCreateStruct are not correct');
                    }
                }
            });
            this._configureContentInfoMock(this.contentInfoMock1, this.contentInfo1);
            this._configureContentInfoMock(this.contentInfoMock2, this.contentInfo2);

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (query, cb) {
                    if (query === that.locationQuery) {
                        cb(false, that.locationResponse);
                    } else if (query === that.contentQuery) {
                        var contentIds = Y.Array.map(
                            that.locationResponse.document.View.Result.searchHits.searchHit,
                            function (hit) {
                                return '' + hit.value.Location.contentInfo.contentId;
                            }
                        );
                        contentIds = Y.Array.map(
                            that.locationResponse.document.View.Result.searchHits.searchHit,
                            function (hit) {
                                return '' + hit.value.Location.contentInfo.contentId;
                            }
                        );
                        Mock.verify(this.contentQuery);
                        cb(false, that.contentResponse);
                    }
                }, this)
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.view = new Y.Base({bubbleTargets: this.service});
            this.plugin = new Y.eZ.Plugin.Search({
                host: this.service,
                locationModelConstructor: this.LocationModelConstructor,
                contentModelConstructor: this.ContentModelConstructor,
            });
        },

        _configureContentInfoMock: function (contentInfoMock, infoObj) {
            Mock.expect(contentInfoMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (infoObj[attr] !== undefined) {
                        return infoObj[attr];
                    } else {
                        Assert.fail('Requested attribute does not exist in the contentInfo');
                    }
                },
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.capi;
            delete this.contentService;
            delete this.contentQuery;
            delete this.locationQuery;
        },

        "Should load Content and ContentType into location struct": function () {
            var response = this.locationResponse,
                resultAttr = 'whateverAttr';

            Y.eZ.ContentType = Y.Model;

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContent: true,
                loadContentType: true,
                search: {offset: this.offset, limit: this.limit}
            });

            Assert.isFalse(
                this.view.get('loadingError'),
                "The loadingError flag should be false"
            );
            Assert.isArray(
                this.view.get(resultAttr),
                "The result should set in the event resultAttribute"
            );

            Y.Array.each(this.view.get(resultAttr), function (value, i) {
                var contentInfo = this.locationResponse.document.View.Result.searchHits.searchHit[i].value.Location.contentInfo;

                Assert.isObject(value, "The result value should be an object");
                Assert.isInstanceOf(
                    this.LocationModelConstructor,
                    value.location,
                    "The result value should contain location field which should be an instance of the model"
                );
                Assert.areSame(
                    response.document.View.Result.searchHits.searchHit[i].value.Location,
                    value.location.hash,
                    "The location from the value should be created from the hash"
                );
                Assert.isObject(value.content, "The location struct from result should contain content object");
                Assert.isInstanceOf(
                    this.ContentModelConstructor,
                    value.content,
                    "The content from the value should be an instance of the model"
                );
                Assert.areSame(
                    contentInfo.id,
                    value.content.get('id'),
                    "The content from the value should be created from the content id from response"
                );
                Assert.isObject(
                    value.contentType,
                    "The location struct from result should contain contentType object"
                );
                Assert.areSame(
                    contentInfo.resources.ContentType,
                    value.contentType.get('id'),
                    "The content type from the value should be created from the content type resource from response"
                );
            }, this);
        },

        "Should handle loading content error": function () {
            var resultAttr = 'whateverAttr',
                that = this;

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (query, cb) {
                    if (query == that.locationQuery) {
                        cb(false, that.locationResponse);
                    } else if (query == that.contentQuery) {
                        cb(true, that.contentResponse);
                    }
                }
            });

            Y.eZ.ContentType = Y.Model;

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContent: true,
                search: {offset: this.offset, limit: this.limit}
            });

            Assert.isTrue(
                this.view.get('loadingError'),
                "The loadingError flag should be true"
            );
        },

        "Should handle loading content type error": function () {
            var resultAttr = 'whateverAttr';

            Y.eZ.ContentType = function () {};
            Y.eZ.ContentType.prototype.load = function (options, callback) {
                callback(true);
            };

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContentType: true,
                search: {offset: this.offset, limit: this.limit}
            });

            Assert.isTrue(
                this.view.get('loadingError'),
                "The loadingError flag should be true"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.Search;
    registerTest.components = ['locationViewViewService', 'dashboardBlocksViewService'];

    Y.Test.Runner.setName("eZ Search Plugin Tests");
    Y.Test.Runner.add(contentSearchTests);
    Y.Test.Runner.add(locationSearchTests);
    Y.Test.Runner.add(locationSearchEventTests);
    Y.Test.Runner.add(loadResourcesTests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'model', 'ez-searchplugin', 'ez-pluginregister-tests']});
