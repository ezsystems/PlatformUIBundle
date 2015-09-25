/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsearchplugin-tests', function (Y) {
    var tests, registerTest,
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
                resultAttr = 'whateverAttr';

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
                Assert.isInstanceOf(
                    this.LocationModelConstructor,
                    value,
                    "The result value should be an instance of the model"
                );
                Assert.areSame(
                    response.document.View.Result.searchHits.searchHit[i].value.Location,
                    value.hash,
                    "The location should be created from the hash"
                );
            }, this);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LocationSearch;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Location Search Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'base', 'ez-locationsearchplugin', 'ez-pluginregister-tests']});
