/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-user-editview-tests', function (Y) {
    var registerTest, getFieldValueTest, getFieldValuePasswordTest,
        errorStatusTest, errorStatusAttributesTest, renderTest,
        validateTest, loginValidationTest, emailValidationTest,
        passwordValidationTest, loginAvailableAttrTest,
        Assert = Y.Assert, Mock = Y.Mock,
        modelMock = new Mock();

    Mock.expect(modelMock, {
        method: 'toJSON',
        returns: {}
    });

    renderTest = new Y.Test.Case({
        name: "eZ User Edit View render test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                field: {fieldValue: null},
                fieldDefinition: {isRequired: false},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the view with the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.areEqual(
                    9, Y.Object.size(vars),
                    "The template should receive 9 variables"
                );
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Should compute and pass readOnlyLogin to the template": function () {
            var origTpl,
                expectedReadOnlyLogin;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.areEqual(
                    expectedReadOnlyLogin, vars.readOnlyLogin,
                    "readOnlyLogin should be " + expectedReadOnlyLogin
                );
                return origTpl.apply(this, arguments);
            };
            this.view.set('field', {fieldValue: null});
            expectedReadOnlyLogin = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: false}});
            expectedReadOnlyLogin = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: true}});
            expectedReadOnlyLogin = true;
            this.view.render();
        },

        "Should compute and pass loginRequired to the template": function () {
            var origTpl,
                expectedLoginRequired;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.areEqual(
                    expectedLoginRequired, vars.loginRequired,
                    "readOnlyLogin should be " + expectedLoginRequired
                );
                return origTpl.apply(this, arguments);
            };
            this.view.get('fieldDefinition').isRequired = false;

            this.view.set('field', {fieldValue: null});
            expectedLoginRequired = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: false}});
            expectedLoginRequired = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: true}});
            expectedLoginRequired = false;
            this.view.render();

            this.view.get('fieldDefinition').isRequired = true;

            this.view.set('field', {fieldValue: null});
            expectedLoginRequired = true;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: false}});
            expectedLoginRequired = true;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: true}});
            expectedLoginRequired = false;
            this.view.render();
        },

        "Should compute and pass passwordRequired to the template": function () {
            var origTpl,
                expectedPasswordRequired;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.areEqual(
                    expectedPasswordRequired, vars.loginRequired,
                    "readOnlyPassword should be " + expectedPasswordRequired
                );
                return origTpl.apply(this, arguments);
            };
            this.view.get('fieldDefinition').isRequired = false;

            this.view.set('field', {fieldValue: null});
            expectedPasswordRequired = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: false}});
            expectedPasswordRequired = false;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: true}});
            expectedPasswordRequired = false;
            this.view.render();

            this.view.get('fieldDefinition').isRequired = true;

            this.view.set('field', {fieldValue: null});
            expectedPasswordRequired = true;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: false}});
            expectedPasswordRequired = true;
            this.view.render();

            this.view.set('field', {fieldValue: {hasStoredLogin: true}});
            expectedPasswordRequired = false;
            this.view.render();
        },

        "Should compute and pass isRequired to the template": function () {
            var origTpl;

            origTpl = this.view.template;
            this.view.template = function (vars) {
                Assert.areEqual(
                    this.get('fieldDefinition').isRequired, vars.isRequired,
                    "isRequired should have the value of the fieldDefinition.isRequired"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.get('fieldDefinition').isRequired = false;
            this.view.render();

            this.view.get('fieldDefinition').isRequired = true;
            this.view.render();
        },
    });

    validateTest = new Y.Test.Case({
        name: "eZ User Edit View validate test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                field: {fieldValue: null},
                fieldDefinition: {isRequired: true},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should validate the login, the email and the password": function () {
            this.view.validate();

            Assert.isTrue(
                !!this.view.get('loginErrorStatus'),
                "An error on the login should have been found"
            );
            Assert.isTrue(
                !!this.view.get('emailErrorStatus'),
                "An error on the email should have been found"
            );
            Assert.isTrue(
                !!this.view.get('passwordErrorStatus'),
                "An error on the password should have been found"
            );
        },

        "Should not check login availability": function () {
            this.view.on('isLoginAvailable', function () {
                Assert.fail("The isLoginAvailable should not have been fired");
            });
            this.view.validate();
        },
    });

    loginAvailableAttrTest = new Y.Test.Case({
        name: "eZ User Edit View loginAvailable attribute test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                field: {fieldValue: null},
                fieldDefinition: {isRequired: false},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "checking login": function () {
            this.view.setCheckingLogin();

            Assert.isTrue(
                this.view.get('container').hasClass('is-checking-login'),
                "The checking class should be added on the container"
            );
        },

        "login available": function () {
            this['checking login']();
            this.view.set('loginErrorStatus', 'An error');
            this.view.setLoginAvailable();

            Assert.isFalse(
                this.view.get('container').hasClass('is-checking-login'),
                "The checking class should be removed from the container"
            );
            Assert.isFalse(
                this.view.get('loginErrorStatus'),
                "The error status should be resetted"
            );
        },

        "login not available": function () {
            this['checking login']();
            this.view.set('loginErrorStatus', false);
            this.view.setLoginUnavailable();

            Assert.isFalse(
                this.view.get('container').hasClass('is-checking-login'),
                "The checking class should be removed from the container"
            );
            Assert.isTrue(
                !!this.view.get('loginErrorStatus'),
                "The error status should contain an error"
            );
        },

        "error while checking login": function () {
            this['checking login']();
            this.view.set('loginErrorStatus', false);
            this.view.setUnableToCheckLogin();

            Assert.isFalse(
                this.view.get('container').hasClass('is-checking-login'),
                "The checking class should be removed from the container"
            );
            Assert.isFalse(
                this.view.get('loginErrorStatus'),
                "The error status should contain false"
            );
        },
    });

    loginValidationTest = new Y.Test.Case({
        name: "eZ User Edit View login validation test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                container: '.container',
                field: {fieldValue: null},
                fieldDefinition: {isRequired: true},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should validate on blur": function () {
            this.view.render();
            this.view.get('container').one('.ez-user-login-value').simulate('blur');
            Assert.isTrue(
                !!this.view.get('loginErrorStatus'),
                "An error on the login should have been found"
            );
        },

        "Should check login availability": function () {
            var fired = false,
                login = 'dave';

            this.view.on('isLoginAvailable', function (e) {
                fired = true;
                Assert.areEqual(
                    login, e.login,
                    "The login should be checked"
                );
                Assert.areEqual(
                    'checking', this.get('loginAvailabilityStatus'),
                    "The login availability status should be 'checking"
                );
            });
            this.view.render();
            this.view.get('container').one('.ez-user-login-value')
                .set('value', login)
                .simulate('blur');
            Assert.isTrue(
                fired, "The isLoginAvailable event should have been fired"
            );
        },

        "Should not check an empty login": function () {
            this.view.on('isLoginAvailable', function (e) {
                Assert.fail("An empty login should not be checked");
            });
            this.view.render();
            this.view.get('container').one('.ez-user-login-value')
                .simulate('blur');
        },

        "Should make the login required if email is filled": function () {
            var container = this.view.get('container');

            this.view.get('fieldDefinition').isRequired = false;
            this.view.render();
            container.one('.ez-user-login-value').simulate('blur');
            Assert.isFalse(
                this.view.get('loginErrorStatus'),
                "No error on the login should have been found"
            );

            container.one('.ez-user-email-value').set('value', 'foo@bar.com');
            container.one('.ez-user-login-value').simulate('blur');

            Assert.isTrue(
                !!this.view.get('loginErrorStatus'),
                "An error on the login should have been found"
            );
        },

        "Should validate on valuechange": function () {
            var input;

            this["Should validate on blur"]();
            input = this.view.get('container').one('.ez-user-login-value');
            input.simulate('focus');
            input.set('value', 'myhero');

            this.view.after('loginErrorStatusChange', this.next(function (e) {
                Assert.isFalse(
                    e.newVal,
                    "The loginErrorStatus should be set back to false"
                );
            }));
            this.wait();
        },
    });

    emailValidationTest = new Y.Test.Case({
        name: "eZ User Edit View email validation test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                container: '.container',
                field: {fieldValue: null},
                fieldDefinition: {isRequired: true},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should validate on blur": function () {
            this.view.render();
            this.view.get('container').one('.ez-user-email-value').simulate('blur');
            Assert.isTrue(
                !!this.view.get('emailErrorStatus'),
                "An error on the email should have been found"
            );
        },

        "Should check email syntax": function () {
            var input;

            this.view.get('fieldDefinition').isRequired = false;
            this.view.render();
            input = this.view.get('container').one('.ez-user-email-value');
            input.set('value', 'not an email');
            input.simulate('blur');

            Assert.isTrue(
                !!this.view.get('emailErrorStatus'),
                "An error on the email should have been found"
            );
        },

        "Should make the email required if login is filled": function () {
            var container = this.view.get('container');

            this.view.get('fieldDefinition').isRequired = false;
            this.view.render();
            container.one('.ez-user-email-value').simulate('blur');
            Assert.isFalse(
                this.view.get('emailErrorStatus'),
                "No error on the email should have been found"
            );

            container.one('.ez-user-login-value').set('value', 'foo');
            container.one('.ez-user-email-value').simulate('blur');

            Assert.isTrue(
                !!this.view.get('emailErrorStatus'),
                "An error on the email should have been found"
            );
        },

        "Should validate on valuechange if invalid": function () {
            var input;

            this.view.set('emailErrorStatus', 'An error');
            this.view.after('emailErrorStatusChange', this.next(function (e) {
                Assert.isFalse(
                    e.newVal,
                    "The emailErrorStatus should be set back to false"
                );
            }));

            input = this.view.get('container').one('.ez-user-email-value');
            input.simulate('focus');
            input.set('value', 'foo@bar.com');

            this.wait();
        },

        "Should not validate on valuechange if valid": function () {
            var input;

            this.view.set('emailErrorStatus', false);
            this.view.after('emailErrorStatusChange', this.next(function (e) {
                Assert.fail("No error should be detected");
            }));

            input = this.view.get('container').one('.ez-user-email-value');
            input.simulate('focus');
            input.set('value', 'foo');

            this.wait(Y.bind(function () {
                Assert.isFalse(
                    this.view.get('emailErrorStatus'),
                    "No error should be detected"
                );
            }, this), 100);
        },
    });

    passwordValidationTest = new Y.Test.Case({
        name: "eZ User Edit View email password test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                container: '.container',
                field: {fieldValue: null},
                fieldDefinition: {isRequired: true},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not detect any error": function () {
            this.view.render();
            this.view.get('container').one('.ez-user-password-value').set('value', 'pass');
            this.view.get('container').one('.ez-user-confirmpassword-value')
                .set('value', 'pass')
                .simulate('blur');
            Assert.isFalse(
                this.view.get('passwordErrorStatus'),
                "No error should have been detected"
            );
        },

        "Should validate on blur on the confirm field": function () {
            this.view.render();
            this.view.get('container').one('.ez-user-confirmpassword-value').simulate('blur');
            Assert.isTrue(
                !!this.view.get('passwordErrorStatus'),
                "An error on the password should have been found"
            );
        },

        "Should validate on valuechange on the confirm field": function () {
            var input;

            this.view.after('passwordErrorStatusChange', this.next(function (e) {
                Assert.isTrue(
                    !!e.newVal,
                    "An error on the password should have been found"
                );
            }));

            input = this.view.get('container').one('.ez-user-confirmpassword-value');
            input.simulate('focus');
            input.set('value', 'awesome password ;)');

            this.wait();
        },

        "Should check that passwords match": function () {
            this.view.render();
            this.view.get('container').one('.ez-user-password-value').set('value', 'pass1');
            this.view.get('container').one('.ez-user-confirmpassword-value')
                .set('value', 'pass2')
                .simulate('blur');
            Assert.isTrue(
                !!this.view.get('passwordErrorStatus'),
                "An error on the password should have been found"
            );
        },

        "Should make the password required if password field is filled": function () {
            this.view.get('fieldDefinition').isRequired = false;
            this.view.get('field').fieldValue = {hasStoredLogin: true};
            this.view.render();
            this.view.get('container').one('.ez-user-password-value').set('value', 'pass1');
            this.view.get('container').one('.ez-user-confirmpassword-value')
                .set('value', '')
                .simulate('blur');
            Assert.isTrue(
                !!this.view.get('passwordErrorStatus'),
                "An error on the password should have been found"
            );
        },

        "Should make the password required if confirmPassword field is filled": function () {
            this.view.get('fieldDefinition').isRequired = false;
            this.view.get('field').fieldValue = {hasStoredLogin: true};
            this.view.render();
            this.view.get('container').one('.ez-user-confirmpassword-value')
                .set('value', 'pass')
                .simulate('blur');
            Assert.isTrue(
                !!this.view.get('passwordErrorStatus'),
                "An error on the password should have been found"
            );
        },
    });

    errorStatusTest = new Y.Test.Case({
        name: "eZ User Edit View errorStatus attribute test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                field: {fieldValue: null},
                fieldDefinition: {isRequired: false},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should be valid by default": function () {
            Assert.isTrue(
                this.view.isValid(),
                "The view should be in a valid state"
            );
        },

        "Should be invalid if login has error": function () {
            this.view.set('loginErrorStatus', 'whatever');
            Assert.isFalse(
                this.view.isValid(),
                "The view should be in an invalid state"
            );
        },

        "Should be invalid if email has error": function () {
            this.view.set('emailErrorStatus', 'whatever');
            Assert.isFalse(
                this.view.isValid(),
                "The view should be in an invalid state"
            );
        },

        "Should be invalid if password has error": function () {
            this.view.set('passwordErrorStatus', 'whatever');
            Assert.isFalse(
                this.view.isValid(),
                "The view should be in an invalid state"
            );
        },
    });

    errorStatusAttributesTest = new Y.Test.Case({
        name: "eZ User Edit View *ErrorStatus attributes test",

        setUp: function () {
            this.view = new Y.eZ.UserEditView({
                field: {fieldValue: null},
                fieldDefinition: {isRequired: false},
                content: modelMock,
                version: modelMock,
                contentType: modelMock,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testError: function (property) {
            var container = this.view.get('container'),
                error = 'End Over End';

            this.view.set(property + 'ErrorStatus', error);

            Assert.isTrue(
                container.one('.ez-editfield-row-' + property).hasClass('is-error'),
                "The ez-editfield-row-" + property + " element should get the error class"
            );
            Assert.areEqual(
                error, container.one('.ez-editfield-' + property + '-error-message').getContent(),
                "The error message should be displayed"
            );
        },

        _testNoError: function (property) {
            var container = this.view.get('container'),
                error = false;

            this.view.set(property + 'ErrorStatus', error);

            Assert.isFalse(
                container.one('.ez-editfield-row-' + property).hasClass('is-error'),
                "The ez-editfield-row-" + property + " element should not get the error class"
            );
            Assert.areEqual(
                "", container.one('.ez-editfield-' + property + '-error-message').getContent(),
                "The error message should be gone"
            );
        },

        "Should handle login error": function () {
            this._testError('login');
        },

        "Should handle email error": function () {
            this._testError('email');
        },

        "Should handle password error": function () {
            this._testError('password');
        },

        "Should handle login error fix": function () {
            this._testError('login');
            this._testNoError('login');
        },

        "Should handle email error fix": function () {
            this._testError('email');
            this._testNoError('email');
        },

        "Should handle password error fix": function () {
            this._testError('password');
            this._testNoError('password');
        },
    });

    getFieldValueTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.UserEditView,
            newValue: {login: "foo", email: "foo@bar.com"},

            _setNewValue: function () {
                var container = this.view.get('container');

                container.one('.ez-user-login-value').set('value', this.newValue.login);
                container.one('.ez-user-email-value').set('value', this.newValue.email);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Assert.areEqual(this.newValue.login, fieldValue.login, msg);
                Assert.areEqual(this.newValue.email, fieldValue.email, msg);
                Assert.isUndefined(fieldValue.password, msg);
            },
        })
    );

    getFieldValuePasswordTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.UserEditView,
            newValue: {login: "foo", email: "foo@bar.com", password: "bar"},

            _setNewValue: function () {
                var container = this.view.get('container');

                container.one('.ez-user-login-value').set('value', this.newValue.login);
                container.one('.ez-user-email-value').set('value', this.newValue.email);
                container.one('.ez-user-password-value').set('value', this.newValue.password);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Assert.areEqual(this.newValue.login, fieldValue.login, msg);
                Assert.areEqual(this.newValue.email, fieldValue.email, msg);
                Assert.areEqual(this.newValue.password, fieldValue.password, msg);
            },
        })
    );

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "User Edit View registration test";
    registerTest.viewType = Y.eZ.UserEditView;
    registerTest.viewKey = "ezuser";

    Y.Test.Runner.setName("eZ User Edit View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(loginAvailableAttrTest);
    Y.Test.Runner.add(loginValidationTest);
    Y.Test.Runner.add(emailValidationTest);
    Y.Test.Runner.add(passwordValidationTest);
    Y.Test.Runner.add(errorStatusTest);
    Y.Test.Runner.add(errorStatusAttributesTest);
    Y.Test.Runner.add(getFieldValueTest);
    Y.Test.Runner.add(getFieldValuePasswordTest);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'node-event-simulate', 'event-focus', 'getfield-tests', 'editviewregister-tests', 'ez-user-editview']});
