/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-savedraftplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Save Draft Plugin event tests",

        setUp: function () {
            this.capi = {};
            this.version = new Y.Mock();
            this.content = new Y.Mock();
            this.contentType = {};
            this.parentLocation = {};
            this.languageCode = 'fre-FR';

            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.service.set('version', this.version);
            this.service.set('content', this.content);
            this.service.set('languageCode', this.languageCode);
            this.service.set('contentType', this.contentType);
            this.service.set('parentLocation', this.parentLocation);

            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.SaveDraft({
                host: this.service,
            });

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
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.capi;
            delete this.plugin;
            delete this.view;
            delete this.service;
            delete this.content;
            delete this.version;
            delete this.contentType;
        },

        "Should save the draft": function () {
            var fields = [{}, {}],
                contentId = "all-my-life",
                that = this;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: false
            });
            Y.Mock.expect(this.content, {
                method: 'get',
                args: ['id'],
                returns: contentId,
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
                    Assert.areEqual(contentId, options.contentId, "The content id should be passed");
                    Assert.areSame(
                        that.languageCode,
                        options.languageCode,
                        "The save options should contain the language code"
                    );
                    callback();
                }
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.version);
        },

        "Should create the content as a draft": function () {
            var fields = [{}, {}],
                attrs = {},
                that = this;

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
                        "The save options should contain the CAPI"
                    );
                    Assert.areSame(
                        fields,
                        options.fields,
                        "The fields from the event facade should be passed in the save options"
                    );
                    Assert.areSame(
                        that.contentType,
                        options.contentType,
                        "The save options should contain the content type"
                    );
                    Assert.areSame(
                        that.parentLocation,
                        options.parentLocation,
                        "The save options should contain the parent location"
                    );
                    Assert.areSame(
                        that.languageCode,
                        options.languageCode,
                        "The save options should contain the language code"
                    );
                    callback(undefined, {document: that.createContentResponse});
                }
            });
            Y.Mock.expect(this.version, {
                method: "parse",
                args: [Y.Mock.Value.Object],
                run: function (response) {
                    Assert.areSame(
                        that.createContentResponse.Content.CurrentVersion,
                        response.document,
                        "parse should have received a version response"
                    );
                    return attrs;
                }
            });
            Y.Mock.expect(this.version, {
                method: "setAttrs",
                args: [attrs]
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.version);
        },

        "Should not save the draft": function () {
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    Assert.fail("The version should not be saved");
                }
            });
            this.view.fire('whatever:saveAction', {
                formIsValid: false
            });
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.SaveDraft;
    registerTest.components = ['contentEditViewService', 'contentCreateViewService'];

    Y.Test.Runner.setName("eZ Save Draft Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-savedraftplugin', 'ez-pluginregister-tests']});
