/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverycontenttreeplugin', function (Y) {
    "use strict";
    /**
     * Provides the content tree plugin for the universal discovery
     *
     * @module ez-universaldiscoverycontenttreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Universal Discovery Content Tree Plugin. It enhances the universal
     * discovery to handle the content tree related events and fetching.
     *
     * @namespace eZ.Plugin
     * @class UniversalDiscoveryContentTree
     * @constructor
     * @extends eZ.Plugin.ContentTree
     */
    Y.eZ.Plugin.UniversalDiscoveryContentTree = Y.Base.create('universalDiscoveryContentTree', Y.eZ.Plugin.ContentTree, [], {
        initializer: function () {
            this.afterHostEvent('universalDiscoveryBrowseView:visibleChange', function (e) {
                var methodView = e.target;
                
                if ( methodView.get('visible') ) {
                    this._buildTree(methodView);
                }
            });
        },

        /**
         * Builds the tree for the universal discovery browse view. The tree is
         * also initialize with the `loadContent` flag so the Content items are
         * also loaded if needed.
         *
         * @method _buildTree
         * @protected
         * @param {eZ.UniversalDiscoveryBrowseView} browseView
         */
        _buildTree: function (browseView) {
            var tree = this.get('tree'),
                virtualRoot = new Y.eZ.Location();

            // TODO: this location id should not be hardcoded, but auto
            // detected somehow.
            virtualRoot.set('id', '/api/ezp/v2/content/locations/1');
            virtualRoot.set('locationId', 1);

            tree.clear({
                data: {
                    location: virtualRoot,
                    loadContent: browseView.get('loadContent'),
                },
                id: virtualRoot.get('id'),
                state: {
                    leaf: false,
                },
                canHaveChildren: true,
            });
            browseView.get('treeView').set('tree', tree);

            // the tree rootNode can not be lazy loaded, so we explicitely need
            // to call _loadNode instead of tree.rootNode.open() and to fire the
            // load event.
            this._loadNode(tree.rootNode, function (err) {
                tree.lazy.fire('load', {node: tree.rootNode});
            });
        },
    }, {
        NS: 'universalDiscoveryContentTree',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UniversalDiscoveryContentTree, ['universalDiscoveryViewService']
    );
});
