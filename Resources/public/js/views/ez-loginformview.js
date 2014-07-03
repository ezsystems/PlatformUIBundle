/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginformview', function (Y) {
    "use strict";
    /**
     * Provides the Login Form View class
     *
     * @module ez-loginformview
     */
    Y.namespace('eZ');

    var LOGIN_ERROR = 'is-login-error',
        IS_AUTHENTICATING = 'is-authenticating',
        MESSAGE_SELECTOR = '.ez-loginform-message',
        /**
         * Fired when the user submit the login form
         *
         * @event authentication
         * @param credentials {Object}
         * @param credentials.login {String}
         * @param credentials.password {String}
         */
        EVT_AUTH = 'authentication';

    /**
     * The login form view
     *
     * @namespace eZ
     * @class LoginFormView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LoginFormView = Y.Base.create('loginFormView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-loginform': {
                'submit': '_login'
            },
        },

        initializer: function () {
            this.after('errorChange', this._uiErrorChange);
            this.after('authenticatingChange', this._uiAuthenticatingChange);

            /**
             * The default message in the message box. This property is filled
             * right after the view is rendered
             *
             * @property _defaultMessage
             * @protected
             * @type String
             * @default ""
             */
            this._defaultMessage = '';
        },

        /**
         * Event handler for the `authenticating` attribute change event.
         *
         * @method _uiAuthenticatingChange
         * @protected
         */
        _uiAuthenticatingChange: function () {
            var container = this.get('container'),
                interactive = container.all('.ez-loginform-interactive');

            if ( this.get('authenticating') ) {
                container.addClass(IS_AUTHENTICATING);
                interactive.set('disabled', true);
                this._setMessage('Checking username and password');
            } else {
                container.removeClass(IS_AUTHENTICATING);
                interactive.set('disabled', false);
            }
        },

        /**
         * Event handler for the `error` attribute change event.
         *
         * @method _uiErrorChange
         * @protected
         */
        _uiErrorChange: function () {
            var container = this.get('container'),
                error = this.get('error');

            if ( error ) {
                container.addClass(LOGIN_ERROR);
                this._setMessage(error);
            } else {
                container.removeClass(LOGIN_ERROR);
                if ( !this.get('authenticating') ) {
                    this._setMessage(this._defaultMessage);
                }
            }
        },

        /**
         * Event handler for the submit event. It checks if the form is
         * correctly filled and it then fires the `authentication` event with
         * the provided credentials.
         *
         * @method _login
         * @protected
         */
        _login: function (e) {
            var form = e.currentTarget,
                username = form.get('username').get('value'),
                password = form.get('password').get('value');

            e.preventDefault();
            if ( username && password ) {
                this.fire(EVT_AUTH, {
                    credentials: {
                        login: username,
                        password: password,
                    },
                });
            }
        },

        /**
         * Sets the message in the message box
         *
         * @method _setMessage
         * @protected
         * @param {String} msg
         */
        _setMessage: function (msg) {
            this.get('container').one(MESSAGE_SELECTOR).setContent(msg);
        },

        /**
         * Renders the login form view
         *
         * @method render
         * @return {eZ.LoginFormView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            this._uiSetHeight();
            this._defaultMessage = container.one(MESSAGE_SELECTOR).getContent();
            return this;
        },

        /**
         * Sets the height of the view
         *
         * @private
         * @method _uiSetHeight
         */
        _uiSetHeight: function () {
            var container = this.get('container');

            container.setStyle(
                'height', container.get('winHeight') + 'px'
            );
        },
    }, {
        ATTRS: {
            /**
             * The error message to display
             *
             * @attribute error
             * @type String
             * @default ""
             */
            error: {
                value: "",
            },

            /**
             * Indicates whether an authentication is currently happening
             *
             * @attribute authenticating
             * @type Boolean
             * @default false
             */
            authenticating: {
                value: false,
            }
        }
    });
});
