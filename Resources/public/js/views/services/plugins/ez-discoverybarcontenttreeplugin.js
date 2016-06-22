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
         * Retrieves the root location id so that we can fallback on it as a
         * starting point to build the tree.
         *
         * @method parallelLoad
         * @param {Function} callback
         */
        parallelLoad: function (callback) {
            var discoveryService = this._getCAPI().getDiscoveryService();

            discoveryService.getInfoObject("rootLocation", Y.bind(function (error, rootLocation) {
                this._set('rootLocationId', rootLocation._href);
                callback();
            }, this));
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
            var node;

            node = this.get('tree').getNodeById(this._getBaseLocationId());
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
         * Checks whether the currently active view is a LocationViewView.
         *
         * @method _isLocationViewDisplayed
         * @protected
         * @return {Boolean}
         */
        _isLocationViewDisplayed: function () {
            return this.get('host').get('app').get('activeView') instanceof Y.eZ.LocationViewView;
        },

        /**
         * Returns the base location id used to build the tree. If a Location is
         * displayed, its Location id is used, otherwise we fallback on the
         * rootLocationId
         *
         * @method _getBaseLocationId
         * @protected
         * @return {String}
         */
        _getBaseLocationId: function () {
            if ( this._isLocationViewDisplayed() ) {
                return this._getResponse().view.location.get('id');
            }
            return this.get('rootLocationId');
        },

        /**
         * Returns the tree path. If a Location is displayed, the path build in
         * the LocationViewView is used, otherwise the path is empty which means
         * the root Location will have to be loaded later.
         *
         * @method _getTreePath
         * @protected
         * @return {Array}
         */
        _getTreePath: function () {
            var response = this._getResponse();

            if ( this._isLocationViewDisplayed() ) {
                return response.view.path.concat([response.view.location]);
            }
            return [];
        },

        /**
         * Builds the complete to tree and set it to the `view`
         *
         * @method _buildTree
         * @protected
         * @param {View} view
         */
        _buildTree: function (view) {
            var path,
                tree = this.get('tree');

            path = this._getTreePath();

            tree.clear(this._getRootNode(path));
            view.set('tree', tree);

            this._prepareRecursiveLoad(tree, path);

            // the tree rootNode can not be lazy loaded. Also, the root Location
            // is not available if the active view is not a LocationViewView
            this._loadRootNode(tree);
        },



        /**
         * Loads the tree root node. The root Location is also loaded if needed.
         *
         * @method _loadRootNode
         * @protected
         * @param {Tree} tree
         */
        _loadRootNode: function (tree) {
            var rootNode = tree.rootNode,
                location,
                doLoadRootNode = Y.bind(function () {
                    this._loadNode(rootNode, function (err) {
                        tree.lazy.fire('load', {node: rootNode});
                    });
                }, this);

            if ( !rootNode.data.location ) {
                location = new Y.eZ.Location({id: rootNode.id});
                location.load({api: this._getCAPI()}, function () {
                    rootNode.data.location = location;
                    rootNode.data.contentInfo = location.get('contentInfo');
                    doLoadRootNode();
                });
            } else {
                doLoadRootNode();
            }
        },

        /**
         * Returns the response object.
         *
         * @method _getResponse
         * @private
         * @return {Object}
         */
        _getResponse: function () {
            return this.get('host').get('response');
        },

        /**
         * Returns the CAPI
         *
         * @method _getCAPI
         * @private
         * @return {eZ.CAPI}
         */
        _getCAPI: function () {
            return this.get('host').get('capi');
        },
    }, {
        NS: 'discoveryBarContentTree',

        ATTRS: {
            /**
             * The system root location id
             *
             * @attribute rootLocationId
             * @readOnly
             * @type {String}
             */
            rootLocationId: {
                readOnly: true,
            },
        },
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.DiscoveryBarContentTree, ['discoveryBarViewService']
    );
    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.Search, ['discoveryBarViewService']
    );
});
