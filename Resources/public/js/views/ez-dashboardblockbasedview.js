/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockbasedview', function (Y) {
    'use strict';
    /**
     * Provides the Dashboard Block Based View class
     *
     * @module ez-dashboardblockbasedview
     */
    Y.namespace('eZ');

    var SELECTOR_CONTENT = '.dashboard-content';

    /**
     * The dashboard view
     *
     * @namespace eZ
     * @class DashboardBlockBasedView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardBlockBasedView = Y.Base.create('dashboardBlockBasedView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.after('activeChange', function () {
                this.after('blocksChange', this._renderBlocks, this);

                this._makeBlocksActive();
            }, this);
        },

        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardBlockBasedView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({dashboardTitle: this.get('dashboardTitle')}));
            this._renderBlocks();

            return this;
        },

        /**
         * Activates all the blocks to allow communication between blocks and service
         *
         * @method _makeBlocksActive
         * @protected
         */
        _makeBlocksActive: function () {
            var blocks = this.get('blocks');

            Object.keys(blocks).forEach(function (key) {
                blocks[key].set('active', true);
            });
        },

        /**
         * Renders blocks on the dashboard
         *
         * @method _renderBlocks
         * @protected
         */
        _renderBlocks: function () {
            var fragment = Y.one(document.createDocumentFragment());

            this._sortBlocks(this.get('blocks')).forEach(Y.bind(function (block) {
                var targets = block.getTargets();

                if (targets.indexOf(this) === -1) {
                    block.addTarget(this);
                }

                fragment.append(block.render().get('container'));
            }, this));

            this.get('container').one(SELECTOR_CONTENT).setHTML(fragment);
        },

        /**
         * Sorts the provided hash of blocks either by priority
         * or alphabetically when both blocks have the same priority.
         *
         * @method _sortBlocks
         * @protected
         * @param blocks {Object} hash of blocks
         * @return {Array} sorted list of blocks
         */
        _sortBlocks: function (blocks) {
            var list = [];

            Object.keys(blocks).forEach(function (key) {
                list.push(blocks[key]);
            });

            list.sort(function (a, b) {
                var priorityA = a.get('priority'),
                    priorityB = b.get('priority');

                if (priorityA === priorityB) {
                    // sort alphabetically (from A to B)
                    return a.get('identifier') < b.get('identifier');
                } else {
                    // sort by priority (max to 0)
                    return priorityA > priorityB;
                }
            });

            return list;
        },

        /**
         * Verifies provided `blocks` attribute value
         * by checking whether provided values are dashboard block view instances
         *
         * @method _checkBlocks
         * @protected
         * @param value {Any} new vaue of `blocks` attribute
         * @return {Object}
         */
        _checkBlocks: function (value) {
            var blocks = {};

            if (typeof value !== 'object' || Array.isArray(value)) {
                return blocks;
            }

            Object.keys(value).forEach(function (key) {
                if (value[key] instanceof Y.eZ.BaseDashboardBlockView) {
                    blocks[key] = value[key];
                }
            });

            return blocks;
        },

        /**
         * Adds a block to the dashboard
         *
         * @method addBlock
         * @param view {Y.eZ.BaseDashboardBlockView} dashboard block view instance
         * @return {Object} the hash of blocks
         */
        addBlock: function (view) {
            var blocks = this.get('blocks'),
                identifier = view.get('identifier');

            if (!identifier) {
                return blocks;
            }

            if (blocks[identifier]) {
                blocks = this.removeBlock(identifier, true);
            }

            blocks[identifier] = view;

            this.set('blocks', blocks);

            return blocks;
        },

        /**
         * Removes a block from the dashboard
         *
         * @method removeBlock
         * @param identifier {String} block identifier
         * @param preventUpdating {Boolean} should the `blocks` attribute value be updated?
         * @return {Object} the hash of blocks
         */
        removeBlock: function (identifier, preventUpdating) {
            var blocks = this.get('blocks'),
                block = blocks[identifier];

            block.removeTarget(this);
            block.destroy({remove: true});

            delete blocks[identifier];

            if (!preventUpdating) {
                this.set('blocks', blocks);
            }

            return blocks;
        }
    }, {
        ATTRS: {
            /**
             * The dashboard title
             *
             * @attribute dashboardTitle
             * @type String
             * @default 'Dashboard'
             */
            dashboardTitle: {
                value: 'Dashboard'
            },

            /**
             * Hash containing information about all blocks in the dashboard
             *
             * @attribute blocks
             * @type Object
             * @example {
             *     key1<String>: viewInstance1<Y.eZ.BaseDashboardBlockView>,
             *     key2<String>: viewInstance2<Y.eZ.BaseDashboardBlockView>,
             * }
             */
            blocks: {
                setter: '_checkBlocks',
                value: {}
            }
        }
    });
});
