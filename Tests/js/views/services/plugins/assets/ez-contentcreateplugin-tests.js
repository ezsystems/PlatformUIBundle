/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateplugin-tests', function (Y) {
    var createContentEvent, registerTest;

    createContentEvent = new Y.Test.Case({
        name: 'eZ Create Content plugin create content event tests',

        setUp: function () {
            this.capiMock = new Y.Test.Mock();
            this.contentTypeServiceMock = new Y.Test.Mock();

            Y.Mock.expect(this.capiMock, {
                method: 'getContentTypeService',
                returns: this.contentTypeServiceMock,
            });

            this.service = new Y.eZ.ViewService({
                app: this.app,
                capi: this.capiMock
            });
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.plugin = new Y.eZ.Plugin.ContentCreate({host: this.service});

            this.view.addTarget(this.service);

            this.responseGroups = {
                "ContentTypeGroupList": {
                    "_media-type": "application\/vnd.ez.api.ContentTypeGroupList+json",
                    "_href": "\/api\/ezp\/v2\/content\/typegroups",
                    "ContentTypeGroup": [
                        {
                            "_media-type": "application\/vnd.ez.api.ContentTypeGroup+json",
                            "_href": "\/api\/ezp\/v2\/content\/typegroups\/1",
                            "id": 1,
                            "identifier": "Content",
                            "created": "2002-09-05T11:08:48+02:00",
                            "modified": "2002-10-06T18:35:06+02:00",
                            "ContentTypes": {
                                "_media-type": "application\/vnd.ez.api.ContentTypeInfoList+json",
                                "_href": "\/api\/ezp\/v2\/content\/typegroups\/1\/types"
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.ContentTypeGroup+json",
                            "_href": "\/api\/ezp\/v2\/content\/typegroups\/2",
                            "id": 2,
                            "identifier": "Users",
                            "created": "2002-09-05T11:09:01+02:00",
                            "modified": "2002-10-06T18:35:13+02:00",
                            "ContentTypes": {
                                "_media-type": "application\/vnd.ez.api.ContentTypeInfoList+json",
                                "_href": "\/api\/ezp\/v2\/content\/typegroups\/2\/types"
                            }
                        }
                    ]
                }
            };
            this.responseTypes = {
                "ContentTypeInfoList": {
                    "_media-type": "application\/vnd.ez.api.ContentTypeInfoList+json",
                    "_href": "\/api\/ezp\/v2\/content\/typegroups\/2\/types",
                    "ContentType": [
                        {
                            "_media-type": "application\/vnd.ez.api.ContentTypeInfo+json",
                            "_href": "\/api\/ezp\/v2\/content\/types\/3",
                            "id": 3,
                            "status": "DEFINED",
                            "identifier": "user_group",
                            "names": {
                                "value": [
                                    {
                                        "_languageCode": "eng-GB",
                                        "#text": "User group"
                                    }
                                ]
                            },
                            "creationDate": "2002-06-18T11:21:38+02:00",
                            "modificationDate": "2003-03-24T09:32:23+01:00",
                            "Creator": {
                                "_media-type": "application\/vnd.ez.api.User+json",
                                "_href": "\/api\/ezp\/v2\/user\/users\/14"
                            },
                            "Modifier": {
                                "_media-type": "application\/vnd.ez.api.User+json",
                                "_href": "\/api\/ezp\/v2\/user\/users\/14"
                            },
                            "Groups": {
                                "_media-type": "application\/vnd.ez.api.ContentTypeGroupRefList+json",
                                "_href": "\/api\/ezp\/v2\/content\/types\/3\/groups"
                            },
                            "Draft": {
                                "_media-type": "application\/vnd.ez.api.ContentType+json",
                                "_href": "\/api\/ezp\/v2\/content\/types\/3\/draft"
                            },
                            "remoteId": "25b4268cdcd01921b808a0d854b877ef",
                            "urlAliasSchema": null,
                            "nameSchema": "<name>",
                            "isContainer": true,
                            "mainLanguageCode": "eng-GB",
                            "defaultAlwaysAvailable": true,
                            "defaultSortField": "PATH",
                            "defaultSortOrder": "ASC"
                        }
                    ]
                }
            };

        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            this.view.destroy();
            delete this.service;
            delete this.view;
            delete this.plugin;
            delete this.contentTypeServiceMock;
            delete this.capiMock;
            delete this.responseGroups;
        },

        'Should not load the content types if the view is not expanded': function () {
            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                callCount: 0,
            });
            this.view.set('expanded', false);
            this.view.fire('whatever:createContentAction');

            Y.Mock.verify(this.contentTypeServiceMock);
        },

        'Should load the content type groups and content types': function () {
            var that = this,
                groups;

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(false, {document: that.responseGroups});
                },
            });

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypes',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(false, {document: that.responseTypes});
                }
            });

            this.view.set('expanded', true);
            this.view.fire('whatever:createContentAction');

            Y.Assert.isFalse(
                this.view.get('loadingError'),
                "The loading error flag of the view should be set to false"
            );
            groups = this.view.get('contentTypeGroups');

            Y.Assert.areEqual(
                this.responseGroups.ContentTypeGroupList.ContentTypeGroup.length,
                groups.length,
                "The groups should be available in the view"
            );

            Y.Array.each(this.responseGroups.ContentTypeGroupList.ContentTypeGroup, function (groupInfo, i) {
                Y.Assert.areEqual(
                    groupInfo._href,
                    groups[i].get('id'),
                    "The content type groups should be parsed"
                );
                Y.Assert.areEqual(
                    groupInfo.identifier,
                    groups[i].get('identifier'),
                    "The content type groups should be parsed"
                );
                Y.Assert.areEqual(
                    that.responseTypes.ContentTypeInfoList.ContentType.length,
                    groups[i].get('contentTypes').length,
                    "THe content types should be loaded"
                );
            });
        },

        'Should handle the error while loading the group': function () {
            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });

            this.view.set('expanded', true);
            this.view.fire('whatever:createContentAction');

            Y.Assert.isTrue(
                this.view.get('loadingError'),
                "The loading error flag of the view should be set to true"
            );
        },

        'Should handle the error while loading the content types': function () {
            var that = this;

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypeGroups',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(false, {document: that.responseGroups});
                },
            });

            Y.Mock.expect(this.contentTypeServiceMock, {
                method: 'loadContentTypes',
                args: [Y.Mock.Value.String, Y.Mock.Value.Function],
                run: function (id, callback) {
                    callback(true);
                }
            });

            this.view.set('expanded', true);
            this.view.fire('whatever:createContentAction');

            Y.Assert.isTrue(
                this.view.get('loadingError'),
                "The loading error flag of the view should be set to true"
            );
        },
    });


    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentCreate;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName('eZ Content Create Plugin tests');
    Y.Test.Runner.add(createContentEvent);
    Y.Test.Runner.add(registerTest);
}, '', {
    requires: ['test', 'ez-contentcreateplugin', 'ez-pluginregister-tests', 'view']
});
