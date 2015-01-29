/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-tabs', function (Y) {
    "use strict";
    /**
     * The tabs extension
     *
     * @module ez-tabs
     */
    Y.namespace('eZ');

    var TAB_IS_SELECTED = 'is-tab-selected',
        /**
         * Extension providing the `_selectTab` method which allows to handle a
         * tab based interface. By default, it sets a tap event handler
         * on '.ez-tabs .ez-tabs-label a' to switch from a tab to another.
         *
         * @namespace eZ
         * @class Tabs
         * @extensionfor Y.View
         */
        Tabs = function () {},
        _events = {
            '.ez-tabs .ez-tabs-label a': {
                'tap': '_uiTab'
            }
        };

    Tabs.prototype.initializer = function () {
        this.events = Y.merge(_events, this.events || {});
    };

    /**
     * tap event handler on a tab label
     *
     * @method _uiTab
     * @protected
     * @param {Object} e tap event facade
     */
    Tabs.prototype._uiTab = function (e) {
        e.preventDefault();
        this._selectTab(
            e.currentTarget.ancestor('.ez-tabs-label'),
            e.currentTarget.getAttribute('href'),
            this.get('container')
        );
    };

    /**
     * Selects the `tabLabel` and add the tab selected class on the `targetId`
     * element inside container while removing it from any other element
     *
     * @method _selectTab
     * @protected
     * @param {Node} tabLabel
     * @param {String} targetId
     * @param {Node} container
     */
    Tabs.prototype._selectTab = function (tabLabel, targetId, container) {
        if ( tabLabel.hasClass(TAB_IS_SELECTED) ) {
            return;
        }

        container.all('.' + TAB_IS_SELECTED).removeClass(TAB_IS_SELECTED);
        container.one(targetId).addClass(TAB_IS_SELECTED);
        tabLabel.addClass(TAB_IS_SELECTED);
    };

    Y.eZ.Tabs = Tabs;
});
