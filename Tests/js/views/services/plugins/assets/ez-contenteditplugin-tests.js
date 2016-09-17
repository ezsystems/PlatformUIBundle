/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditplugin-tests', function (Y) {
    var editContentRequestTest, registerTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    editContentRequestTest = new Y.Test.Case({
        name: "eZ Versions Plugin load tests",

        setUp: function () {
            this.capi = {};
            this.app = new Mock();
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.service.set('app', this.app);
            this.contentId = 42;
            this.languageCode = "fre-FR";

            this.content = new Mock();
            this.contentInfo = new Mock();

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
                callCount: 2
            });

            this.plugin = new Y.eZ.Plugin.ContentEdit({
                host: this.service
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _setupContentInfoMock: function (error, versions) {
            Mock.expect(this.contentInfo, {
                method: 'loadVersionsSortedByStatus',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(error, versions);
                }
            });

            Mock.expect(this.contentInfo, {
                method: 'get',
                args: ['id'],
                returns: this.contentId
            });
        },

        _setupContentMock: function (error, versions) {
            var contentId = this.contentId;

            Y.eZ.Content = Y.Base.create('contentModelMock',Y.Base,[],{
                loadVersionsSortedByStatus: function(option, callback) {
                    callback(error, versions);
                },

                get: function (param) {
                    if (param == 'id') {
                        return contentId;
                    }
                },
            }, {});

            this.content = new Y.eZ.Content();
        },


        "Should redirect to edit page when no draft using a Y.eZ.Content": function () {
            this._setupContentMock(false, {DRAFT: []});

            this._testRedirect({content: this.content});
        },

        "Should redirect to edit page when no draft using a Y.eZ.ContentInfo": function () {
            this._setupContentInfoMock(false, {DRAFT: []});

            this._testRedirect({contentInfo: this.contentInfo});
        },

        "Should redirect to edit page on REST error with a Y.eZ.Content": function () {
            this._setupContentMock(true, {DRAFT: ["allez", "om"]});

            this._testRedirect({content: this.content});
        },

        "Should redirect to edit page on REST error with a Y.eZ.ContentInfo": function () {
            this._setupContentInfoMock(true, {DRAFT: ["allez", "om"]});

            this._testRedirect({contentInfo: this.contentInfo});
        },

        _testRedirect: function (contentItemConfig) {
            var route = "/on/the/road/again";

            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['editContent', Mock.Value.Object],
                run: Y.bind(function (routeName, config) {
                    Assert.areSame (
                        this.contentId,
                        config.id,
                        "Content Id should be provided to the route"
                    );
                    Assert.areSame (
                        this.languageCode,
                        config.languageCode,
                        "languageCode should be provided to the route"
                    );

                    return route;
                },this)
            });

            Mock.expect(this.app, {
                method: 'navigate',
                args: [route],
            });

            this.view.fire('editContentRequest', Y.merge({
                languageCode: this.languageCode
            }, contentItemConfig));

            Mock.verify(this.app);
        },

        "Should fire `confirmBoxOpen` if there are drafts": function () {
            var contentType = "afrodeezia",
                eventOpenCalled = false,
                drafts = ["draft"],
                route = "A43";

            Y.eZ.DraftConflictView = Y.Base.create('draftconflict', Y.View, [], {}, {
                ATTRS: {
                    drafts: {},
                    content: {},
                    languageCode: {},
                    contentType: {},
                },
            });

            Mock.expect(this.app, {
                method: 'navigate',
                args: [route],
            });

            this._setupContentMock(false, {DRAFT: drafts});

            this.service.on('confirmBoxOpen', Y.bind(function (e) {
                eventOpenCalled = true;

                Assert.isString(
                    e.config.title,
                    "A title should be provided to the confirm box config"
                );
                Assert.areSame(
                    drafts,
                    e.config.view.get('drafts'),
                    "Drafts should be the same as the one provided."
                );
                Assert.areSame(
                    this.content,
                    e.config.view.get('content'),
                    "content should be the same as the one provided."
                );
                Assert.areSame(
                    this.languageCode,
                    e.config.view.get('languageCode'),
                    "languageCode should be the same as the one provided."
                );
                Assert.areSame(
                    contentType,
                    e.config.view.get('contentType'),
                    "contentType should be the same as the one provided."
                );
                Assert.isFalse(
                    e.config.renderDefaultButtons,
                    "Buttons should not be rendered"
                );
                Assert.isFunction(
                    e.config.confirmHandler,
                    "confirmHandler should be a function"
                );

                e.config.confirmHandler({route: route});
            }, this));

            this.view.fire('editContentRequest', {
                content: this.content,
                languageCode: this.languageCode,
                contentType: contentType,
            });

            Assert.isTrue (
                eventOpenCalled,
                "`confirmBoxOpen` event should have been called"
            );

            Mock.verify(this.app);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentEdit;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Content Edit Plugin tests");
    Y.Test.Runner.add(editContentRequestTest);
    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'view', 'base', 'ez-contenteditplugin', 'ez-pluginregister-tests']});
