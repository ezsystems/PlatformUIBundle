/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-treeactionview', function (Y) {
    "use strict";
    /**
     * Provide the button action view to display the content tree
     *
     * @method ez-treeactionview
     */
    Y.namespace('eZ');

    var IS_TREE_NODE_LOADING = "is-tree-node-loading",
        IS_TREE_NODE_SELECTED = "is-tree-node-selected",
        IS_TREE_NODE_CLOSE = "is-tree-node-close",
        IS_TREE_NODE_OPEN = "is-tree-node-open",
        IS_TREE_NODE_ERROR = "is-tree-node-error",
        IS_TREE_LOADED = "is-tree-loaded",
        NAVIGATION_MAX_HEIGHT = 120,
        TREE_TPL = Y.Handlebars.compile('{{> ez_tree }}'),
        _events = {
            '.ez-tree-navigate': {
                'tap': '_uiNavigate',
            },
            '.ez-tree-node-toggle': {
                'tap': '_toggleNode',
            }
        };

    /**
     * Tree action view
     *
     * @namespace eZ
     * @class TreeActionView
     * @constructor
     * @extends eZ.ButtonActionView
     */
    Y.eZ.TreeActionView = Y.Base.create('treeActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {
        initializer: function () {
            Y.eZ.TemplateBasedView.registerPartial('ez_tree', 'tree-ez-partial');
            this.events = Y.merge(_events, this.events);
            this.childrenTemplate = TREE_TPL;

            this.after('expandedChange', this._uiExpand);
            this.after('treeAction', this._toggleExpanded);
            this.after('treeChange', this._uiBindTree);
        },

        /**
         * Defines the event handlers related to the tree
         *
         * @method _uiBindTree
         * @protected
         */
        _uiBindTree: function () {
            var tree = this.get('tree');

            tree.after('open', Y.bind(this._uiOpen, this));
            tree.after('close', Y.bind(this._uiClose, this));
            tree.after('select', Y.bind(this._uiSelect, this));
            tree.after('unselect', Y.bind(this._uiUnselect, this));
            tree.after('clear', Y.bind(this._uiClear, this));
            tree.lazy.on('load', Y.bind(this._uiLoad, this));
            tree.lazy.on('error', Y.bind(this._uiError, this));
        },

        /**
         * `expanded` change event handler
         *
         * @method _uiExpand
         * @protected
         * @param {Object} e event facade
         */
        _uiExpand: function (e) {
            if ( e.newVal ) {
                this._uiSetMaxHeight();
            }
            this._handleClickOutside(e.newVal);
        },

        /**
         * Click outside event handler
         *
         * @method _handleClickOutside
         * @param {Boolean} expanded state
         * @protected
         */
        _handleClickOutside: function (expanded) {
            if ( expanded ) {
                this._clickOutsideSubscription = this.get('container').on(
                    'clickoutside', Y.bind(this._uiNavigate, this)
                );
            } else {
                this._clickOutsideSubscription.detach();
            }
        },

        /**
         * Sets the maximum height of the expandable area of the view
         *
         * @method _uiSetMaxHeight
         * @protected
         */
        _uiSetMaxHeight: function () {
            var exp = this.get('expandableNode');

            exp.setStyle(
                'max-height',
                Math.round(
                    exp.get('winHeight') - NAVIGATION_MAX_HEIGHT - exp.getY() + exp.get('docScrollY')
                ) + 'px'
            );
        },

        /**
         * Tree load error event handler
         * 
         * @method _uiError
         * @protected
         * @param {Object} e event handler
         */
        _uiError: function (e) {
            this._getElementYNode(e.error.node)
                .addClass(IS_TREE_NODE_ERROR)
                .removeClass(IS_TREE_NODE_LOADING);
        },

        /**
         * Tree select event handler
         *
         * @method _uiSelect
         * @protected
         * @param {Object} e
         */
        _uiSelect: function (e) {
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).addClass(IS_TREE_NODE_SELECTED);
            }
        },

        /**
         * Tree unselect event handler
         *
         * @method _uiUnselect
         * @protected
         * @param {Object} e
         */
        _uiUnselect: function (e) {
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).removeClass(IS_TREE_NODE_SELECTED);
            }
        },

        /**
         * Tree load event handler
         *
         * @method _uiLoad
         * @protected
         * @param {Object} e
         */
        _uiLoad: function (e) {
            this._renderNodeChildren(e.node);
            if ( !e.node.isRoot() ) {
                this._getElementYNode(e.node).removeClass(IS_TREE_NODE_LOADING);
            }
        },

        /**
         * Tree open event handler
         *
         * @method _uiOpen
         * @protected
         * @param {Object} e
         */
        _uiOpen: function (e) {
            var node = e.node,
                ynode = this._getElementYNode(e.node);

            ynode.addClass(IS_TREE_NODE_OPEN).removeClass(IS_TREE_NODE_CLOSE);

            if ( node.state.loading ) {
                ynode.addClass(IS_TREE_NODE_LOADING).removeClass(IS_TREE_NODE_ERROR);
            }
        },

        /**
         * Tree close event handler
         *
         * @method _uiClose
         * @protected
         * @param {Object} e
         */
        _uiClose: function (e) {
            var ynode = this._getElementYNode(e.node);

            ynode.addClass(IS_TREE_NODE_CLOSE).removeClass(IS_TREE_NODE_OPEN);
        },

        /**
         * Tree clear event handler
         *
         * @method _uiClear
         * @protected
         * @param {Object} e
         */
        _uiClear: function (e) {
            this.get('container').removeClass(IS_TREE_LOADED);
            this._getTreeContentNode().empty();
        },

        /**
         * Renders the tree action view. The view is rendered only once. When
         * rendered, the view container gets the button action view class.
         *
         * @method render
         * @return {eZ.TreeActionView}
         */
        render: function () {
            if ( this._getTreeContentNode() ) {
                return this;
            }
            this._addButtonActionViewClassName();
            return this.constructor.superclass.render.call(this);
        },

        /**
         * Renders the children of a given `node`. This uses the `ez_tree`
         * partials so it needs to be registered
         *
         * @method _renderNodeChildren
         * @protected
         * @param node {Y.Tree.Node}
         */
        _renderNodeChildren: function (node) {
            var template = this.childrenTemplate;

            if ( node.isRoot() ) {
                this.get('container').addClass(IS_TREE_LOADED);
                this._getTreeContentNode().append(template(node.toJSON()));
            } else {
                this._getElementYNode(node).append(template(node.toJSON()));
            }
        },

        /**
         * Tap event handler on the navigate links in the tree
         *
         * @method _uiNavigate
         * @param {Object} e
         * @protected
         */
        _uiNavigate: function (e) {
            this.set('expanded', false);
        },

        /**
         * Tap event handler on the `tree-node-toggle` link. It fires the
         * `toggleNode` event
         *
         * @method _toggleNode
         * @protected
         * @param {Object} e
         */
        _toggleNode: function (e) {
            e.preventDefault();
            /**
             * Fired when the tree node open state has to change
             *
             * @event toggleNode
             * @param {Number} nodeId the node id
             */
            this.fire('toggleNode', {
                nodeId: e.target.get('parentNode').getData('node-id')
            });
        },

        /**
         * Returns the Y.Node which renders the given `node`
         *
         * @method _getElementYNode
         * @private
         * @param {Y.Tree.Node} node
         * @return {Y.Node}
         */
        _getElementYNode: function (node) {
            return this.get('container').one('[data-node-id="' + node.id + '"]');
        },

        /**
         * Returns the Y.Node where the tree is rendered
         *
         * @method _getTreeContentNode
         * @private
         * @return {Y.Node}
         */
        _getTreeContentNode: function () {
            return this.get('container').one('.ez-tree-content');
        },

        /**
         * Toggles the expanded state
         *
         * @method _toggleExpanded
         * @protected
         */
        _toggleExpanded: function () {
            this.set('expanded', !this.get('expanded'));
        },
    }, {
        ATTRS: {
            /**
             * Holds tree being displayed
             *
             * @attribute tree
             * @type eZ.ContentTree
             * @writeOnce
             */
            tree: {
                writeOnce: true,
            },
        }
    });
});
