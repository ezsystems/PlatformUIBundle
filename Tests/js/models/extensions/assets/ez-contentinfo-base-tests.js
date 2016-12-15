/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfo-base-tests', function (Y) {
    var loadVersionsTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    loadVersionsTest = new Y.Test.Case({
        name: "eZ Content Info base load versions tests",

        setUp: function () {
            this.model = new Y.eZ.ContentInfoBase();
            this.id = 'raclette';
            this.capi = new Mock();
            this.contentService = new Mock();

            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService
            });

            this.model.set('id', this.id);
            this.version1 = {
                name: "truc",
                status: "DRAFT"
            };
            this.version2 = {
                name: "bidule",
                status: "PUBLISHED"
            };
            this.version3 = {
                name: "chose",
                status: "PUBLISHED"
            };

            this.loadVersionsResponse = { document: {
                VersionList: {
                    VersionItem: [
                        this.version1,
                        this.version2,
                        this.version3,
                    ]
                }
            }};

            Y.eZ.VersionInfo = Y.Base.create('versionInfoModel', Y.eZ.RestModel, [], {
                loadFromHash: function (hash) {
                    this.set('name', hash.name);
                    this.set('status', hash.status);
                },

            }, {
                ATTRS: {
                    name: {
                        value: 'merguez'
                    },
                    status: {
                        value: 'barbecued'
                    }
                }
            });
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
            delete this.capi;
            delete this.contentService;
        },

        'Should pass error to callback function when CAPI loadVersions fails': function () {
            var options = {
                    api: this.capi,
                },
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'loadVersions',
                args: [this.id, Mock.Value.Function],
                run: Y.bind(function (contentId, cb) {
                    cb(true, this.loadVersionsResponse);
                }, this)
            });

            this.model.loadVersions(options, Y.bind(function (err, response) {
                callbackCalled = true;
                Assert.isTrue(err, 'An error should be returned');
            }, this));

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should load versions': function () {
            var options = {
                    api: this.capi,
                },
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'loadVersions',
                args: [this.id, Mock.Value.Function],
                run: Y.bind(function (contentId, cb) {
                    cb(false, this.loadVersionsResponse);
                }, this)
            });

            this.model.loadVersions(options, Y.bind(function (err, response) {
                callbackCalled = true;

                Assert.isFalse(err, 'Should not return the error');

                Assert.areEqual(
                    this.version1.name,
                    response[0].get('name'),
                    'First version should have been loaded'
                );

                Assert.areEqual(
                    this.version2.name,
                    response[1].get('name'),
                    'Second version should have been loaded'
                );
            }, this));

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should load sorted versions by status': function () {
            var options = {
                    api: this.capi,
                },
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'loadVersions',
                args: [this.id, Mock.Value.Function],
                run: Y.bind(function (contentId, cb) {
                    cb(false, this.loadVersionsResponse);
                }, this)
            });

            this.model.loadVersionsSortedByStatus(options, Y.bind(function (err, response) {
                callbackCalled = true;

                Assert.isFalse(err, 'Should not return the error');

                Assert.areEqual(
                    this.version1.name,
                    response.DRAFT[0].get('name'),
                    'First version should have been loaded'
                );

                Assert.areEqual(
                    this.version2.name,
                    response.PUBLISHED[0].get('name'),
                    'Second version should have been loaded'
                );

                Assert.areEqual(
                    this.version3.name,
                    response.PUBLISHED[1].get('name'),
                    'Second version should have been loaded'
                );
            }, this));

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },

        'Should handle error when trying to load versions by status without versions': function () {
            var options = {
                    api: this.capi,
                },
                callbackCalled = false;

            Y.Mock.expect(this.contentService, {
                method: 'loadVersions',
                args: [this.id, Mock.Value.Function],
                run: Y.bind(function (contentId, cb) {
                    cb(true, undefined);
                }, this)
            });

            this.model.loadVersionsSortedByStatus(options, Y.bind(function (err, response) {
                callbackCalled = true;
                Assert.areSame(0, Object.keys(response).length, 'versions by status should be empty');
                Assert.isTrue(err, 'Should return the error');
            }, this));

            Assert.isTrue(callbackCalled, 'Should call callback function');
        },
    });

    Y.Test.Runner.setName("eZ Content Model tests");
    Y.Test.Runner.add(loadVersionsTest);

}, '', {requires: ['test', 'model-tests', 'ez-contentinfo-base', 'ez-restmodel']});
