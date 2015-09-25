/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginavailableplugin-tests', function (Y) {
    var isLoginAvailableEventTest, registerTest,
        Assert = Y.Assert, Mock = Y.Mock;

    isLoginAvailableEventTest = new Y.Test.Case({
        name: "eZ Login Available Plugin isLoginAvailable event tests",

        setUp: function () {
            var CheckLoginView = Y.Base.create('checkLoginView', Y.View, [], {
                setUnableToCheckLogin: Y.bind(function () {
                    this.unableToCheckLogin = true;
                }, this),

                setLoginAvailable: Y.bind(function () {
                    this.loginAvailable = true;
                }, this),

                setLoginUnavailable: Y.bind(function () {
                    this.loginUnavailable = true;
                }, this),
            });

            this.unableToCheckLogin = false;
            this.loginAvailable = false;
            this.loginUnavailable = false;
            this.capi = new Mock();
            this.userService = new Mock();

            Mock.expect(this.capi, {
                method: 'getUserService',
                returns: this.userService
            });
            this.service = new Y.Base();

            this.view = new CheckLoginView();
            this.view.addTarget(this.service);

            this.service.set('capi', this.capi);

            this.plugin = new Y.eZ.Plugin.LoginAvailable({
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
            delete this.capi;
            delete this.userService;
        },

        "Should check the login with the user service": function () {
            var login = 'dave';

            Mock.expect(this.userService, {
                method: 'isLoginAvailable',
                args: [login, Mock.Value.Function]
            });

            this.view.fire('isLoginAvailable', {
                login: login
            });
            Mock.verify(this.userService);
        },

        "Should handle error": function () {
            var login = 'dave';

            Mock.expect(this.userService, {
                method: 'isLoginAvailable',
                args: [login, Mock.Value.Function],
                run: function (login, cb) {
                    cb(new Error());
                },
            });

            this.view.fire('isLoginAvailable', {
                login: login
            });

            Assert.isTrue(
                this.unableToCheckLogin,
                "The setUnableToCheckLogin view method should have been called"
            );
        },

        "Should handle login availability": function () {
            var login = 'dave';

            Mock.expect(this.userService, {
                method: 'isLoginAvailable',
                args: [login, Mock.Value.Function],
                run: function (login, cb) {
                    cb(true);
                },
            });

            this.view.fire('isLoginAvailable', {
                login: login
            });

            Assert.isTrue(
                this.loginAvailable,
                "The setLoginAvailable view method should have been called"
            );
        },

        "Should handle login unavailability": function () {
            var login = 'dave';

            Mock.expect(this.userService, {
                method: 'isLoginAvailable',
                args: [login, Mock.Value.Function],
                run: function (login, cb) {
                    cb(false);
                },
            });

            this.view.fire('isLoginAvailable', {
                login: login
            });

            Assert.isTrue(
                this.loginUnavailable,
                "The setLoginUnavailable view method should have been called"
            );
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.LoginAvailable;
    registerTest.components = ['contentCreateViewService', 'contentEditViewService'];

    Y.Test.Runner.setName("eZ Login Available Plugin tests");
    Y.Test.Runner.add(isLoginAvailableEventTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-loginavailableplugin', 'ez-pluginregister-tests']});
