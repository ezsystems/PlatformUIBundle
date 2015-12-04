/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-savedraftplugin-tests', function (Y) {
    var tests, customNotificationTextTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

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
            this.service.set('location', this.location);

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

        _saveDraft: function (callback) {
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
                fields: fields,
                callback: callback,
            });

            Y.Mock.verify(this.version);
        },

        "Should save the draft": function () {
            this._saveDraft();
        },

        "Should save the draft and call the callback": function () {
            var called = false,
                callback = function (err) {
                    called = true;
                    Assert.isUndefined(err);
                };
            this._saveDraft(callback);

            Assert.isTrue(called, "The event callback should have been called");
        },

        _createContent: function (callback) {
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
                fields: fields,
                callback: callback,
            });

            Y.Mock.verify(this.content);
            Y.Mock.verify(this.version);
        },

        "Should create the content as a draft": function () {
            this._createContent();
        },

        "Should create the content as a draft and call the callback": function () {
            var called = false,
                callback = function (err) {
                    called = true;
                    Assert.isUndefined(err);
                };
            this._createContent(callback);

            Assert.isTrue(called, "The event callback should have been called");
        },

        "Should not save the draft": function () {
            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true,
            });
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    Assert.fail("The version should not be saved");
                }
            });
            this.view.fire('whatever:saveAction', {
                formIsValid: false,
                callback: function () {
                    Assert.fail("The event should not be called");
                },
            });
        },

        "Should notify about the start of saving draft process": function () {
            var contentId = "all-my-life",
                notified = false,
                plugin = this.plugin;

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
            });

            this.service.on('notify', function (e) {
                notified = true;

                Assert.areEqual(
                    "started", e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.areEqual(
                    e.notification.text,
                    plugin.get('startedNotificationText'),
                    "The notification text should be the value of the `startedNotificationText` attribute"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(contentId) !== -1,
                    "The notification identifier should contain the content id"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(this.get('languageCode')) !== -1,
                    "The notification identifier should contain the languageCode"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },

        "Should notify about the success of saving draft process": function () {
            var contentId = "all-my-life",
                notificationId,
                notified = false,
                plugin = this.plugin;

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
                    callback(false, {});
                },
            });

            this.service.once('notify', function (e) {
                notificationId = e.notification.identifier;
                this.once('notify', function (e) {
                    notified = true;
                    Assert.areEqual(
                        notificationId, e.notification.identifier,
                        "The notification should be updated"
                    );
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.areEqual(
                        e.notification.text,
                        plugin.get('doneNotificationText'),
                        "The notification text should be the value of the `doneNotificationText` attribute"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 5"
                    );
                });
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },

        "Should fire a savedDraft event on success of saving draft process": function () {
            var contentId = "all-my-life",
                eventFired = false,
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
                    callback(false, {});
                },
            });

            this.service.once('savedDraft', function (e) {
               eventFired = true;
                Assert.areSame(
                    that.service.get('content'), e.content,
                    "savedDraft event should store the service location"
                );
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(eventFired, "The plugin should have fired the savedDraft event");
        },

        _saveDraftFailure: function (callback) {
            var contentId = "all-my-life",
                notificationId,
                notified = false,
                plugin = this.plugin;

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
                    callback(true);
                },
            });

            this.service.once('notify', function (e) {
                notificationId = e.notification.identifier;
                this.once('notify', function (e) {
                    notified = true;
                    Assert.areEqual(
                        notificationId, e.notification.identifier,
                        "The notification should be updated"
                    );
                    Assert.areEqual(
                        "error", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.areEqual(
                        e.notification.text,
                        plugin.get('errorNotificationText'),
                        "The notification text should be the value of the `errorNotificationText` attribute"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
                callback: callback,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },


        "Should notify about the failure of saving draft process": function () {
            this._saveDraftFailure();
        },

        "Should pass the error to the event callback": function () {
            var called = false,
                callback = function (err) {
                    called = true;
                    Assert.isTrue(err);
                };
            this._saveDraftFailure(callback);

            Assert.isTrue(called, "The event callback should have been called");
        },

        "Should notify about the start of the draft creation process": function () {
            var notified = false,
                plugin = this.plugin;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true
            });
            Y.Mock.expect(this.content, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
            });

            this.service.on('notify', function (e) {
                notified = true;

                Assert.areEqual(
                    "started", e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.areEqual(
                    e.notification.text,
                    plugin.get('startedNotificationText'),
                    "The notification text should be the value of the `startedNotificationText` attribute"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf("0") !== -1,
                    "The notification identifier should contain the content id"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(this.get('languageCode')) !== -1,
                    "The notification identifier should contain the languageCode"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },

        "Should notify about the success of the draft creation process": function () {
            var notificationId,
                notified = false,
                plugin = this.plugin;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true
            });
            Y.Mock.expect(this.content, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    callback(false, {document: this.createContentResponse});
                }, this),
            });
            Y.Mock.expect(this.version, {
                method: "parse",
                args: [Y.Mock.Value.Object],
            });
            Y.Mock.expect(this.version, {
                method: "setAttrs",
                args: [Y.Mock.Value.Any]
            });

            this.service.once('notify', function (e) {
                notificationId = e.notification.identifier;
                this.once('notify', function (e) {
                    notified = true;
                    Assert.areEqual(
                        notificationId, e.notification.identifier,
                        "The notification should be updated"
                    );
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.areEqual(
                        e.notification.text,
                        plugin.get('doneNotificationText'),
                        "The notification text should be the value of the `doneNotificationText` attribute"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 5"
                    );
                });
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },

        "Should notify about the failure of the draft creation process": function () {
            var notificationId,
                notified = false,
                plugin = this.plugin;

            Y.Mock.expect(this.content, {
                method: 'isNew',
                returns: true
            });
            Y.Mock.expect(this.content, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    callback(true);
                }, this),
            });
            Y.Mock.expect(this.version, {
                method: "parse",
                args: [Y.Mock.Value.Object],
            });
            Y.Mock.expect(this.version, {
                method: "setAttrs",
                args: [Y.Mock.Value.Any]
            });

            this.service.once('notify', function (e) {
                notificationId = e.notification.identifier;
                this.once('notify', function (e) {
                    notified = true;
                    Assert.areEqual(
                        notificationId, e.notification.identifier,
                        "The notification should be updated"
                    );
                    Assert.areEqual(
                        "error", e.notification.state,
                        "The notification state should be 'error'"
                    );
                    Assert.areEqual(
                        e.notification.text,
                        plugin.get('errorNotificationText'),
                        "The notification text should be the value of the `errorNotificationText` attribute"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
            });
            Assert.isTrue(notified, "The plugin should have fired the notify event");
        },
    });

    customNotificationTextTest = new Y.Test.Case({
        name: "eZ Save Draft Plugin custom notification text tests",

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
            this.service.set('location', this.location);

            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.SaveDraft({
                host: this.service,
            });

            Mock.expect(this.content, {
                method: 'isNew',
                returns: false
            });
            Mock.expect(this.content, {
                method: 'get',
                args: ['id'],
            });
            Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
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
            delete this.content;
            delete this.version;
            delete this.contentType;
        },

        "Should set the notification texts": function () {
            var notificationText = {
                    started: "Ramble on",
                    error: "When the Levee Breaks",
                    done: "Stairway to Heaven",
                };

            this.view.fire('whatever:saveAction', {
                formIsValid: true,
                notificationText: notificationText,
            });
            Assert.areEqual(
                notificationText.started,
                this.plugin.get('startedNotificationText'),
                "The text of the started notification should be changed"
            );
            Assert.areEqual(
                notificationText.done,
                this.plugin.get('doneNotificationText'),
                "The text of the done notification should be changed"
            );
            Assert.areEqual(
                notificationText.error,
                this.plugin.get('errorNotificationText'),
                "The text of the error notification should be changed"
            );
        },

        "Should reset the message to the default value after save": function () {
            var notificationText = {
                    started: "Ramble on",
                    error: "When the Levee Breaks",
                    done: "Stairway to Heaven",
                };

            Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    callback();
                },
            });
            this.view.fire('whatever:saveAction', {
                formIsValid: true,
                notificationText: notificationText,
            });
            Assert.areNotEqual(
                notificationText.started,
                this.plugin.get('startedNotificationText'),
                "The text of the started notification should be changed"
            );
            Assert.areNotEqual(
                notificationText.done,
                this.plugin.get('doneNotificationText'),
                "The text of the done notification should be changed"
            );
            Assert.areNotEqual(
                notificationText.error,
                this.plugin.get('errorNotificationText'),
                "The text of the error notification should be changed"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.SaveDraft;
    registerTest.components = ['contentEditViewService', 'contentCreateViewService'];

    Y.Test.Runner.setName("eZ Save Draft Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(customNotificationTextTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-savedraftplugin', 'ez-pluginregister-tests']});
