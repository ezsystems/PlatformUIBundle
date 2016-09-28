/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userloadplugin', function (Y) {
    "use strict";
    /**
     * Provides the user load plugin
     *
     * @module ez-userloadplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Object user load plugin. It sets an event handler to load contents
     * in an object relation list field.
     *
     * In order to use it you need to fire the `loadUser` event with two parameters:
     *  - `userId` of the user to be loaded
     *  - `attributeName` where to store the result
     *
     * @namespace eZ.Plugin
     * @class UserLoad
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.UserLoad = Y.Base.create('userloadplugin', Y.eZ.Plugin.ViewServiceBase, [], {

        initializer: function () {
            this.onHostEvent('*:loadUser', this._loadUser);
        },

        /**
         * Loads a user. Once this is done, it sets the content in
         * the attribute defined in the event parameter of the event target.
         * @protected
         * @method _loadUser
         * @param {Object} e loadUser event facade
         */
        _loadUser: function (e) {
            var loadOptions = {api: this.get('host').get('capi')},
                User = this.get('userModelConstructor'),
                loadedUser = new User(),
                attribute = e.attributeName;

            loadedUser.set('id', e.userId);
            loadedUser.load(loadOptions, function(error) {
                if (error) {
                    e.target.set('loadingError', true);
                } else {
                    e.target.set(attribute, loadedUser);
                }
            });
        },
    }, {
        NS: 'userLoad',

        ATTRS: {
            /**
             * User Model constructor
             *
             * @attribute userModelConstructor
             * @default Y.eZ.User
             * @type Function
             */
            userModelConstructor: {
                value: Y.eZ.User
            }
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UserLoad, ['locationViewViewService']
    );
});
