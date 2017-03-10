/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Section Load Plugin event tests",

        setUp: function () {
            this.content = new Y.Mock();
            this.sectionId = '/my/section/42';
            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);
            this.section = {};

            Y.Mock.expect(this.content, {
                method: 'loadSection',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        options.api,
                        this.service.get('capi'),
                        'options should have CAPI'
                    );
                    callback(false, this.section);
                }, this)
            });

            this.plugin = new Y.eZ.Plugin.SectionLoad({
                host: this.service,
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

        "Should set the related section on `loadSection` event": function () {
            var that = this,
                callbackCalled = false;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback();
            };

            this.view.fire('loadSection',{
                content: this.content,
                callback: Y.bind(function (error, section) {
                    callbackCalled = true;
                    Assert.isFalse(error, "The error should be false");
                    Assert.areSame(section, this.section, "The section should be defined");
                }, this),
            });

            Assert.isTrue(callbackCalled, 'The callback should have been called');
        },

        "Should handle loading errors": function () {
            var callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                };

            Y.Mock.expect(this.content, {
                method: 'loadSection',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: Y.bind(function (options, callback) {
                    Assert.areSame(
                        options.api,
                        this.service.get('capi'),
                        'options should have CAPI'
                    );
                    callback(true, this.section);
                }, this)
            });

            this._load = Y.bind(function (options, callback) {
                Assert.areSame(
                    this.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback();
            }, this);

            this.view.fire('loadSection', {
                content: this.content,
                callback: callback,
            });
            Assert.isTrue(
                callbackCalled,
                "The error callback should be called"
            );
            Assert.isUndefined(
                this.view.get('section'),
                "section should NOT be setted"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.SectionLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Section Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-sectionloadplugin', 'ez-pluginregister-tests']});
