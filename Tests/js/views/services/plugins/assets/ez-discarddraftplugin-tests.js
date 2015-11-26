/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discarddraftplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Discard Draft Plugin event tests",

        setUp: function () {
            this.discardRedirectionUrl = '/something';
            this.capi = {};
            this.version = new Y.Mock();
            this.app = new Y.Mock();

            this.service = new Y.Base();
            this.service.set('capi', this.capi);
            this.service.set('version', this.version);
            this.service.set('app', this.app);
            this.service.set('discardRedirectionUrl', this.discardRedirectionUrl);

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

        "Should discard the draft": function () {
            var fields = [{}, {}],
                that = this;

            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', true]
            });
            Y.Mock.expect(this.app, {
                method: 'navigate',
                args: [this.discardRedirectionUrl],
            });
            Y.Mock.expect(this.version, {
                method: 'destroy',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        "The save options should contain the CAPI"
                    );
                    Assert.isTrue(
                        options.remove,
                        "The remove flag should set to true"

                    );
                    callback();
                }
            });

            this.view.fire('whatever:discardAction', {
                formIsValid: true,
                fields: fields
            });

            Y.Mock.verify(this.version);
        },

        "Should fire the `discardedDraft` event": function () {
            var eventFired = false;

            this.service.on('discardedDraft', function () {
                eventFired = true;
            });
            this["Should discard the draft"]();

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
