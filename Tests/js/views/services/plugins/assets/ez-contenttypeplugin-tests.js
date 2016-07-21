/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeplugin-tests', function (Y) {
    var loadAllContentTypesTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadAllContentTypesTest = new Y.Test.Case({
        name: 'eZ Content Type plugin loadAllContentTypes tests',

        setUp: function () {
            this.capi = new Mock();
            this.typeService = new Mock();
            Mock.expect(this.capi, {
                method: 'getContentTypeService',
                returns: this.typeService,
            });
            this.service = new Y.eZ.ViewService({
                capi: this.capi,
            });
            this.responseGroups = {
                document: {
                    ContentTypeGroupList: {
                        ContentTypeGroup: [{
                            '_href': '/1',
                        }, {
                            '_href': '/2',
                        }],
                    },
                },
            };

            this.plugin = new Y.eZ.Plugin.ContentType({host: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.plugin.destroy();
            delete this.service;
            delete this.plugin;
            delete this.capi;
        },

        _configureTypeService: function (groupsError) {
            Mock.expect(this.typeService, {
                method: 'loadContentTypeGroups',
                args: [Mock.Value.Function],
                run: Y.bind(function (callback) {
                    callback(groupsError, !groupsError ? this.responseGroups : undefined);
                }, this),
            });
        },

        _getContentTypeGroupImpl: function (loadContentTypesError) {
            return Y.Base.create('contentTypeGroupsModel', Y.Base, [], {
                loadFromHash: function (hash) {
                    this.hash = hash;
                },

                loadContentTypes: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        "The CAPI should be passed"
                    );
                    callback(loadContentTypesError);
                }, this),
            });
        },

        "Should handle Content Type groups loading error": function () {
            var groupsError = {},
                callbackCalled = false;

            this._configureTypeService(groupsError);
            this.plugin.loadAllContentTypes(function (error) {
                callbackCalled = true;
                Assert.areSame(
                    groupsError, error,
                    "The groups loading error should be provided"
                );
            });
            Assert.isTrue(
                callbackCalled,
                "The loadAllContentTypes should have been called"
            );
        },

        "Should create each group and load the corresponding Content Types": function () {
            var callbackCalled = false;

            this._configureTypeService();
            this.plugin._set('contentTypeGroupConstructor', this._getContentTypeGroupImpl(false));
            this.plugin.loadAllContentTypes(Y.bind(function (error, groups) {
                callbackCalled = true;

                Assert.isFalse(error, "No error should be reported");
                Assert.areEqual(
                    this.responseGroups.document.ContentTypeGroupList.ContentTypeGroup.length,
                    groups.length,
                    "The groups list should have been loaded"
                );
                groups.forEach(function (group, i) {
                    Assert.areEqual(
                        this.responseGroups.document.ContentTypeGroupList.ContentTypeGroup[i]._href,
                        group.get('id'),
                        "The group should have receive the id from the group list response"
                    );
                    Assert.areSame(
                        this.responseGroups.document.ContentTypeGroupList.ContentTypeGroup[i],
                        group.hash,
                        "The group should be the result of the hash parsing"
                    );
                }, this);
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The loadAllContentTypes should have been called"
            );
        },

        "Should handle Content Types loading error": function () {
            var callbackCalled = false;

            this._configureTypeService();
            this.plugin._set('contentTypeGroupConstructor', this._getContentTypeGroupImpl(true));
            this.plugin.loadAllContentTypes(Y.bind(function (error, groups) {
                callbackCalled = true;

                Assert.isTrue(error, "The Content Type loading error should be handled");
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The loadAllContentTypes should have been called"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ContentType;
    registerTest.components = ['contentCreationWizardViewService'];

    Y.Test.Runner.setName('eZ Content Create Plugin tests');
    Y.Test.Runner.add(loadAllContentTypesTest);
    Y.Test.Runner.add(registerTest);
}, '', {
    requires: ['test', 'base', 'ez-contenttypeplugin', 'ez-pluginregister-tests', 'ez-viewservice']
});
