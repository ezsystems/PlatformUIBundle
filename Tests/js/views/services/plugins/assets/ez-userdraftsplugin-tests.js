/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userdraftsplugin-tests', function (Y) {
    var loadUserDraftsTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadUserDraftsTest = new Y.Test.Case({
        name: 'eZ User Drafts Plugin loadUserDrafts event test',

        setUp: function () {
            this.limit = 2;
            this.attributeName = 'items';
            this.user = new Mock();
            this.app = new Y.Base();
            this.app.set('user', this.user);
            this.capi = {};
            this.service = new Y.Base();
            this.service.setAttrs({
                'capi': this.capi,
                'app': this.app,
            });
            this.view = new Y.View({
                bubbleTargets: this.service
            });
            this.view.set(this.attributeName, '');
            this.view.set('loadingError', '');

            this.plugin = new Y.eZ.Plugin.UserDrafts({
                host: this.service,
            });

            this.versions = [];
            for(var i = 0; i != this.limit + 1; ++i) {
                this.versions.push(new Y.Model({
                    resources: {Content: 'content-' + i},                 
                }));
            }
        },

        tearDown: function () {
            this.plugin.destroy();
            this.service.destroy();
            this.app.destroy();
            this.view.destroy();
            delete Y.eZ.ContentInfo;
            delete Y.eZ.ContentType;
        },

        _getModelClass: function (name, loadError, resourceEntry) {
            var resourcesValue = {};
            
            resourcesValue[resourceEntry] = Math.random();
            return Y.Base.create(name, Y.Model, [], {
                load: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        name + "#load should receive the capi"
                    );
                    callback(loadError);
                }, this),
            }, {
                ATTRS: {
                    resources: {
                        value: resourcesValue
                    }
                }
            });
        },

        _fireLoadUserDrafts: function () {
            this.view.fire('loadUserDrafts', {
                limit: this.limit,
                attributeName: this.attributeName,
            });
        },

        _mockLoadDrafts: function (run) {
            Mock.expect(this.user, {
                method: 'loadDrafts',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: run,
            });
        },

        "Should load the user's draft": function () {
            this._mockLoadDrafts(Y.bind(function (options) {
                Assert.areSame(
                    this.capi, options.api,
                    "The loadUserDrafts method should receive the CAPI instance"
                );
            }, this));
            this._fireLoadUserDrafts();
        },

        "Should handle user's draft loading error": function () {
            this._mockLoadDrafts(Y.bind(function (options, callback) {
                callback(true);
            }, this));
            this._fireLoadUserDrafts();

            Assert.isTrue(
                this.view.get('loadingError'),
                "The view should have its loadingError attribute set to true"
            );
        },

        _assertVersions: function (versions, size, firstVersionIndex) {
            Assert.isArray(
                versions,
                "The view should have received the result in the event attribute name"
            );
            Assert.areEqual(
                size,
                versions.length,
                "The view should have received `limit` objects"
            );
            Assert.isFalse(
                this.view.get('loadingError'),
                "loadingError should be false"
            );
            versions.forEach(function (version, i) {
                Assert.areSame(
                    this.versions[firstVersionIndex - i],
                    version.version,
                    "The last versions should have been used"
                );
                Assert.isInstanceOf(
                    Y.eZ.ContentInfo,
                    version.contentInfo,
                    "The corresponding contentInfo should have been instanciated"
                );
                Assert.areEqual(
                    'content-' + (firstVersionIndex - i),
                    version.contentInfo.get('id'),
                    "The corresponding contentInfo should have been loaded"
                );
                Assert.isInstanceOf(
                    Y.eZ.ContentType,
                    version.contentType,
                    "The corresponding contentType should have been instanciated"
                );
                Assert.areEqual(
                    version.contentInfo.get('resources').ContentType,
                    version.contentType.get('id'),
                    "The contentType indicated by the contentInfo should have been loaded"
                );
            }, this);
        },

        "Should load the ContentInfo and ContentType for the `limit` last versions": function () {
            Y.eZ.ContentInfo = this._getModelClass('contentInfo', false, 'ContentType');
            Y.eZ.ContentType = this._getModelClass('contentType', false);
            this._mockLoadDrafts(Y.bind(function (options, callback) {
                callback(false, this.versions.concat());
            }, this));
            this._fireLoadUserDrafts();

            this.view.after(this.attributeName + 'Change', this.next(function () {
                var items = this.view.get(this.attributeName);

                this._assertVersions(items, this.limit, this.limit);
            }, this));

            this.wait();
        },

        "Should handle the case where there's less than `limit` drafts": function () {
            // Regression test for EZP-25884
            this.limit = this.versions.length + 1;
            Y.eZ.ContentInfo = this._getModelClass('contentInfo', false, 'ContentType');
            Y.eZ.ContentType = this._getModelClass('contentType', false);

            this._mockLoadDrafts(Y.bind(function (options, callback) {
                callback(false, this.versions.concat());
            }, this));
            this._fireLoadUserDrafts();

            this.view.after(this.attributeName + 'Change', this.next(function () {
                var items = this.view.get(this.attributeName);

                this._assertVersions(items, this.versions.length, this.versions.length - 1);
            }, this));

            this.wait();

        },

        "Should handle a contentInfo loading error": function () {
            Y.eZ.ContentInfo = this._getModelClass('contentInfo', true, 'ContentType');
            Y.eZ.ContentType = this._getModelClass('contentType', false);
            this._mockLoadDrafts(Y.bind(function (options, callback) {
                callback(false, this.versions.concat());
            }, this));
            this._fireLoadUserDrafts();

            this.view.after('loadingErrorChange', this.next(function () {
                Assert.isTrue(
                    this.view.get('loadingError'),
                    "loadingError should be true"
                );
            }, this));
            this.wait();
        },

        "Should handle a contentType loading error": function () {
            Y.eZ.ContentInfo = this._getModelClass('contentInfo', false, 'ContentType');
            Y.eZ.ContentType = this._getModelClass('contentType', true);
            this._mockLoadDrafts(Y.bind(function (options, callback) {
                callback(false, this.versions.concat());
            }, this));
            this._fireLoadUserDrafts();

            this.view.after('loadingErrorChange', this.next(function () {
                Assert.isTrue(
                    this.view.get('loadingError'),
                    "loadingError should be true"
                );
            }, this));
            this.wait();
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UserDrafts;
    registerTest.components = ['dashboardBlocksViewService'];

    Y.Test.Runner.setName('eZ User Draft Plugin tests');
    Y.Test.Runner.add(loadUserDraftsTest);
    Y.Test.Runner.add(registerTest);
}, '', {
    requires: [
        'test', 'base', 'model', 'view',
        'ez-userdraftsplugin', 'ez-pluginregister-tests'
    ]
});
