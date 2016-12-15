/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-searchviewservice-tests', function (Y) {
    var serviceTest, eventTest, setLimitTest,
        Assert = Y.Assert, Mock = Y.Mock;

    serviceTest = new Y.Test.Case({
        name: "eZ Search View Service tests",

        setUp: function () {
            this.searchString = "Hello";
            this.limit = 2;
            this.searchResultList = ['Lyon', 'Verone', 'Opatija', 'Cres', 'Krk', 'Pula', 'Venise'];
            this.searchResultCount = 7;
            this.loadMoreAddingNumber = 10;
            this.request = {
                params: {
                    searchString: this.searchString,
                    limit: this.limit
                }
            };
            this.app = new Y.Base();

            this.service = new Y.eZ.SearchViewService({
                request: this.request,
                app: this.app,
                loadMoreAddingNumber: this.loadMoreAddingNumber,
                searchString : {},
                searchResultList: {},
                searchResultCount: {},
                limit: {}
            });

            this.service.search = new Mock();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should get the view parameters": function () {
            var params,
                that = this;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, that.searchResultList, that.searchResultCount);
                },
            });

            this.service.load(function(){});
            params = this.service.getViewParameters();

            Y.Assert.areSame(
                this.searchString, params.searchString,
                'The searchString should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.searchResultList, params.searchResultList,
                'The searchResultList should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.searchResultCount, params.searchResultCount,
                'The searchResultCount should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.loadMoreAddingNumber, params.loadMoreAddingNumber,
                'The loadMoreAddingNumber should be available in the return value of getViewParameters'
            );
            Y.Assert.areSame(
                this.limit, params.limit,
                'The limit should be available in the return value of getViewParameters'
            );
        },

        "Should NOT find locations and set attributes if no searchString provided (Regression test from EZP-26570)": function () {
            var callbackCalled = false;

            this.request = {
                params: {
                    searchString: '',
                }
            };
            this.service.set('request', this.request);

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                callCount: 0,

            });
            this.service.load(function(){
                callbackCalled = true;
            });

            Y.Assert.isTrue(
                callbackCalled,
                'The callback should have been called'
            );
            Mock.verify(this.service.search);
        },

        "Should set the searchResultList and searchResultCount": function () {
            var that = this;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (search, callback) {
                    callback(false, that.searchResultList, that.searchResultCount);
                },
            });
            this.service.load(function(){});

            Assert.areSame(
                this.searchResultCount,
                this.service.get('searchResultCount'),
                "The resultListCount should be setted"
            );

            Assert.areSame(
                this.searchResultList,
                this.service.get('searchResultList'),
                "The resultList should be setted"
            );
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Search View event tests",

        setUp: function () {
            this.searchString = "Hello";
            this.limit = 2;
            this.app = new Mock(new Y.Base());

            this.request = {
                params: {
                    searchString: this.searchString,
                    limit: this.limit
                }
            };

            this.service = new Y.eZ.SearchViewService({
                request: this.request,
                app: this.app,
            });

            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should navigate to 'doSearch' location on searchRequest": function () {
            var that = this;

            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (location, params) {
                    Assert.areSame(
                        location,
                        'doSearch',
                        "The app should navigateTo 'doSearch' location"
                    );
                    Assert.areSame(
                        params.searchString,
                        that.searchString,
                        "navigateTo should have the searchString"
                    );
                    Assert.areSame(
                        params.limit,
                        that.limit,
                        "navigateTo should have the limit"
                    );
                }
            });
            this.service.fire('searchRequest', {searchString: this.searchString, limit: this.limit});

            Mock.verify(this.app);
        },
    });

    setLimitTest = new Y.Test.Case({
        name: "eZ Search View event tests",

        setUp: function () {
            this.searchString = "Hello";
            this.app = new Mock(new Y.Base());
            this.loadMoreAddingNumber = 42;

            this.request = {
                params: {
                    searchString: this.searchString,
                }
            };
            
            this.service = new Y.eZ.SearchViewService({
                request: this.request,
                app: this.app,
                loadMoreAddingNumber: this.loadMoreAddingNumber,
            });

            this.service.search = new Mock();
            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should set the limit if there is no limit given in the request": function () {

            this.service.load(function(){});
            Assert.areSame(
                this.service.get('limit'),
                this.loadMoreAddingNumber,
                "The resultList should be setted"
            );
        },
    });

    Y.Test.Runner.setName("eZ Search View Service tests");
    Y.Test.Runner.add(serviceTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(setLimitTest);

}, '', {requires: ['test', 'ez-searchviewservice', 'ez-searchplugin']});
