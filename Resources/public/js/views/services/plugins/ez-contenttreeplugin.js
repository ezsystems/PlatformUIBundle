/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttreeplugin', function (Y) {
    "use strict";
    /**
     * Provides the base content tree plugin
     *
     * @module ez-contenttreeplugin
     */
    Y.namespace('eZ.Plugin');

    /**
     * Base Content Tree Plugin. This class provides the methods to handle a
     * lazy loaded content tree and is meant to be extended.
     *
     * @namespace eZ.Plugin
     * @class ContentTree
     * @constructor
     * @extends eZ.Plugin.ViewServiceBase
     */
    Y.eZ.Plugin.ContentTree = Y.Base.create('contentTree', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:toggleNode', this._toggleNode);
        },

        /**
         * `toggleNode` event handler. It just toggles the open state of the
         * node which `nodeId` is passed in the event facade
         *
         * @method _toggleNode
         * @protected
         * @param {Object} e event facade
         */
        _toggleNode: function (e) {
            this.get('tree').getNodeById(e.nodeId).toggleOpen();
        },

        /**
         * Loads the children node of the given `node`. This method implements
         * the `load` method of the Y.Plugin.Tree.Lazy plugin
         *
         * @method _loadNode
         * @protected
         * @param {Y.Tree.Node} node
         * @param {Function} callback
         */
        _loadNode: function (node, callback) {
            var levelLocation = node.data.location,
                loadContent = this.get('tree').rootNode.data.loadContent;

            this.get('host').search.findLocations({
                viewName: 'children_' + levelLocation.get('locationId'),
                criteria: {
                    "ParentLocationIdCriterion": levelLocation.get('locationId'),
                },
                sortLocation: levelLocation,
                loadContent: loadContent,
                loadContentType: true,
            }, function (error, results) {
                if ( error ) {
                    callback({node: node});
                    return;
                }
                results.forEach(function (locationStruct) {
                    var location = locationStruct.location,
                        contentType = locationStruct.contentType,
                        data = {
                            location: location,
                            contentInfo: location.get('contentInfo'),
                            contentType: contentType,
                        };

                    if ( loadContent ) {
                        data.content = locationStruct.content;
                    }

                    node.append({
                        data: data,
                        id: location.get('id'),
                        canHaveChildren: contentType.get('isContainer'),
                        state: {
                            leaf: (location.get('childCount') === 0),
                        },
                    });
                });
                callback();
            });
        },

        /**
         * Builds the root node for the tree.
         *
         * @method _getRootNode
         * @protected
         * @param {Array} path
         * @param {Boolean} loadContent Optional flag indicating whether the Content should be provided in the
         * selection
         * @return {Object}
         */
        _getRootNode: function (path, loadContent) {
            var data = {},
                id = this.get('rootLocationId');
      
            if ( path[0] ) {
                data = {
                    location: path[0],
                    contentInfo: path[0].get('contentInfo'),
                    loadContent: loadContent,
                };
                id = path[0].get('id');
            }
            return {
                data: data,
                id: id,
                state: {
                    leaf: false,
                },
                canHaveChildren: true,
            };
        },

        /**
         * Prepares the recursive tree loading when a specific Location is
         * displayed.
         *
         * @method _prepareRecursiveLoad
         * @param {Tree} tree
         * @param {Array} path
         * @param {Function} callback
         */
        _prepareRecursiveLoad: function (tree, path, callback) {
            var subscription;

            subscription = tree.lazy.on('load', function (evt) {
                path.shift();
                if ( path[0] ) {
                    tree.getNodeById(path[0].get('id')).open();
                    if ( path.length === 1 ) {
                        tree.getNodeById(path[0].get('id')).select();
                        subscription.detach();
                        if (callback) {
                            callback();
                        }
                    }
                }
            });
        },

        /**
         * Loads the Content for each tree node representing the children of
         * `levelLocation`.
         *
         * @method _loadContents
         * @param {eZ.Location} levelLocation
         * @param {Object} data
         * @param {Function} callback
         * @deprecated
         * @protected
         */
        _loadContents: function (levelLocation, data, callback) {
            var contentService = this.get('host').get('capi').getContentService(),
                contents = {},
                query;

            console.log('[DEPRECATED] `_loadContents` method is deprecated');
            console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
            query = contentService.newViewCreateStruct('children_content' + levelLocation.get('locationId'), 'ContentQuery');
            query.body.ViewInput.ContentQuery.Criteria = {
                "ParentLocationIdCriterion": levelLocation.get('locationId'),
            };

            contentService.createView(query, function (err, response) {
                if ( err ) {
                    callback(err);
                    return;
                }
                Y.Array.each(response.document.View.Result.searchHits.searchHit, function (hit) {
                    var content = new Y.eZ.Content({id: hit.value.Content._href});

                    content.loadFromHash(hit.value.Content);
                    contents[content.get('id')] = content;
                });

                Y.Object.each(data, function (struct, key) {
                    data[key].content = contents[struct.contentInfo.get('id')];
                });
                callback();
            });
        },
    }, {
        ATTRS: {
            /**
             * The Tree structure to display the locations
             *
             * @attribute tree
             * @type eZ.ContentTree
             * @readOnly
             */
            tree: {
                readOnly: true,
                valueFn: function () {
                    var tree = new Y.eZ.ContentTree(),
                        plugin = this;

                    tree.plug(Y.Plugin.Tree.Lazy, {
                        load: Y.bind(plugin._loadNode, plugin),
                    });
                    return tree;
                }
            },
        }
    });
});
