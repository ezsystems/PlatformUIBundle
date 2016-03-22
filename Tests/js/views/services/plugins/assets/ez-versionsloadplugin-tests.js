/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionsloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Versions Load Plugin event tests",

        setUp: function () {
            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.versions = [];
            this.content = new Mock();
            this.status1 = "walking";
            this.status2 = "biking";

            this.plugin = new Y.eZ.Plugin.VersionsLoad({
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

        _setupContentMock: function (error, versions) {
            Mock.expect(this.content, {
                method: 'loadVersions',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    callback(error, versions);
                }
            });
        },

        _addVersionMock: function (status) {
            var versionMock = new Mock();

            Mock.expect(versionMock, {
                'method': 'get',
                'args': ['status'],
                returns: status
            });

            Mock.expect(versionMock, {
                'method': 'toJSON',
                returns: {}
            });

            this.versions.push(versionMock);
        },

        _assertVersionsResult: function (status, nbVersion) {
            var versions = this.view.get('versions');

            Assert.areSame(
                nbVersion,
                versions[status].length,
                "The number of " + status + " version doesn't match"
            );
        },

        "Should load versions sorted by status": function () {
            this._setupContentMock(false, this.versions);

            this._addVersionMock(this.status1);
            this._addVersionMock(this.status2);
            this._addVersionMock(this.status2);


            this.view.fire('loadVersions', {
                content: this.content
            });

            this._assertVersionsResult(this.status1, 1);
            this._assertVersionsResult(this.status2, 2);
        },

        "Should load versions with no versions": function () {
            this._setupContentMock(false, this.versions);

            this.view.fire('loadVersions', {
                content: this.content
            });

            Assert.isObject(
                this.view.get('versions'),
                "Versions should be an object"
            );

            Assert.isFalse(
                this.view.get('loadingError'),
                "Error should not be set to true"
            );
        },

        "Should handle loading errors": function () {
            var defaultVersionValue = "flea";

            this._setupContentMock(true, this.versions);

            this.view.set('versions', defaultVersionValue);

            this.view.fire('loadVersions', {
                content: this.content
            });

            Assert.areSame(
                defaultVersionValue,
                this.view.get('versions'),
                "Versions should not have been loaded"
            );
            Assert.isTrue(
                this.view.get('loadingError'),
                "Error should be set to true"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.VersionsLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Versions Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-versionsloadplugin', 'ez-pluginregister-tests']});
