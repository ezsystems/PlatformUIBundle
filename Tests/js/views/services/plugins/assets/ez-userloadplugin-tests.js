/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ User Load Plugin event tests",

        setUp: function () {
            this.User = function () {
                this.set = tests._set;
                this.load = tests._load;
            };

            this.userId = '/my/user/42';
            this.capi = {};
            this.service = new Y.Base();
            this.view = new Y.View();
            this.view.set('myUser', null);
            this.view.set('loadingError', false);
            this.view.addTarget(this.service);
            this.service.set('capi', this.capi);

            this.plugin = new Y.eZ.Plugin.UserLoad({
                host: this.service,
            });

            this.plugin.set('userModelConstructor', this.User);
        },

        _set: function (name, value) {
            Assert.areSame('id', name, 'method set should be called to set the id');
            Assert.areEqual(tests.userId, value, 'The id should be the user id');
        },

        _load: function (options, callback) {

        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        "Should load the related user on `loadUser` event": function () {
            var that = this;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback();
            };

            this.view.fire('loadUser',{
                userId: this.userId,
                attributeName: 'myUser'
            });
            Assert.isInstanceOf(
                this.plugin.get('userModelConstructor'),
                this.view.get('myUser'),
                "The view should get the user"
            );
            Assert.areSame(
                false,
                this.view.get('loadingError'),
                "The loadingError should be false"
            );
        },

        "Should handle loading errors": function () {
            var that = this;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback(true);
            };

            this.view.fire('loadUser',{
                userId: this.userId,
                attributeName: 'myUser'
            });
            Assert.areSame(
                null,
                this.view.get('myUser'),
                "The user should not be retrieved"
            );
            Assert.areSame(
                true,
                this.view.get('loadingError'),
                "The loadingError should be true"
            );
        },

    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.UserLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ User Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-userloadplugin', 'ez-pluginregister-tests']});
