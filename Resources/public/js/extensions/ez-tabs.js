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
         * tab based interface.
         *
         * @namespace eZ
         * @class Tabs
         * @extensionfor Y.View
         */
        Tabs = function () {};

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
