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
                contentService = capi.getContentService();

            contentService.loadLocationChildren(node.id, function (err, response) {
                var tasks = new Y.Parallel(),
                    loadError = false,
                    children = {};

                if ( err ) {
                    callback({node: node});
                    return;
                }
                Y.Array.each(response.document.LocationList.Location, function (loc) {
                    var location, content, contentType,
                        end = tasks.add(function (err) {
                            if ( err ) {
                                loadError = true;
                                return;
                            }
                            children[location.get('id')] = {
                                location: location,
                                content: content,
                                contentType: contentType,
                            };
                        });

                    location = new Y.eZ.Location({id: loc._href});
                    location.load(options, function (err) {
                        if ( err ) {
                            end(err);
                        }
                        content = new Y.eZ.Content({id: location.get('resources').Content});
                        content.load(options, function (err) {
                            if ( err ) {
                                end(err);
                            }
                            contentType = new Y.eZ.ContentType({id: content.get('resources').ContentType});
                            contentType.load(options, end);
                        });
                    });
                });

                tasks.done(function () {
                    if ( loadError ) {
                        callback({node: node});
                        return;
                    }
                    Y.Array.each(response.document.LocationList.Location, function (key) {
                        node.append({
                            data: children[key._href],
                            id: key._href,
                            canHaveChildren: children[key._href].contentType.get('isContainer'),
                            state: {
                                leaf: (children[key._href].location.get('childCount') === 0),
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
