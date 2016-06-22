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
                virtualRoot = new Y.eZ.Location(),
                startingLocation = new Y.eZ.Location(),
                path = [];

            // TODO: this location id should not be hardcoded, but auto
            // detected somehow.
            virtualRoot.setAttrs({
                'id': '/api/ezp/v2/content/locations/1',
                'locationId': 1,
                'sortField': 'SECTION',
                'sortOrder': 'ASC',
            });

            tree.clear(this._getRootNode([virtualRoot], browseView.get('loadContent')));
            browseView.get('treeView').set('tree', tree);

            if (browseView.get('startingLocationId')) {
                startingLocation.set('id', browseView.get('startingLocationId'));

                this._loadStartingLocationPath(startingLocation, Y.bind(function(locationPath) {

                    path = locationPath.concat([startingLocation]);
                    path.unshift(virtualRoot);

                    this._prepareRecursiveLoad(tree, path, function() {
                        browseView.selectContent(tree.getNodeById(startingLocation.get('id')).data);
                    });
                }, this));
            }
            // the tree rootNode can not be lazy loaded, so we explicitely need
            // to call _loadNode instead of tree.rootNode.open() and to fire the
            // load event.
            this._loadNode(tree.rootNode, function (err) {
                tree.lazy.fire('load', {node: tree.rootNode});
            });
        },

        /**
         * `Get the path of the UDW starting Location.
         *
         * @method _loadStartingLocationPath
         * @protected
         * @param {eZ.Location} startingLocation
         * @param {Function} callback
         */
        _loadStartingLocationPath: function (startingLocation, callback) {
            var options = {api: this.get('host').get('capi')};

            startingLocation.load(options, function (error) {
                if (!error) {
                    startingLocation.loadPath(options, function (error, response) {
                        if (!error) {
                            callback(response);
                        }
                    });
                }
            });
        },

    }, {
        NS: 'universalDiscoveryContentTree',
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.UniversalDiscoveryContentTree, ['universalDiscoveryViewService']
    );
    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Search, ['universalDiscoveryViewService']
    );
});
