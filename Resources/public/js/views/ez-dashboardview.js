/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardview', function (Y) {
    "use strict";
    /**
     * Provides the Dashboard View class
     *
     * @module ez-dashboardview
     */
    Y.namespace('eZ');

    /**
     * The dashboard view
     *
     * @namespace eZ
     * @class DashboardView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardView = Y.Base.create('dashboardView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-discover': {
                'tap': '_runUniversalDiscovery',
            },
            '.ez-discover-settings': {
                'tap': '_runUniversalDiscoverySettings',
            },
        },

        _runUniversalDiscovery: function (e) {
            this.fire('contentDiscover', {
                config: {
                    contentDiscoveredHandler: Y.bind(this._universalDiscoveryConfirmHandler, this),
                }
            });
        },

        _runUniversalDiscoverySettings: function (e) {
            this.fire('contentDiscover', {
                config: {
                    title: 'You can not cancel, please click on Confirm',
                    selectionMode: 'multiple',
                    contentDiscoveredHandler: Y.bind(this._universalDiscoveryConfirmHandler, this),
                    cancelDiscoverHandler: Y.bind(this._universalDiscoveryCancelHandler, this),
                    visibleMethod: 'recent',
                },
            });
        },

        _universalDiscoveryConfirmHandler: function () {
            var countNode = this.get('container').one('.ez-ud-count'),
                count = parseInt(countNode.getContent(), 10) + 1;

            countNode.setContent(count);
        },

        _universalDiscoveryCancelHandler: function (e) {
            e.halt(true);
        },

        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });
});
