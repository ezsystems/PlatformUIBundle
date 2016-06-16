/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblocksview', function (Y) {
    'use strict';
    /**
     * Provides the Dashboard Blocks View class
     *
     * @module ez-dashboardblocksview
     */
    Y.namespace('eZ');

    var SELECTOR_CONTENT = '.ez-dashboard-content';

    /**
     * The dashboard blocks view
     *
     * @namespace eZ
     * @class DashboardBlocksView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DashboardBlocksView = Y.Base.create('dashboardBlocksView', Y.eZ.TemplateBasedView, [], {
        initializer: function () {
            this.after('activeChange', this._toggleBlocksActiveState, this);
        },

        /**
         * Renders the dashboard view
         *
         * @method render
         * @return {eZ.DashboardBlocksView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            this._renderBlocks();

            return this;
        },

        /**
         * Toggles blocks active state
         *
         * @method _toggleBlocksActiveState
         * @protected
         * @param event {Object} event facade
         */
        _toggleBlocksActiveState: function (event) {
            this.get('blocks').forEach(function (block) {
                block.set('active', event.newVal);
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

            this.get('blocks').forEach(function (block) {
                fragment.append(block.render().get('container'));
            });

            this.get('container').one(SELECTOR_CONTENT).setHTML(fragment);
        },

        /**
         * Sorts the provided list of blocks by priority.
         *
         * @method _sortBlocks
         * @protected
         * @param blocks {Array} list of blocks
         * @return {Array} sorted list of blocks
         */
        _sortBlocks: function (blocks) {
            return blocks.sort(function (a, b) {
                return b.get('priority') - a.get('priority');
            });
        },

        /**
         * Adds a block to the dashboard
         *
         * @method addBlock
         * @param view {Y.eZ.DashboardBlockBaseView} dashboard block view instance
         */
        addBlock: function (view) {
            var blocks = this.get('blocks'),
                identifier = view.get('identifier');

            if (this._findBlock(identifier)) {
                this.removeBlock(identifier);
            }

            view.addTarget(this);
            view.set('active', this.get('active'));

            blocks.push(view);

            this._set('blocks', this._sortBlocks(blocks));
        },

        /**
         * Finds block with a given identifier
         *
         * @method _findBlocks
         * @param identifier {String} block identifier
         * @return {eZ.DashboardBlockBaseView|Null} a block view
         */
        _findBlock: function (identifier) {
            return this.get('blocks').filter(function (block) {
                return block.get('identifier') === identifier;
            })[0];
        },

        /**
         * Removes a block from the dashboard
         *
         * @method removeBlock
         * @param identifier {String} block identifier
         */
        removeBlock: function (identifier) {
            var blocks = this.get('blocks'),
                existingBlock = this._findBlock(identifier);

            existingBlock.removeTarget(this);

            blocks.splice(blocks.indexOf(existingBlock), 1);

            this._set('blocks', blocks);
        }
    }, {
        ATTRS: {
            /**
             * An array dashboard blocks view instances.
             * To add a new block or remove existing one
             * use `addBlock` or `removeBlock` methods accordingly.
             *
             * @attribute blocks
             * @type Array
             * @readOnly
             */
            blocks: {
                valueFn: function () {
                    return [
                        new Y.eZ.DashboardBlockMyDraftsView({
                            priority: 1000,
                            bubbleTargets: this
                        }),
                        new Y.eZ.DashboardBlockMyContentView({
                            priority: 800,
                            bubbleTargets: this,
                            currentUser: this.get('currentUser'),
                        }),
                        new Y.eZ.DashboardBlockAllContentView({
                            priority: 600,
                            bubbleTargets: this,
                            rootLocation: this.get('rootLocation'),
                        }),
                    ];
                },
                readOnly: true
            }
        }
    });
});
