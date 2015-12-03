/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-positionplugin', function (Y) {
    "use strict";
    /**
     * Provides the position plugin
     *
     * @module ez-positionplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * The position plugin is responsible for handling the `heightChange` events
     * to adjust the margin of the main views node so that the navigation hub
     * and notification hub views don't overlap the main views. It also informs
     * the active view of its new position when a heightChange event is caught.
     *
     * @namespace eZ.Plugin
     * @class Position
     * @constructor
     * @extends Plugin.Base
     */
    Y.eZ.Plugin.Position = Y.Base.create('positionPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            var app = this.get('host'),
                plugin = this;

            app.after('*:heightChange', function (e) {
                var mainViews = app.get('container').one('.ez-mainviews'),
                    activeView = app.get('activeView');

                plugin._setPositionProperty(mainViews, 'marginTop', e.height.offset);
                if ( activeView && activeView.refreshTopPosition ) {
                    activeView.refreshTopPosition(e.height.offset);
                }
            });
        },

        /**
         * Sets the given style property on the node after applying the given
         * offset. It stores the actual state of the property in a data
         * attribute to avoid having to deal with running transitions when
         * getting the actual style.
         *
         * @method _setPositionProperty
         * @protected
         * @param {Node} node
         * @param {String} property
         * @param {Number} offset
         */
        _setPositionProperty: function (node, property, offset) {
            var value = parseInt(
                    node.getData(property) ? node.getData(property) : 0,
                    10
                );

            node.setStyle(
                property,
                (value + offset) + 'px'
            );
            node.setData(property, (value + offset));
        },
    }, {
        NS: 'position',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Position, ['platformuiApp']
    );
});
