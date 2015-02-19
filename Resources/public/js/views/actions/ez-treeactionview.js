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

    var NAVIGATION_MAX_HEIGHT = 120;

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
            this.after('expandedChange', this._uiExpand);
            this.after('treeAction', this._toggleExpanded);
            this.after('treeChange', function () {
                this.get('treeView').set('tree', this.get('tree'));
            });
            this.on('*:treeNavigate', this._uiNavigate);
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
                'maxHeight',
                Math.round(
                    exp.get('winHeight') - NAVIGATION_MAX_HEIGHT - exp.getY() + exp.get('docScrollY')
                ) + 'px'
            );
        },

        /**
         * Renders the tree action view. The view is rendered only once. When
         * rendered, the view container gets the button action view class.
         *
         * @method render
         * @return {eZ.TreeActionView}
         */
        render: function () {
            if ( this.get('expandableNode') ) {
                return this;
            }
            this._addButtonActionViewClassName();
            this.constructor.superclass.render.call(this);
            this.get('expandableNode').append(
                this.get('treeView').render().get('container')
            );
            return this;
        },

        /**
         * `treeNavigate` event handler. It makes sure the tree action view is
         * unexpanded when navigating with the tree.
         *
         * @method _uiNavigate
         * @param {EventFacade} e
         * @protected
         */
        _uiNavigate: function (e) {
            this.set('expanded', false);
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

            /**
             * Holds the tree view to display the tree object
             *
             * @attribute treeView
             * @type eZ.TreeView
             */
            treeView: {
                valueFn: function () {
                    var treeView = new Y.eZ.TreeView();

                    treeView.addTarget(this);
                    return treeView;
                },
            },
        }
    });
});
