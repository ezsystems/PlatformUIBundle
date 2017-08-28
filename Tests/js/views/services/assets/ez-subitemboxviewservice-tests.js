/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemboxviewservice-tests', function (Y) {
    var getViewParametersTest, loadTest, reloadTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadTest = new Y.Test.Case({
        name: "eZ Subitem Box View Service tests",

        setUp: function () {
            this.content = {};
            this.contentType = {};
            this.location = {};
            this.locationId = 42;
            this.searchResultList = [{content: this.content, contentType: this.contentType, location: this.location}];
            this.request = {
                params: {
                    id: this.locationId,
                }
            };
            this.app = new Y.Base();

            this.service = new Y.eZ.SubitemBoxViewService({
                request: this.request,
                app: this.app,
            });

            this.service.search = new Mock();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should set the content, contentType and location": function () {
            var callbackCalled = false;

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    Assert.isTrue(search.loadLocation, 'Should load location');
                    Assert.isTrue(search.loadContentType, 'Should load contentType');
                    Assert.areSame(search.limit, 1, 'Search limit should be 1');
                    Assert.areSame(search.offset, 0, 'Search offset should be 0');
                    Assert.areSame(search.viewName, 'location-' + this.locationId, 'View name should contain the location id');
                    Assert.areSame(search.query.LocationIdCriterion, this.locationId, 'Query should have a correct location id criterion');

                    callback(false, this.searchResultList);
                }, this),
            });
            this.service.load(Y.bind(function (service) {
                Assert.areSame(service, this.service, 'Should receive the service as a parameter');
                callbackCalled = true;
            }, this));

            Assert.areSame(
                this.content,
                this.service.get('content'),
                "The content should be setted"
            );

            Assert.areSame(
                this.location,
                this.service.get('location'),
                "The location should be setted"
            );

            Assert.areSame(
                this.contentType,
                this.service.get('contentType'),
                "The contentType should be setted"
            );

            Assert.isTrue(callbackCalled, 'Callback should have been called');
        },

        "Should handle search error ": function () {
            var callbackCalled = false,
                errorCalled = false;

            this.service.on('error', function (e) {
                Assert.isObject(e, "An event facade should be provided");
                Assert.isString(e.message, "The message property should be filled");
                Assert.areSame(e.message, 'subitem.error.loading.list domain=subitem', "The message should be a translatable string");
                errorCalled = true;
            });

            Mock.expect(this.service.search, {
                method: 'findContent',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (search, callback) {
                    callback(true, this.searchResultList);
                }, this),
            });
            this.service.load(function(){
                callbackCalled = true;
            });

            Assert.isNull(
                this.service.get('content'),
                "The content should not be setted"
            );

            Assert.isNull(
                this.service.get('location'),
                "The location should not be setted"
            );

            Assert.isNull(
                this.service.get('contentType'),
                "The contentType should not be setted"
            );

            Assert.isTrue(errorCalled, "The error event should have been fired");
            Assert.isFalse(callbackCalled, 'Callback should have been called');
        },
    });

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Subitem Box View Service get view parameters tests",

        setUp: function () {
            this.content = {};
            this.contentType = {};
            this.location = {};

            this.service = new Y.eZ.SubitemBoxViewService({
                content: this.content,
                contentType: this.contentType,
                location: this.location,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should get the view parameters": function () {
            var params= this.service.getViewParameters();

            Assert.areSame(
                this.service.get('content'), params.content,
                'The content should be available in the return value of getViewParameters'
            );
            Assert.areSame(
                this.service.get('contentType'), params.contentType,
                'The contentType should be available in the return value of getViewParameters'
            );
            Assert.areSame(
                this.service.get('location'), params.location,
                'The location should be available in the return value of getViewParameters'
            );
        },
    });

    reloadTest = new Y.Test.Case({
        name: "eZ Subitem Box View Service reload tests",

        setUp: function () {
            this.location = new Mock();
            this.capi = {};
            this.service = new Y.eZ.SubitemBoxViewService({
                capi: this.capi,
                location: this.location,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _configureLocationMock: function (err) {
            Mock.expect(this.location, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        "The capi should be provided"
                    );
                    callback(err);
                }, this),
            });
        },

        "Should load the location": function () {
            var nextCalled = false;

            this._configureLocationMock(false);
            this.service.reload(function () {
                nextCalled = true;
            });

            Assert.isTrue(
                nextCalled,
                "`reload` callback should have been called"
            );
            Mock.verify(this.location);
        },

        "Should handle error": function () {
            var errorEvt = false;

            this._configureLocationMock(true);

            this.service.once('error', function (e) {
                errorEvt = true;
                Assert.areEqual(
                    'subitem.error.loading.list domain=subitem',
                    e.message,
                    'The error message should be set'
                );
            });
            this.service.reload(function () {
                Assert.fail('`reload` callback should not be called');
            });
            Mock.verify(this.location);
            Assert.isTrue(
                errorEvt,
                'The error event should have been fired'
            );
        },
    });

    Y.Test.Runner.setName("eZ Subitem Box  View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(reloadTest);
}, '', {requires: ['test', 'ez-subitemboxviewservice']});
