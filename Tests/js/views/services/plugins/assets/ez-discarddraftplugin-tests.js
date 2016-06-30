/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discarddraftplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    tests = new Y.Test.Case({
        name: "eZ Discard Draft Plugin event tests",

        setUp: function () {
            this.capi = {};
            this.version = new Y.Mock();
            this.content = new Mock();
            this.app = new Y.Mock();
            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });

            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.service.set('version', this.version);
            this.service.set('content', this.content);
            this.service.set('app', this.app);

            this.view = new Y.View();
            this.view.addTarget(this.service);

            this.plugin = new Y.eZ.Plugin.DiscardDraft({
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
        },

        _configureCurrentVersion: function (isCurrentVersion) {
            Mock.expect(this.version, {
                method: 'isCurrentVersionOf',
                args: [this.content],
                returns: isCurrentVersion,
            });
        },

        _configureDestroy: function (mock) {
            Mock.expect(mock, {
                method: 'destroy',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The remove flag should set to true"

                    );
                    callback();
                }, this),
            });

        },

        "Should destroy the draft version": function () {
            this._configureCurrentVersion(false);
            this._configureDestroy(this.version);

            this.view.fire('whatever:discardAction');

            Y.Mock.verify(this.version);
        },

        "Should destroy the content": function () {
            this._configureCurrentVersion(true);
            this._configureDestroy(this.content);

            this.view.fire('whatever:discardAction');

            Mock.verify(this.content);
        },

        "Should fire the `discardedDraft` event after destroying the version": function () {
            var eventFired = false;

            this.service.on('discardedDraft', function () {
                eventFired = true;
            });
            this["Should destroy the draft version"]();

            Assert.isTrue(
                eventFired,
                "The discardedDraft event should have been fired"
            );
        },

        "Should fire the `discardedDraft` event after destroying the content": function () {
            var eventFired = false;

            this.service.on('discardedDraft', function () {
                eventFired = true;
            });
            this["Should destroy the content"]();

            Assert.isTrue(
                eventFired,
                "The discardedDraft event should have been fired"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.DiscardDraft;
    registerTest.components = ['contentEditViewService'];

    Y.Test.Runner.setName("eZ Discard Draft Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-discarddraftplugin', 'ez-pluginregister-tests']});
