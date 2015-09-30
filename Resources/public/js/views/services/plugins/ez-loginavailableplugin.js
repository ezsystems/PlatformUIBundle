/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-loginavailableplugin', function (Y) {
    "use strict";
    /**
     * Provides the login available plugin
     *
     * @module ez-loginavailableplugin
     */
    Y.namespace('eZ.Plugin');

    var L = Y.Lang;

    /**
     * Login available plugin. It sets an event handler to check if a login is
     * available.
     *
     * @namespace eZ.Plugin
     * @class LoginAvailable
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.LoginAvailable = Y.Base.create('loginAvailablePlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:isLoginAvailable', this._isLoginAvailable);
        },

        /**
         * `isLoginAvailable` event handler, it checks if the login in the event
         * facade is available.
         *
         * @method _isLoginAvailable
         * @protected
         * @param {EventFacade} e
         */
        _isLoginAvailable: function (e) {
            var view = e.target,
                capi = this.get('host').get('capi');

            capi.getUserService().isLoginAvailable(e.login, function (available) {
                if ( L.isObject(available) ) {
                    view.setUnableToCheckLogin();
                } else if ( available ) {
                    view.setLoginAvailable();
                } else {
                    view.setLoginUnavailable();
                }
            });
        },
    }, {
        NS: 'loginAvailable',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.LoginAvailable, ['contentCreateViewService', 'contentEditViewService']
    );
});
