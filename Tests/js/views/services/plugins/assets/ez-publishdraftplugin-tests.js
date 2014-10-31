/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-publishdraftplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Publish Draft Plugin event tests",

        setUp: function () {
            this.publishRedirectionUrl = '/something';
            this.languageCode = 'eng-GB';
            this.app = new Y.Mock();
            this.capi = {};
            this.version = new Y.Mock();
            this.content = new Y.Mock();
            this.contentType = {};
            this.parentLocation = {};
            this.createContentResponse = {
                "Content": {
                    "CurrentVersion": {
                        "Version": {
                            "_media-type": "application/vnd.ez.api.Version+json",
                            "_href": "/api/ezp/v2/content/objects/4242/versions/3",
                            "VersionInfo": {
                                "id": "42",
                                "versionNo": 3,
                                "status": "DRAFT",
                                "modificationDate": "2014-02-25T14:12:04+01:00",
                                "Creator": {
                                    "_media-type": "application/vnd.ez.api.User+json",
                                    "_href": "/api/ezp/v2/user/users/14"
                                },
                                "creationDate": "2014-02-25T14:12:04+01:00",
                                "initialLanguageCode": "eng-GB",
                                "languageCodes": "eng-GB",
                                "names": {
                                    "value": [
                                        {
                                            "_languageCode": "eng-GB",
                                            "#text": "T11"
                                        }
                                    ]
                                },
                                "Content": {
                                    "_media-type": "application/vnd.ez.api.ContentInfo+json",
                                    "_href": "/api/ezp/v2/content/objects/4242"
                                }
                            },
                            "Fields": {
                                "field": [
                                    {
                                        "id": 978,
                                        "fieldDefinitionIdentifier": "name",
                                        "languageCode": "eng-GB",
                                        "fieldValue": "T11"
                                    },
                                    {
                                        "id": 979,
                                        "fieldDefinitionIdentifier": "text",
                                        "languageCode": "eng-GB",
                                        "fieldValue": "Once and for all"
                                    }
                                ]
                            },
                            "Relations": {
                                "_media-type": "application/vnd.ez.api.RelationList+json",
                                "_href": "/api/ezp/v2/content/objects/4242/versiaons/3/relations",
                                "Relation": []
                            }
                        }
                    }
                }
            };

            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.set('capi', this.capi);
            this.service.set('publishRedirectionUrl', this.publishRedirectionUrl);
            this.service.set('languageCode', this.languageCode);
            this.service.set('version', this.version);
            this.service.set('content', this.content);
            this.service.set('contentType', this.contentType);
            this.service.set('parentLocation', this.parentLocation);

            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.PublishDraft({
                host: this.service,
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.capi;
            delete this.plugin;
            delete this.view;
            delete this.service;
            delete this.app;
            delete this.version;
            delete this.content;
            delete this.parentLocation;
            delete this.contentType;
        },

        "Should publish the draft": function () {
            var fields = [{}, {}],
                contentId = 'the-pretender',
                that = this;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: false,
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['id'],
                returns: contentId,
            });
            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    callback();
                }
            });
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    Assert.areSame(
                        fields,
                        options.fields,
                        "The fields from the event facade should be passed in the save options"
                    );
                    Assert.isTrue(
                        options.publish,
                        "The publish option should be set true"
                    );
                    Assert.areEqual(contentId, options.contentId, "The content id should be passed");
                    Assert.areSame(
                        that.languageCode,
                        options.languageCode,
                        "The save options should contain the language code"
                    );
                    callback();
                }
            });

            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.publishRedirectionUrl],
            });

            this.view.fire('whatever:publishAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.version);
            Y.Mock.verify(this.app);
        },

        "Should not do anything": function () {
            Y.Mock.expect(this.app, {
                method: 'set',
                callCount: 0
            });
            this.view.fire('whatever:publishAction', {
                formIsValid: false
            });
            Y.Mock.verify(this.app);
        },

        "Should create the content and publish it": function () {
            var that = this,
                fields = [],
                response = {document: this.createContentResponse},
                versionAttrs = {};

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true,
            });
            Y.Mock.expect(this.content, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The CAPI should be passed to save"
                    );
                    Assert.areEqual(
                        that.languageCode,
                        options.languageCode,
                        "The language code should be passed to save"
                    );
                    Assert.areEqual(
                        that.contentType,
                        options.contentType,
                        "The content type should be passed to save"
                    );
                    Assert.areEqual(
                        that.parentLocation,
                        options.parentLocation,
                        "The parent location should be passed to save"
                    );
                    Assert.areEqual(
                        fields,
                        options.fields,
                        "The fields should be passed to save"
                    );
                    callback(false, response);
                }
            });
            Y.Mock.expect(this.content, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The CAPI should be passed to load"
                    );
                    callback();
                }
            });
            Y.Mock.expect(this.version, {
                method: 'parse',
                args: [Y.Mock.Value.Object],
                run: function (doc) {
                    Assert.areSame(
                        that.createContentResponse.Content.CurrentVersion,
                        doc.document,
                        "parse should have received a version response"
                    );
                    return versionAttrs;
                }
            });
            Y.Mock.expect(this.version, {
                method: 'setAttrs',
                args: [versionAttrs],
            });
            Y.Mock.expect(this.version, {
                method: 'publishVersion',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The CAPI should be passed to publishVersion"
                    );
                    callback();
                }
            });
            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.publishRedirectionUrl],
            });
            this.view.fire('whatever:publishAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.version);
            Y.Mock.verify(this.app);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.PublishDraft;
    registerTest.components = ['contentEditViewService', 'contentCreateViewService'];

    Y.Test.Runner.setName("eZ Publish Draft Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-publishdraftplugin', 'ez-pluginregister-tests']});
