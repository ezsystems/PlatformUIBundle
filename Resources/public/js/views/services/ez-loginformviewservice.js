/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginformviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the login form view
     *
     * @module ez-loginformviewservice
     */
    Y.namespace('eZ');

    /**
     * Login form view service.
     *
     * @namespace eZ
     * @class LoginFormViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.LoginFormViewService = Y.Base.create('loginFormViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.on('*:authentication', this._authenticate);
        },

        /**
         * Load implementation for the login form view service. It checks if
         * the user is already logged and if it is, it redirects to the
         * dashboard
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var app = this.get('app');

            app.isLoggedIn(function (error) {
                if ( error ) {
                    next();
                    return;
                }
                app.navigateTo('dashboard');
            });
        },

        /**
         * loginFomView:authentication event handler, this is the actual
         * application login code. It makes sure the states of the view,
         * and the application are consistent.
         *
         * @method _authenticate
         * @protected
         * @param {Object} e event facade
         */
        _authenticate: function (e) {
            var view = e.target,
                app = this.get('app'),
                that = this;

            app.set('loading', true);
            view.set('authenticating', true);
            view.set('error', '');
            app.logIn(e.credentials, function (error, response) {
                app.set('loading', false);
                view.set('authenticating', false);
                if ( error ) {
                    that._handleLoginError(view, response);
                    return;
                }
                app.navigateTo('dashboard');
            });
        },

        /**
         * Handles the error occuring during login.
         *
         * @private
         * @method _handleLoginError
         * @param {View} view
         * @param {Object} response
         */
        _handleLoginError: function (view, response) {
            if ( response.status === 401 ) {
                view.set('error', 'Invalid username or password');
            } else {
                view.set('error', 'An unexpected error occurred');
            }
        },
    });
});
