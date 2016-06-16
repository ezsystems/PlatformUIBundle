/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-versionsplugin-tests', function (Y) {
    var loadTest, createDraftTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    loadTest = new Y.Test.Case({
        name: "eZ Versions Plugin load tests",

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

            this.plugin = new Y.eZ.Plugin.Versions({
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

    createDraftTest = new Y.Test.Case({
        name: "eZ Versions Plugin create draft tests",

        setUp: function () {
            this.capi = {};
            this.app = {
                navigate: Y.bind(function (param) {
                    Assert.areSame(
                        "truc",
                        param,
                        "Result of routeUri should have been provided to navigate"
                    );

                    this.navigateCalled = true;
                }, this),

                routeUri: Y.bind(function (routeName, routeParams) {
                    Assert.areSame(
                        'editContentVersion',
                        routeName,
                        "The route provided should be 'editContentVersion'"
                    );
                    Assert.areSame(
                        this.contentId,
                        routeParams.id,
                        "The id provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.initialLanguageCode,
                        routeParams.languageCode,
                        "The language code provided to the route doesn't match"
                    );
                    Assert.areSame(
                        this.versionId,
                        routeParams.versionId,
                        "The versionsId provided to the route doesn't match"
                    );

                    return "truc";
                }, this)
            };
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.service.set('app', this.app);
            this.content = new Mock();
            this.versionNo = "42";
            this.contentId = "/zinedine/zidane";
            this.contentName = "zidane";
            this.initialLanguageCode = "eng-US";
            this.versionId = "/path/to/version/42";
            this.navigateCalled = false;

            this.plugin = new Y.eZ.Plugin.Versions({
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

        _setupContentMock: function (error) {
            var version = {};

            if(!error) {
                version = new Mock();

                Mock.expect(version, {
                    method: 'get',
                    args: [Mock.Value.String],
                    run: Y.bind(function (attr) {
                        if ( attr === 'id' ) {
                            return this.versionId;
                        } else if ( attr === 'initialLanguageCode' ) {
                            return this.initialLanguageCode;
                        }
                        Y.fail('Unexpected call to get("' + attr + '")');
                    }, this),
                });
            }

            Mock.expect(this.content, {
                method: 'createDraft',
                args: [Mock.Value.Object, this.versionNo, Mock.Value.Function],
                run: function (options,versionId, callback) {
                    callback(error, version);
                }
            });

            Mock.expect(this.content, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'id' ) {
                        return this.contentId;
                    } else if ( attr === 'name' ) {
                        return this.contentName;
                    }
                    Y.fail('Unexpected call to get("' + attr + '")');
                }, this),
            });
        },

        "Should create a draft from archived version and redirect to edit page": function () {

            this._setupContentMock(false);

            this.view.fire('createDraft', {
                content: this.content,
                versionNo: this.versionNo
            });

            Assert.isTrue(
                this.navigateCalled,
                "Navigate should have been called"
            );
        },

        "Should not redirect on load error": function () {
            var notified = false;

            this._setupContentMock(true);

            this.service.on('notify', Y.bind(function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "error", e.notification.state,
                    "The notification state should be 'error'"
                );
                Assert.isTrue(
                    (e.notification.text.indexOf(this.contentName) >= 0),
                    "The notification text should contain the content name"
                );
                Assert.isTrue(
                    (e.notification.text.indexOf(this.versionNo) >= 0),
                    "The notification text should contain the version Number"
                );
                Assert.areSame(
                    "create-draft-from-archived-" + this.contentId,
                    e.notification.identifier,
                    "The notification identifier should be create-draft-from-archived-" + this.contentId
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            }, this));

            this.view.fire('createDraft', {
                content: this.content,
                versionNo: this.versionNo
            });

            Assert.isFalse(
                this.navigateCalled,
                "Navigate should have been called"
            );

            Assert.isTrue(
                notified,
                "A notification should have been displayed"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.Versions;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Versions Load Plugin tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(registerTest);
    Y.Test.Runner.add(createDraftTest);
}, '', {requires: ['test', 'view', 'base', 'ez-versionsplugin', 'ez-pluginregister-tests']});
