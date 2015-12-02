/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsearchplugin-tests', function (Y) {
    var tests, loadResourcesTests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Location Search Plugin event tests",

        setUp: function () {
            this.LocationModelConstructor = function () {};
            this.capi = new Mock();
            this.contentService = new Mock();
            this.viewName = 'REST-View-Name';
            this.query = {body: {ViewInput: {LocationQuery: {}}}};

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
            this.plugin = new Y.eZ.Plugin.LocationSearch({
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

        "Should create a LocationQuery with the given name and search properties": function () {
            var criteria = {}, offset = 42, limit = 43;

            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    Assert.areSame(
                        criteria,
                        query.body.ViewInput.LocationQuery.Criteria,
                        "The criteria should be set on the view create struct"
                    );
                    Assert.areEqual(
                        offset,
                        query.body.ViewInput.LocationQuery.offset,
                        "The offset should be set on the view create struct"
                    );
                    Assert.areEqual(
                        limit,
                        query.body.ViewInput.LocationQuery.limit,
                        "The limit should be set on the view create struct"
                    );
                }
            });

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                search: {
                    criteria: criteria,
                    offset: offset,
                    limit: limit,
                }
            });
        },

        "Should handle the search error": function () {
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(true);
                }
            });

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                search: {
                    criteria: {},
                }
            });

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
            
            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                resultTotalCountAttribute: resultCountAttr,
                search: {
                    criteria: {},
                }
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
    });

    loadResourcesTests = new Y.Test.Case({
        name: "eZ Location Search Plugin load resources tests",

        setUp: function () {
            var that = this;

            this.LocationModelConstructor = function () {};
            this.capi = new Mock();
            this.contentService = new Mock();
            this.contentInfoMock = new Mock();
            this.viewName = 'REST-View-Name';
            this.query = {body: {ViewInput: {LocationQuery: {}}}};
            this.contentInfo = {
                id: '/content/id/4112',
                resources: {
                    ContentType: '/content/type/id'
                }
            };
            this.response = {
                document: {
                    View: {
                        Result: {
                            searchHits: {
                                searchHit: [{
                                    value: {
                                        Location: {
                                            contentInfo: this.contentInfo
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
                            return that.contentInfoMock;
                        default:
                            Assert.fail('Requested attribute does not exist in the location model');
                            break;
                    }
                };
            };

            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
            Mock.expect(this.contentService, {
                method: 'newViewCreateStruct',
                args: [this.viewName, 'LocationQuery'],
                returns: this.query,
            });
            Mock.expect(this.contentInfoMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (that.contentInfo[attr] !== undefined) {
                        return that.contentInfo[attr];
                    } else {
                        Assert.fail('Requested attribute does not exist in the contentInfo');
                    }
                }
            });
            Mock.expect(this.contentService, {
                method: 'createView',
                args: [this.query, Mock.Value.Function],
                run: function (query, cb) {
                    cb(false, that.response);
                }
            });
            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.view = new Y.Base({bubbleTargets: this.service});
            this.plugin = new Y.eZ.Plugin.LocationSearch({
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

        "Should load Content and ContentType into location struct": function () {
            var contentInfo = this.contentInfo,
                response = this.response,
                resultAttr = 'whateverAttr';

            Y.eZ.Content = Y.Model;
            Y.eZ.ContentType = Y.Model;

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContent: true,
                loadContentType: true,
                search: {
                    criteria: {},
                }
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
            var resultAttr = 'whateverAttr';

            Y.eZ.Content = function () {};
            Y.eZ.Content.prototype.load = function (options, callback) {
                callback(true);
            };
            Y.eZ.ContentType = Y.Model;

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContent: true,
                search: {
                    criteria: {},
                }
            });

            Assert.isTrue(
                this.view.get('loadingError'),
                "The loadingError flag should be true"
            );
        },

        "Should handle loading content type error": function () {
            var resultAttr = 'whateverAttr';

            Y.eZ.Content = Y.Model;
            Y.eZ.ContentType = function () {};
            Y.eZ.ContentType.prototype.load = function (options, callback) {
                callback(true);
            };

            this.view.fire('locationSearch', {
                viewName: this.viewName,
                resultAttribute: resultAttr,
                loadContentType: true,
                search: {
                    criteria: {},
                }
            });

            Assert.isTrue(
                this.view.get('loadingError'),
                "The loadingError flag should be true"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationSearch;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Location Search Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(loadResourcesTests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'model', 'ez-locationsearchplugin', 'ez-pluginregister-tests']});
