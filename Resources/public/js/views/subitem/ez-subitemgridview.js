/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgridview', function (Y) {
    "use strict";
    /**
     * Provides the subitem grid view.
     *
     * @module ez-subitemgridview
     */
    Y.namespace('eZ');

    function logDeprecatedWarning(what, replace) {
        console.log('[DEPRECATED] `' + what + '` is deprecated');
        console.log('[DEPRECATED] it will be removed from PlatformUI 2.0');
        console.log('[DEPRECATED] Please use `' + replace + '` instead');
    }

    /**
     * The subitem grid view.
     *
     * @namespace eZ
     * @class SubitemGridView
     * @constructor
     * @extends eZ.AsynchronousSubitemView
     */
    Y.eZ.SubitemGridView = Y.Base.create('subitemGridView', Y.eZ.AsynchronousSubitemView, [], {
        initializer: function () {
            this._set('identifier', 'grid');
            this._set('name', 'Grid view');

            this._ItemView = Y.eZ.SubitemGridItemView;
            this._itemViewBaseConfig = {};
        },

        /**
         * Sets the UI in the loading the state
         *
         * @protected
         * @deprecated
         * @method _uiLoading
         */
        _uiLoading: function () {
            logDeprecatedWarning('_uiLoading', '_uiPageLoading');
            this._uiPageLoading();
        },

        /**
         * Removes the loading state of the UI
         *
         * @method _uiEndLoading
         * @deprecated
         * @protected
         */
        _uiEndLoading: function () {
            logDeprecatedWarning('_uiEndLoading', '_uiPageEndLoading');
            this._uiPageEndLoading();
        },

        render: function () {
            var subitemCount = this._getChildCount();

            if ( !this.get('items') ) {
                this.get('container').setHTML(this.template({
                    limit: this.get('limit'),
                    subitemCount: subitemCount,
                    displayCount: Math.min(this.get('limit'), subitemCount),
                }));
            }

            return this;
        },

        /**
         * Appends a rendred grid item view for the last loaded subitem.
         *
         * @method _appendGridItem
         * @deprecated
         * @protected
         * @param {Array} newSubitems
         */
        _appendGridItem: function (newSubitems) {
            logDeprecatedWarning('_appendGridItem', '_appendItems');
            this._appendItems(newSubitems);
            this._gridItemViews = this._itemViews;
        },

        /**
         * Counts the number of loaded items.
         *
         * @method _countLoadedSubitems
         * @deprecated
         * @protected
         * @return {Number}
         */
        _countLoadedSubitems: function () {
            logDeprecatedWarning('_countLoadedSubitems', '_countLoadedItems');
            return this._countLoadedItems();
        },

    }, {
        ATTRS: {
            /**
             * The subitems list. This attribute is deprecated, it will be
             * removed in PlatformUI 2.0. Use `items` instead.
             *
             * @attribute subitems
             * @deprecated
             * @type Array of {Object} array containing location structs
             */
            subitems: {
                setter: function (value, attr, info) {
                    this.set('items', value);
                    return this.get('items');
                },
                getter: function () {
                    return this.get('items');
                },
            },
        }
    });
});
