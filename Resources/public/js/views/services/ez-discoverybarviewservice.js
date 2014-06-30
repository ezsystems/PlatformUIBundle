YUI.add('ez-discoverybarviewservice', function (Y) {
    "user strict";
    /**
     * Provides the view service component for the discovery bar
     *
     * @module ez-discoverybarviewservice
     */
    Y.namespace('eZ');

    /**
     * Discovery bar view service.
     *
     * @namespace eZ
     * @class DiscoveryBarViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DiscoveryBarViewService = Y.Base.create('discoveryBarViewService', Y.eZ.ViewService, [], {
        initializer: function () {
            this.after('*:treeAction', this._handleTree);
            this.on('*:toggleNode', this._toggleNode);
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

            node = this.get('tree').getNodeById(
                this.get('response').view.location.get('id')
            );
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
         * @todo improve performances!
         */
        _buildTree: function (view) {
            var path = [], subscription,
                tree = this.get('tree');

            Y.Array.each(this.get('response').view.path, function (element) {
                path.push(element.location.get('id'));
            });
            path.push(this.get('response').view.location.get('id'));

            tree.clear({
                data: {
                    location: this.get('response').view.location.toJSON(),
                    content: this.get('response').view.content.toJSON(),
                },
                id: path[0],
                state: {
                    leaf: false,
                },
                canHaveChildren: true,
            });
            view.set('tree', tree);

            subscription = tree.lazy.on('load', function (evt) {
                path.shift();
                if ( path[0] ) {
                    tree.getNodeById(path[0]).open();
                    if ( path.length === 1 ) {
                        tree.getNodeById(path[0]).select();
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
            var options = {api: this.get('capi')},
                contentService = this.get('capi').getContentService();

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
                                location: location.toJSON(),
                                content: content.toJSON(),
                                contentType: contentType.toJSON(),
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
                            canHaveChildren: children[key._href].contentType.isContainer,
                            state: {
                                leaf: (children[key._href].location.childCount === 0),
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
                        service = this;

                    tree.plug(Y.Plugin.Tree.Lazy, {
                        load: Y.bind(service._loadNode, service),
                    });
                    return tree;
                }
            },
        }
    });
});
