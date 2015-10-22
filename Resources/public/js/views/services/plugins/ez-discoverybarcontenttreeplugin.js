/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarcontenttreeplugin', function (Y) {
    "use strict";
    /**
     * Provides the discovery bar content tree plugin for the discovery bar view service.
     *
     * @module ez-discoverybarcontenttreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Discovery Bar Content Tree Plugin. It enhances the discovery bar to
     * handle the content tree related events and fetching.
     *
     * @namespace eZ.Plugin
     * @class DiscoveryBarContentTree
     * @constructor
     * @extends eZ.Plugin.ContentTree
     */
    Y.eZ.Plugin.DiscoveryBarContentTree = Y.Base.create('discoveryBarContentTree', Y.eZ.Plugin.ContentTree, [], {
        initializer: function () {
            this.afterHostEvent('*:treeAction', this._handleTree);
        },

        /**
         * `treeAction` event handler. If the currently displayed location is
         * available in the tree, it opens and selects it otherwise, it builds
         * the entire tree.
         *
         * @method _handleTree
         * @protected
         * @param {Object} e event facade
         */
        _handleTree: function (e) {
            var node, response = this.get('host').get('response');

            node = this.get('tree').getNodeById(response.view.location.get('id'));
            if ( node ) {
                node.open().select();
                return;
            }
            // TODO: we might be a bit smarter here if we can not find the
            // location in the tree, maybe one of its ascendant is in it, so we
            // might just load the missing part of the tree instead of reloading
            // everything in _buildTree.

            if ( e.target.get('expanded') ) {
                this._buildTree(e.target);
            }
        },

        /**
         * Builds the complete to tree and set it to the `view`
         *
         * @method _buildTree
         * @protected
         * @param {View} view
         */
        _buildTree: function (view) {
            var path = [], subscription,
                tree = this.get('tree'),
                response = this.get('host').get('response');

            path = response.view.path.concat([response.view.location]);

            tree.clear({
                data: {
                    location: path[0],
                    contentInfo: path[0].get('contentInfo'),
                },
                id: path[0].get('id'),
                state: {
                    leaf: false,
                },
                canHaveChildren: true,
            });
            view.set('tree', tree);

            subscription = tree.lazy.on('load', function (evt) {
                path.shift();
                if ( path[0] ) {
                    tree.getNodeById(path[0].get('id')).open();
                    if ( path.length === 1 ) {
                        tree.getNodeById(path[0].get('id')).select();
                    }
                } else {
                    subscription.detach();
                }
            });

            // the tree rootNode can not be lazy loaded, so we explicitely need
            // to call _loadNode instead of tree.rootNode.open() and to fire the
            // load event.
            this._loadNode(tree.rootNode, function (err) {
                tree.lazy.fire('load', {node: tree.rootNode});
            });

        },
    }, {
        NS: 'discoveryBarContentTree',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.DiscoveryBarContentTree, ['discoveryBarViewService']
    );
});
