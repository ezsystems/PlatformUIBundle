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

        /**
         * Fired when changing the visible tab. The default function changes the
         * DOM so that the new tab panel appears and the associated tab label is
         * highlighted. The behavior can be prevented.
         *
         * @event changeTab
         * @param {Node} tabLabelNode
         * @param {String} tabId
         * @param {Node} container
         */
        this.publish('changeTab', {
            bubbles: true,
            emitFacade: true,
            preventable: true,
            defaultFn: function (e) {
                this._selectTab(e.tabLabelNode, e.tabId, e.tabContainerNode);
            },
        });
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
        this.fire('changeTab', {
            tabLabelNode: this._getTabLabel(e.currentTarget),
            tabId: e.currentTarget.getAttribute('href'),
            tabContainerNode: this.get('container'),
        });
    };

    /**
     * Returns the tab label element from the corresponding link
     *
     * @protected
     * @method _getTabLabel
     * @param {Node} linkNode
     * @return {Node}
     */
    Tabs.prototype._getTabLabel = function (linkNode) {
        return linkNode.ancestor('.ez-tabs-label');
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
