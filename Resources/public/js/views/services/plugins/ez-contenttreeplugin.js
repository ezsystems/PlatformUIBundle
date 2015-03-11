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
                viewStruct = contentService.newViewCreateStruct("children " + node.data.location.get('locationId'));

            viewStruct.body.ViewInput.Query.Criteria = {
                'ParentLocationIdCriterion': node.data.location.get('locationId'),
            };
            // TODO  we should set the sort order from the content type
            contentService.createView(viewStruct, function (err, response) {
                var results = response.document.View.Result.searchHits.searchHit,
                    tasks = new Y.Parallel(),
                    children = {},
                    loadError = false,
                    errCheck = function (err) {
                        if ( err ) {
                            loadError = true;
                        }
                    };

                if ( err ) {
                    callback({node: node});
                    return;
                }
                Y.Array.each(results, function (hit) {
                    var content = new Y.eZ.Content(),
                        locationId = '';

                    content.loadFromHash(hit.value.Content);
                    // TODO: this might not be the correct location
                    // but the location is needed only to get the number of sub
                    // items to determine whether this is a leaf or not.
                    locationId = content.get('resources').MainLocation;

                    children[locationId] = {
                        content: content,
                        location: new Y.eZ.Location({id: locationId}),
                        contentType: new Y.eZ.ContentType(
                            {id: content.get('resources').ContentType}
                        ),
                    };
                    children[locationId].location.load(options, tasks.add(errCheck));
                    children[locationId].contentType.load(options, tasks.add(errCheck));
                });

                tasks.done(function () {
                    if ( loadError ) {
                        callback({node: node});
                        return;
                    }
                    Y.Object.each(children, function (childStruct, key) {
                        node.append({
                            data: childStruct,
                            id: key,
                            canHaveChildren: childStruct.contentType.get('isContainer'),
                            state: {
                                leaf: (childStruct.location.get('childCount') === 0),
                            },
                        });
                    });
                    callback();
                });
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
