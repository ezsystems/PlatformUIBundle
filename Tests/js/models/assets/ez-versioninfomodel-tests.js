/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versioninfomodel-tests', function (Y) {
    var loadFromHashTest, removeTest,
        Assert = Y.Assert;

    loadFromHashTest = new Y.Test.Case({
        name: "eZ VersionInfo Model loadFromHash test",

        setUp: function () {
            this.model = new Y.eZ.VersionInfo();

            this.versionItemHash = {
                "Version": {
                    "_media-type": "application\/vnd.ez.api.Version+json",
                    "_href": "\/api\/ezp\/v2\/content\/objects\/52\/versions\/1"
                },
                "VersionInfo": {
                    "id": 507,
                    "versionNo": 1,
                    "status": "ARCHIVED",
                    "modificationDate": "2016-04-05T14:47:23+02:00",
                    "Creator": {
                        "_media-type": "application\/vnd.ez.api.User+json",
                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                    },
                    "creationDate": "2016-03-11T14:09:18+01:00",
                    "initialLanguageCode": "eng-GB",
                    "languageCodes": "eng-GB,pol-PL,ger-DE,fre-FR",
                    "names": {
                        "value": [
                            {
                                "_languageCode": "eng-GB",
                                "#text": "granpa"
                            },
                            {
                                "_languageCode": "fre-FR",
                                "#text": "papi"
                            }
                        ]
                    },
                    "Content": {
                        "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                        "_href": "\/api\/ezp\/v2\/content\/objects\/52"
                    }
                }
            };
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should load attribute from a VersionInfo hash": function () {
            var translationList;

            this.model.loadFromHash(this.versionItemHash);

            Assert.areSame(
                this.versionItemHash.Version._href,
                this.model.get('id'),
                "id of the version should have been set to id model attribute"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.id,
                this.model.get('versionId'),
                "id hash attribute should have been set to versionId model attribute"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.versionNo,
                this.model.get('versionNo'),
                "versionNo hash attribute should have been set to versionNo model attribute"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.status,
                this.model.get('status'),
                "status hash attribute should have been set to status model attribute"
            );
            Assert.areSame(
                new Date(this.versionItemHash.VersionInfo.modificationDate).toDateString(),
                new Date(this.model.get('modificationDate')).toDateString(),
                "modificationDate hash attribute should have been set to modificationDate model attribute"
            );
            Assert.areSame(
                new Date(this.versionItemHash.VersionInfo.creationDate).toDateString(),
                new Date(this.model.get('creationDate')).toDateString(),
                "creationDate hash attribute should have been set to creationDate model attribute"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.initialLanguageCode,
                this.model.get('initialLanguageCode'),
                "initialLanguageCode hash attribute should have been set to initialLanguageCode model attribute"
            );

            translationList = this.model.getTranslationsList();
            Y.Assert.isArray(
                translationList,
                'The translation list should be an array'
            );
            Y.Assert.areEqual(
                4,
                translationList.length,
                'The translation list should contain all translations'
            );
            Y.Array.each(translationList, Y.bind(function (translation) {
                Y.Assert.isTrue(
                    this.versionItemHash.VersionInfo.languageCodes.indexOf(translation) >= 0,
                    'The translation should be included in languageCodes attribute'
                );
            },this));

            Assert.areSame(
                this.versionItemHash.VersionInfo.names.value[0]['#text'],
                this.model.get('names')['eng-GB'],
                "names hash attribute should have been set to names model attribute"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.Content._href,
                this.model.get('resources').Content,
                "Content hash attribute should have been set to Content model resources"
            );
            Assert.areSame(
                this.versionItemHash.VersionInfo.Creator._href,
                this.model.get('resources').Creator,
                "Creator hash attribute should have been set to Creator model resources"
            );
        },
    });

    removeTest = new Y.Test.Case({
        name: "eZ Version Model remove tests",

        setUp: function () {
            this.contentId = "/ezp/api/content/objects/4242";
            this.versionId = "42";
            this.version = new Y.eZ.VersionInfo();
            this.version.setAttrs({
                id: this.contentId + "/version/2",
                versionId: this.versionId,
                versionNo: 2
            });
            this.capiMock = new Y.Mock();
            this.contentService = new Y.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentService',
                returns: this.contentService,
            });
        },

        tearDown: function () {
            this.version.destroy();
            delete this.version;
        },

        "Should delete the version in the repository": function () {
            var version = this.version;

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                args: [this.version.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback();
                }
            });

            this.version.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isFalse(!!error, "The destroy callback should be called without error");
                Y.Assert.areEqual(
                    "", version.get('versionId'),
                    "The version object should reseted"
                );
            });

            Y.Mock.verify(this.contentService);
        },

        "Should handle the error while deleting the version": function () {
            var version = this.version,
                versionId = this.versionId;

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                args: [this.version.get('id'), Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true);
                }
            });

            this.version.destroy({
                remove: true,
                api: this.capiMock
            }, function (error) {
                Y.Assert.isTrue(!!error, "The destroy callback should be called with an error");

                Y.Assert.areEqual(
                    versionId, version.get('versionId'),
                    "The version object should be left intact"
                );
            });

            Y.Mock.verify(this.contentService);
        },

        "Should ignore unsaved version": function () {
            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                callCount: 0,
            });

            this.version.set('id', undefined);
            this.version.destroy({
                api: this.capiMock,
                remove: true,
            }, Y.bind(function (error) {
                Y.Assert.isFalse(error, "The error parameter of the callback should be false");
                Y.Mock.verify(this.contentService);
            },this));
        },

        "Should provide a message when action is not supported": function () {
            var action = "tartiflette";

            Y.Mock.expect(this.contentService, {
                method: 'deleteVersion',
                callCount: 0,
            });

            this.version.set('id', undefined);
            this.version.sync(action,{}, Y.bind(function (error) {
                Y.Assert.areSame(
                    action + " not supported",
                    error,
                    "Error message is not matching the expected one"
                );
                Y.Mock.verify(this.contentService);
            }, this));
        },
    });

    Y.Test.Runner.setName("eZ Version Info Model tests");
    Y.Test.Runner.add(loadFromHashTest);
    Y.Test.Runner.add(removeTest);

}, '', {requires: ['test', 'json', 'model-tests', 'ez-versioninfomodel', 'ez-restmodel']});
