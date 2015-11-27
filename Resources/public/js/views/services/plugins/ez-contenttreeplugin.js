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
            var capi = this.get('host').get('capi'),
                options = {api: capi},
                contentService = capi.getContentService(),
                levelLocation = node.data.location,
                query;

            query = contentService.newViewCreateStruct('children_' + levelLocation.get('locationId'), 'LocationQuery');
            query.body.ViewInput.LocationQuery.Criteria = {
                "ParentLocationIdCriterion": levelLocation.get('locationId'),
            };

            /*
             * @TODO sort correctly the sub-items of the levelLocation
             * see https://jira.ez.no/browse/EZP-24998
            query.body.ViewInput.LocationQuery.SortClauses = {
                "SortClause": {
                    "SortField": levelLocation.get('sortField'),
                    "SortOrder": levelLocation.get('sortOrder'),
                },
            };
            */

            contentService.createView(query, Y.bind(function (err, response) {
                var tasks = new Y.Parallel(),
                    loadError = false,
                    children = {};

                if ( err ) {
                    callback({node: node});
                    return;
                }
                Y.Array.each(response.document.View.Result.searchHits.searchHit, function (hit) {
                    var loc, contentInfo, contentType,
                        end = tasks.add(function (err) {
                            if ( err ) {
                                loadError = true;
                                return;
                            }
                            node.append({
                                data: children[loc.get('id')],
                                id: loc.get('id'),
                                canHaveChildren: children[loc.get('id')].contentType.get('isContainer'),
                                state: {
                                    leaf: (loc.get('childCount') === 0),
                                },
                            });
                        });

                    loc = new Y.eZ.Location({id: hit.value.Location._href});
                    loc.loadFromHash(hit.value.Location);

                    // TODO we should be a bit smarter here to not load again
                    // and again the same content type at least for a given level.
                    contentInfo = loc.get('contentInfo');
                    contentType = new Y.eZ.ContentType({id: contentInfo.get('resources').ContentType});

                    children[loc.get('id')] = {
                        "location": loc,
                        "contentInfo": contentInfo,
                        "contentType": contentType,
                    };
                    contentType.load(options, end);
                });

                if ( node.tree.rootNode.data.loadContent ) {
                    this._loadContents(levelLocation, children, tasks.add(function (err) {
                        loadError = err;
                    }));
                }

                tasks.done(function () {
                    if ( loadError ) {
                        callback({node: node});
                        return;
                    }
                    callback();
                });
            }, this));
        },

        /**
         * Loads the Content for each tree node representing the children of
         * `levelLocation`.
         *
         * @method _loadContents
         * @param {eZ.Location} levelLocation
         * @param {Object} data
         * @param {Function} callback
         * @protected
         */
        _loadContents: function (levelLocation, data, callback) {
            var contentService = this.get('host').get('capi').getContentService(),
                contents = {},
                query;

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
