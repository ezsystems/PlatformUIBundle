/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-domstateplugin', function (Y) {
    "use strict";
    /**
     * Provides the DOM state plugin
     *
     * @module ez-domstateplugin
     */
    Y.namespace('eZ.Plugin');

    var MINIMIZE_DISCOVERY_BAR_CLASS = 'is-discoverybar-minimized';

    /**
     * DOM State plugin. Reflects the application state in the DOM by setting
     * some classes depending on the events.
     *
     * @namespace eZ.Plugin
     * @class DomState
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.DomState = Y.Base.create('domStatePlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this.onHostEvent(
                '*:minimizeDiscoveryBarAction', this._uiMinimizeDiscoveryBar
            );
            this.onHostEvent(
                '*:navigationModeChange', this._uiNavigationModeChange
            );
        },

        /**
         * `minimizeDiscoveryBarAction` event handler. It toggles the discovery
         * bar mininized class on the app container to minimize/maximize it.
         *
         * @method _uiMinimizeDiscoveryBar
         * @protected
         * @param {Object} e minimizeDiscoveryBarAction event facade
         */
        _uiMinimizeDiscoveryBar: function (e) {
            this.get('host').get('container').toggleClass(MINIMIZE_DISCOVERY_BAR_CLASS);
        },

        /**
         * `navigationModeChange` event handler. it sets or unsets the
         * navigation mode class provided in the event facade to handle the fact
         * that the navigation hub can be fixed or not.
         *
         * @method _uiNavigationModeChange
         * @protected
         * @param {Object} e navigationModeChange event facade
         */
        _uiNavigationModeChange: function (e) {
            var container = this.get('host').get('container');

            if ( e.navigation.value ) {
                container.addClass(e.navigation.modeClass);
            } else {
                container.removeClass(e.navigation.modeClass);
            }
        },
    }, {
        NS: 'domState',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.DomState, ['platformuiApp']
    );
});
