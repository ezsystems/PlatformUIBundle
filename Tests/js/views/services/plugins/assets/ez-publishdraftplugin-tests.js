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
            this.app = new Y.Mock();
            this.capi = {};
            this.version = new Y.Mock();
            this.content = new Y.Mock();

            this.service = new Y.Base();
            this.service.set('app', this.app);
            this.service.set('capi', this.capi);
            this.service.set('publishRedirectionUrl', this.publishRedirectionUrl);
            this.service.set('version', this.version);
            this.service.set('content', this.content);

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

        "Should not publish the draft": function () {
            Y.Mock.expect(this.version, {
                method: 'save',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function () {
                    Assert.fail("The version should not be saved");
                }
            });
            this.view.fire('whatever:publishAction', {
                formIsValid: false
            });
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.PublishDraft;
    registerTest.components = ['contentEditViewService'];

    Y.Test.Runner.setName("eZ Publish Draft Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-publishdraftplugin', 'ez-pluginregister-tests']});
