/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginformview-tests', function (Y) {
    var viewTest, submitTest, errorTest, authTest;

    viewTest = new Y.Test.Case({
        name: "eZ Login Form View test",

        setUp: function () {
            this.view = new Y.eZ.LoginFormView({
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
        },

        "Should set the height of window on the container": function () {
            var container = this.view.get('container');
            
            this.view.render();
            Y.Assert.areEqual(
                container.get('winHeight'),
                container.get('offsetHeight'),
                "The height of the container should be set to the height of the window"
            );
        },
    });

    submitTest = new Y.Test.Case({
        name: "eZ Login Form View submit test",

        setUp: function () {
            this.view = new Y.eZ.LoginFormView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _submit: function () {
            this.view.get('container').one('form').simulate('submit');
        },

        "Should fire the authentication event": function () {
            var form,
                authEvent = false,
                username = 'samsam',
                password = 'heroscosmique';

            this.view.on('authentication', function (e) {
                authEvent = true;
                Y.Assert.isObject(e.credentials);
                Y.Assert.areEqual(
                    username, e.credentials.login,
                    "The username should be provided in the event facade"
                );
                Y.Assert.areEqual(
                    password, e.credentials.password,
                    "The password should be provided in the event facade"
                );
            });
            form = this.view.get('container').one('form');

            form.get('username').set('value', username);
            form.get('password').set('value', password);
            this._submit();

            Y.Assert.isTrue(
                authEvent, "The authentication event should have been fired"
            );
        },

        "Should not fire the event if the username is not filled": function () {
            this.view.on('authentication', function () {
                Y.fail("The authentication event should not have been fired");
            });
            this._submit();
        },

        "Should not fire the event if the password is not filled": function () {
            var username = 'samsam';

            this.view.on('authentication', function () {
                Y.fail("The authentication event should not have been fired");
            });
            this.view.get('container').one('form').set('username', username);
            this._submit();
        },
    });

    errorTest = new Y.Test.Case({
        name: "eZ Login Form View error test",

        setUp: function () {
            this.view = new Y.eZ.LoginFormView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the error class and the error message in the message box": function () {
            var error = 'Des monstres!';

            this.view.set('error', error);

            Y.Assert.isTrue(
                this.view.get('container').hasClass('is-login-error'),
                "The error class should be set on the container"
            );
            Y.Assert.areEqual(
                error, this.view.get('container').one('.ez-loginform-message').getContent(),
                "The error should be displayed in the message box"
            );
        },

        "Should remove the error class and restore the message box": function () {
            var msgBox = this.view.get('container').one('.ez-loginform-message'),
                defaultMessage = msgBox.getContent();

            this["Should set the error class and the error message in the message box"]();
            this.view.set('error', '');

            Y.Assert.isFalse(
                this.view.get('container').hasClass('is-login-error'),
                "The error class should be removed from the container"
            );
            Y.Assert.areEqual(
                defaultMessage, msgBox.getContent(),
                "The message box should be restored"
            );
        },

        "Should remove the error class and leave the message box": function () {
            var msgBox = this.view.get('container').one('.ez-loginform-message'),
                defaultMessage = msgBox.getContent();

            this["Should set the error class and the error message in the message box"]();
            this.view.set('authenticating', true);
            this.view.set('error', '');

            Y.Assert.isFalse(
                this.view.get('container').hasClass('is-login-error'),
                "The error class should be removed from the container"
            );
            Y.Assert.areNotEqual(
                defaultMessage, msgBox.getContent(),
                "The message box should be restored"
            );
        },
    });

    authTest = new Y.Test.Case({
        name: "eZ Login Form View authenticating test",

        setUp: function () {
            this.view = new Y.eZ.LoginFormView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        _getMsgBox: function () {
            return this.view.get('container').one('.ez-loginform-message');
        },

        "Should set a custom message": function () {
            var msg = this._getMsgBox().getContent();

            this.view.set('authenticating', true);

            Y.Assert.areNotEqual(
                msg, this._getMsgBox().getContent(),
                "The default message should have been replaced"
            );
        },

        "Should add the authenticating class": function () {
            this.view.set('authenticating', true);

            Y.Assert.isTrue(
                this.view.get('container').hasClass('is-authenticating'),
                "The authenticating class should be added to the container"
            );
        },

        "Should remove the authenticating class": function () {
            this["Should add the authenticating class"]();
            this.view.set('authenticating', false);

            Y.Assert.isFalse(
                this.view.get('container').hasClass('is-authenticating'),
                "The authenticating class should be removed from the container"
            );
        },

        "Should disable the interactive input": function () {
            var interactive = this.view.get('container').all('.ez-loginform-interactive');

            this.view.set('authenticating', true);

            Y.Assert.areNotEqual(0, interactive.size());
            interactive.each(function (i) {
                Y.Assert.isTrue(
                    i.get('disabled'),
                    "The interactive form element should be disabled"
                );
            });
        },

        "Should enable back the interactive input": function () {
            var interactive = this.view.get('container').all('.ez-loginform-interactive');

            this["Should disable the interactive input"]();
            this.view.set('authenticating', false);

            Y.Assert.areNotEqual(0, interactive.size());
            interactive.each(function (i) {
                Y.Assert.isFalse(
                    i.get('disabled'),
                    "The interactive form element should be enabled"
                );
            });
        },
    });

    Y.Test.Runner.setName("eZ Login Form View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(submitTest);
    Y.Test.Runner.add(errorTest);
    Y.Test.Runner.add(authTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-loginformview']});
