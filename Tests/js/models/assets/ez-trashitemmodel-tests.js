/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashitemmodel-tests', function (Y) {
    var loadFromHashTest,
        restoreTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadFromHashTest = new Y.Test.Case({
        name: "eZ TrashItem Model loadFromHash test",

        setUp: function () {
            this.model = new Y.eZ.TrashItem();

            this.trashItemHash = {
                "_media-type": "application\/vnd.ez.api.TrashItem+json",
                "_href": "\/api\/ezp\/v2\/content\/trash\/54",
                "id": 54,
                "priority": 0,
                "hidden": false,
                "invisible": false,
                "ParentLocation": {
                    "_media-type": "application\/vnd.ez.api.Location+json",
                    "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                },
                "pathString": "\/1\/2\/54\/",
                "depth": 2,
                "childCount": 0,
                "remoteId": "19d14270a67a7a12951177ff33fc946d",
                "Content": {
                    "_media-type": "application\/vnd.ez.api.Content+json",
                    "_href": "\/api\/ezp\/v2\/content\/objects\/52"
                },
                "sortField": "PATH",
                "sortOrder": "ASC",
                "ContentInfo": {
                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                    "_href": "\/api\/ezp\/v2\/content\/objects\/52",
                    "Content": {
                        "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                        "_href": "\/api\/ezp\/v2\/content\/objects\/52",
                        "_remoteId": "cb7f9452a4760fc688244fc4ff7969d1",
                        "_id": 52,
                        "ContentType": {
                            "_media-type": "application\/vnd.ez.api.ContentType+json",
                            "_href": "\/api\/ezp\/v2\/content\/types\/2"
                        },
                        "Name": "p1",
                        "Versions": {
                            "_media-type": "application\/vnd.ez.api.VersionList+json",
                            "_href": "\/api\/ezp\/v2\/content\/objects\/52\/versions"
                        },
                        "CurrentVersion": {
                            "_media-type": "application\/vnd.ez.api.Version+json",
                            "_href": "\/api\/ezp\/v2\/content\/objects\/52\/currentversion"
                        },
                        "Section": {
                            "_media-type": "application\/vnd.ez.api.Section+json",
                            "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                        },
                        "Locations": {
                            "_media-type": "application\/vnd.ez.api.LocationList+json",
                            "_href": "\/api\/ezp\/v2\/content\/objects\/52\/locations"
                        },
                        "Owner": {
                            "_media-type": "application\/vnd.ez.api.User+json",
                            "_href": "\/api\/ezp\/v2\/user\/users\/14"
                        },
                        "lastModificationDate": "2016-01-12T09:22:31+01:00",
                        "publishedDate": "2016-01-12T09:22:31+01:00",
                        "mainLanguageCode": "eng-GB",
                        "alwaysAvailable": false,
                        "ObjectStates": {
                            "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                            "_href": "\/api\/ezp\/v2\/content\/objects\/52\/objectstates"
                        }
                    }
                }
            };
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should load attribute from a trashItem hash": function () {
            this.model.loadFromHash(this.trashItemHash);

            Assert.areSame(
                this.trashItemHash._href,
                this.model.get('id'),
                "href hash attribute should have been set to id model attribute"
            );

            Assert.areSame(
                this.trashItemHash.id,
                this.model.get('locationId'),
                "id hash attribute should have been set to locationId model attribute"
            );

            Assert.areSame(
                this.trashItemHash.priority,
                this.model.get('priority'),
                "priority hash attribute should have been set to priority model attribute"
            );

            Assert.areSame(
                this.trashItemHash.hidden,
                this.model.get('hidden'),
                "hidden hash attribute should have been set to hidden model attribute"
            );

            Assert.areSame(
                this.trashItemHash.invisible,
                this.model.get('invisible'),
                "invisible hash attribute should have been set to invisible model attribute"
            );

            Assert.areSame(
                this.trashItemHash.pathString,
                this.model.get('pathString'),
                "pathString hash attribute should have been set to pathString model attribute"
            );

            Assert.areSame(
                this.trashItemHash.depth,
                this.model.get('depth'),
                "depth hash attribute should have been set to depth model attribute"
            );

            Assert.areSame(
                this.trashItemHash.childCount,
                this.model.get('childCount'),
                "childCount hash attribute should have been set to childCount model attribute"
            );

            Assert.areSame(
                this.trashItemHash.remoteId,
                this.model.get('remoteId'),
                "remoteId hash attribute should have been set to remoteId model attribute"
            );

            Assert.areSame(
                this.trashItemHash.sortField,
                this.model.get('sortField'),
                "sortField hash attribute should have been set to sortField model attribute"
            );

            Assert.areSame(
                this.trashItemHash.sortOrder,
                this.model.get('sortOrder'),
                "sortOrder hash attribute should have been set to sortOrder model attribute"
            );
        },

        "The content info should be instance of eZ.ContentInfo": function () {
            var contentInfoStruct = this.trashItemHash.ContentInfo;

            this.model.set('contentInfo', contentInfoStruct);
            Assert.isInstanceOf(
                Y.eZ.ContentInfo,
                this.model.get('contentInfo'),
                'Content Info should be instance of eZ.ContentInfo'
            );
            Assert.areEqual(
                contentInfoStruct.Content.Name,
                this.model.get('contentInfo').get('name'),
                'Should instantiate content info with the name'
            );
        },

        "The content info should be instance of eZ.ContentInfo when set to undefined": function () {
            this.model.set('contentInfo', undefined);
            Assert.isInstanceOf(
                Y.eZ.ContentInfo,
                this.model.get('contentInfo'),
                'ContentInfo should be instance of eZ.ContentInfo'
            );
        },

        "Should read the content info": function () {
            var contentInfo;

            this.model.loadFromHash(this.trashItemHash);
            contentInfo = this.model.get('contentInfo');

            Assert.isObject(
                contentInfo,
                "The contentInfo should be object"
            );

            Assert.areEqual(
                this.trashItemHash.ContentInfo.Content._href,
                contentInfo.get('id'),
                "The content info should be imported and have the same ids"
            );

            Assert.areEqual(
                this.trashItemHash.ContentInfo.Content.Name,
                contentInfo.get('name'),
                "The content info should be imported and have the same names"
            );
        },
    });

    restoreTest = new Y.Test.Case({
        name: "eZ TrashItem Model restore test",

        setUp: function () {
            this.model = new Y.eZ.TrashItem();
            this.id = 42;

            this.contentServiceMock = new Mock();

            this.apiMock = new Mock();
            Mock.expect(this.apiMock, {
                method: "getContentService",
                args: [],
                returns: this.contentServiceMock
            });

            this.options = {api: this.apiMock};
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should call the api on restore": function () {
            var restoreCallback = function () {};

            Mock.expect(this.contentServiceMock, {
                method: "recover",
                args: [this.id, Mock.Value.Function],
                run: Y.bind(function (id, callback) {
                    Assert.areSame(
                        this.id,
                        id,
                        "Id passed to the contentService should match the model's"
                    );

                    Assert.areSame(
                        restoreCallback,
                        callback,
                        "Callback passed to the contentService should match"
                    );

                    callback();
                }, this),
            });

            this.model.set('id', this.id);
            this.model.restore(this.options, restoreCallback);

            Mock.verify(this.contentServiceMock);
        },
    });


    Y.Test.Runner.setName("eZ Trash Item Model tests");
    Y.Test.Runner.add(loadFromHashTest);
    Y.Test.Runner.add(restoreTest);

}, '', {requires: ['test', 'model-tests', 'ez-trashitemmodel', 'ez-contentinfomodel', 'ez-contentinfo-attributes', 'ez-restmodel']});
