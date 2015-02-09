/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginformviewservice-tests', function (Y) {
    var loadTest, authTest;

    loadTest = new Y.Test.Case({
        name: "eZ Login Form View Service test",

        setUp: function () {
            var that = this;

            this.app = new Y.Mock();
            this.capi = new Y.Mock();

            this.isLoggedIn = true;
            Y.Mock.expect(this.app, {
                method: 'isLoggedIn',
                args: [Y.Mock.Value.Function],
                run: function (callback) {
                    callback(!that.isLoggedIn);
                }
            });

            this.service = new Y.eZ.LoginFormViewService({
                capi: this.capi,
                app: this.app,
            });
        },

        tearDown: function () {
            delete this.app;
            delete this.capi;
            delete this.service;
        },

        "Should redirect to the dashboard if the user is logged in": function () {
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['dashboard']
            });
            this.isLoggedIn = true;

            this.service.load(function () {
                Y.fail("The callback should not be called");
            });

            Y.Mock.verify(this.capi);
            Y.Mock.verify(this.app);
        },

        "Should call the callback if the user is not logged in": function () {
            var called = false;

            this.isLoggedIn = false;
            this.service.load(function () {
                called = true;
            });

            Y.Assert.isTrue(called, "The callback should have been called");
        },
    });

    authTest = new Y.Test.Case({
        name: "eZ Login Form View Service authentication est",

        setUp: function () {
            var that = this;

            this.credentials = {
                login: 'crapouille',
                password: 'unpeudejusdechaussette'
            };
            this.app = new Y.Mock();
            this.view = new Y.View();

            Y.Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Y.Mock.Value.Boolean],
                callCount: 2,
                run: function (attr, loading) {
                    that.appLoading = loading;
                }
            });
            Y.Mock.expect(this.app, {
                method: 'logIn',
                args: [this.credentials, Y.Mock.Value.Function],
                run: function (c, callback) {
                    Y.Assert.isTrue(that.appLoading, "The app should be in loading mode");
                    Y.Assert.isTrue(
                        that.view.get('authenticating'),
                        "The view authenticating flag should be set"
                    );
                    Y.Assert.areEqual(
                        "", that.view.get('error'),
                        "The view 'error' flag should be empty"
                    );

                    callback(that.logInError, that.logInResponse);
                }
            });

            this.service = new Y.eZ.LoginFormViewService({
                app: this.app,
            });

            this.view.addTarget(this.service);
        },

        tearDown: function () {
            this.view.destroy();

            delete this.app;
            delete this.view;
            delete this.service;
        },

        "Should navigate to the dashboard after a successful login": function () {
            Y.Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['dashboard']
            });
            this.logInError = false;

            this.view.fire('loginForm:authentication', {
                credentials: this.credentials,
            });

            Y.Assert.isFalse(
                this.view.get('authenticating'),
                "The view authenticating flag should not be set"
            );
            Y.Assert.areEqual(
                "", this.view.get('error'),
                "The view 'error' flag should be empty"
            );
            Y.Assert.isFalse(this.appLoading, "The app should not be in loading mode");
            Y.Mock.verify(this.app);
        },

        "Should handle a login error": function () {
            this.logInError = true;
            this.logInResponse = {status: 401};

            this.view.fire('loginForm:authentication', {
                credentials: this.credentials,
            });

            Y.Assert.isFalse(
                this.view.get('authenticating'),
                "The view authenticating flag should not be set"
            );
            Y.Assert.areNotEqual(
                "", this.view.get('error'),
                "The view 'error' flag should be empty"
            );
            Y.Assert.isFalse(this.appLoading, "The app should not be in loading mode");
            Y.Mock.verify(this.app);
        },

        "Should handle other type of error": function () {
            this.logInError = true;
            this.logInResponse = {status: 403};

            this.view.fire('loginForm:authentication', {
                credentials: this.credentials,
            });

            Y.Assert.isFalse(
                this.view.get('authenticating'),
                "The view authenticating flag should not be set"
            );
            Y.Assert.areNotEqual(
                "", this.view.get('error'),
                "The view 'error' flag should be empty"
            );
            Y.Assert.isFalse(this.appLoading, "The app should not be in loading mode");
            Y.Mock.verify(this.app);
        },

    });

    Y.Test.Runner.setName("eZ Login Form View Service tests");
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(authTest);
}, '', {requires: ['test', 'view', 'ez-loginformviewservice']});
