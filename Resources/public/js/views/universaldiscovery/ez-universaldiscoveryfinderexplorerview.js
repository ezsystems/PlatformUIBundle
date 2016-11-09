/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderexplorerview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery finder explorer view
     *
     * @module ez-universaldiscoveryfinderexplorerview
     */
    Y.namespace('eZ');

    /**
     * The universal discovery finder method view. It allows the user to pick a
     * content in the repository with the explorer.
     *
     * @namespace eZ
     * @class UniversalDiscoveryFinderExplorerView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryFinderExplorerView = Y.Base.create('Y.eZ.TemplateBasedView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {


        },


        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            return this;
        },


    }, {
        ATTRS: {
            /**
             * Holds the finder explorer view that allows the user to explore contents
             *
             * @attribute finderExplorerView
             * @type {eZ.UniversalDiscoveryFinderExplorerView}
             */
            finderExplorerLevelViews: {
                valueFn: function () {
                    return new Y.eZ.UniversalDiscoveryFinderExplorerView({
                        bubbleTargets: this,
                    });
                },
            },
            
            /**
             * The constructor function to use to instance the item view
             * instances.
             *
             * @attribute levelViewConstructor
             * @type {Function}
             * @default {Y.eZ.UniversalDiscoveryFinderExplorerLevelView}
             */
            levelViewConstructor: {
                valueFn: function () {
                    return Y.eZ.UniversalDiscoveryFinderExplorerLevelView;
                },
            },
        },
    });
});
