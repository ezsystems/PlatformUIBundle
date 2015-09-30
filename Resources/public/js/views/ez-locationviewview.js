/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewview', function (Y) {
    "use strict";
    /**
     * Provides the Location view View class
     *
     * @module ez-locationviewview
     */
    Y.namespace('eZ');

    var MINIMIZE_ACTION_BAR_CLASS = 'is-actionbar-minimized';

    /**
     * The location view view
     *
     * @namespace eZ
     * @class LocationViewView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LocationViewView = Y.Base.create('locationViewView', Y.eZ.TemplateBasedView, [Y.eZ.Tabs], {
        initializer: function () {
            this.on('*:minimizeActionBarAction', this._handleMinimizeActionBar);
            this.after('changeTab', this._syncSelectedTab);
            this.after('selectedTabChange', this._syncTabSelectedAttr);

            this.after('activeChange', function () {
                Y.Array.each(this.get('tabs'), function (t) {
                    t.set('active', this.get('active'));
                }, this);
            });
        },

        /**
         * Event handler for the minimizeActionBarAction event
         *
         * @protected
         * @method _handleMinimizeActionBar
         */
        _handleMinimizeActionBar: function () {
            this.get('container').toggleClass(MINIMIZE_ACTION_BAR_CLASS);
        },

        /**
         * Converts each location in the path to a plain object representation
         *
         * @method _pathToJSON
         * @private
         * @return Array
         */
        _pathToJSON: function () {
            return Y.Array.map(this.get('path'), function (location) {
                return location.toJSON();
            });
        },

        /**
         * Renders the location view
         *
         * @method render
         * @return {eZ.LocationViewView} the view itself
         */
        render: function () {
            var container = this.get('container'),
                subitemList = this.get('subitemList');

            container.setHTML(this.template({
                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                tabs: this._getTabsList(),
                path: this._pathToJSON()
            }));

            container.one('.ez-actionbar-container').append(
                this.get('actionBar').render().get('container')
            );
            this._renderTabViews();
            if ( subitemList ) {
                container.one('.ez-subitemlist-container').append(
                    subitemList.render().get('container')
                );
            }

            this._uiSetMinHeight();
            return this;
        },

        /**
         * Renders the tab views in their container.
         *
         * @method _renderTabViews
         * @protected
         */
        _renderTabViews: function () {
            var container = this.get('container');

            Y.Array.each(this.get('tabs'), function (tab) {
                container.one('#ez-tabs-' + tab.get('identifier')).append(
                    tab.render().get('container')
                );
            });
        },

        /**
         * Returns the tabs list suitable for the template. Each element in the
         * returned array is an object containing the title, the identifier and
         * whether the tab is selected.
         *
         * @method _getTabsList
         * @protected
         * @return {Array}
         */
        _getTabsList: function () {
            var tabs = [];

            Y.Array.each(this.get('tabs'), function (tab) {
                tabs.push({
                    title: tab.get('title'),
                    identifier: tab.get('identifier'),
                    selected: tab.get('identifier') === this.get('selectedTab'),
                });
            }, this);
            return tabs;
        },

        /**
         * `changeTab` event handler. It synchronizes the `selectedTab`
         * attribute.
         *
         * @method _syncSelectedTab
         * @protected
         * @param {EventFacade} e the changeTab event facade
         */
        _syncSelectedTab: function (e) {
            this._set('selectedTab', e.tabLabelNode.getAttribute('data-tab-identifier'));
        },

        /**
         * `selectedTabChange` event handler. It makes sure the the `selectedTab`
         * attribute and the tab view's `selected` attribute are in sync.
         *
         * @method _syncTabSelectedAttr
         * @protected
         */
        _syncTabSelectedAttr: function () {
            Y.Array.each(this.get('tabs'), function (tab) {
                tab.set('selected', this.get('selectedTab') === tab.get('identifier'));
            }, this);
        },

        /**
         * Returns the title of the page when the location view is the active
         * view.
         *
         * @method getTitle
         * @return String
         */
        getTitle: function () {
            var title = this.get('content').get('name');

            return Y.Array.reduce(this.get('path'), title, function (title, val) {
                return title + ' / ' + val.get('contentInfo').get('name');
            });
        },

        /**
         * Sets the minimum height of the view
         *
         * @private
         * @method _uiSetMinHeight
         */
        _uiSetMinHeight: function () {
            var container = this.get('container');

            container.one('.ez-locationview-content').setStyle(
                'minHeight', container.get('winHeight') + 'px'
            );
        },

        /**
         * Adds a tabView to the list of tabs.
         *
         * @method addTabView
         * @param {eZ.LocationViewTabView} tabView
         */
        addTabView: function (tabView) {
            var tabs = this.get('tabs');

            tabs.push(tabView);
            tabView.addTarget(this);
            tabs.sort(function (a, b) {
                return b.get('priority') - a.get('priority');
            });
        },

        /**
         * Removes a tab from its identifier. When found, the location view is
         * removed from the bubble targets list of the tabView.
         *
         * @method removeTabView
         * @param {String} identifier
         * @return {eZ.LocationViewTabView|Null} the removed tab view or null
         */
        removeTabView: function (identifier) {
            var removed = null;

            this._set('tabs', Y.Array.reject(this.get('tabs'), function (tab) {
                if ( tab.get('identifier') === identifier ) {
                    tab.removeTarget(this);
                    removed = tab;
                    return true;
                }
            }, this));
            return removed;
        },

        destructor: function () {
            var bar = this.get('actionBar'),
                subitemList = this.get('subitemList');

            bar.removeTarget(this);
            bar.destroy();
            Y.Array.each(this.get('tabs'), function (tab) {
                tab.removeTarget(this);
                tab.destroy();
            });
            if ( subitemList ) {
                subitemList.removeTarget(this);
                subitemList.destroy();
            }
        }
    }, {
        ATTRS: {
            /**
             * The location being rendered
             *
             * @attribute location
             * @type Y.eZ.Location
             * @writeOnce
             */
            location: {
                writeOnce: "initOnly",
            },

            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             * @writeOnce
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             */
            contentType: {
                writeOnce: "initOnly",
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location.
             *
             * @attribute path
             * @type Array
             * @writeOnce
             */
            path: {
                writeOnce: "initOnly",
            },

            /**
             * Language code of language currently active for the current location
             *
             * @attribute languageCode
             * @type String
             */
            languageCode: {},

            /**
             * The action bar instance, by default an instance {{#crossLink
             * "eZ.ActionBarView"}}eZ.ActionBarView{{/crossLink}}
             *
             * @attribute actionBar
             * @type eZ.BarView
             */
            actionBar: {
                valueFn: function () {
                    return new Y.eZ.ActionBarView({
                        location: this.get('location'),
                        content: this.get('content'),
                        contentType: this.get('contentType'),
                        bubbleTargets: this,
                    });
                }
            },

            /**
             * The list of the Location View tab Views.
             * Do NOT change this attribute directly, use addTabView or
             * removeTabView to handle the tabs list.
             *
             * @attribute tabs
             * @type {Array} of {eZ.LocationViewTabView}
             * @writeOnce
             */
            tabs: {
                valueFn: function () {
                    return [
                        new Y.eZ.LocationViewViewTabView({
                            content: this.get('content'),
                            location: this.get('location'),
                            contentType: this.get('contentType'),
                            config: this.get('config'),
                            languageCode: this.get('languageCode'),
                            priority: 1000,
                            selected: true,
                            bubbleTargets: this,
                        }),
                        new Y.eZ.LocationViewDetailsTabView({
                            content: this.get('content'),
                            location: this.get('location'),
                            config: this.get('config'),
                            priority: 2000,
                            selected: false,
                            bubbleTargets: this,
                        }),
                        new Y.eZ.LocationViewLocationsTabView({
                            content: this.get('content'),
                            location: this.get('location'),
                            config: this.get('config'),
                            priority: 3000,
                            selected: false,
                            bubbleTargets: this,
                        }),
                        new Y.eZ.LocationViewRelationsTabView({
                            content: this.get('content'),
                            contentType: this.get('contentType'),
                            config: this.get('config'),
                            priority: 4000,
                            selected: false,
                            bubbleTargets: this,
                        }),
                    ];
                },
                writeOnce: 'initOnly',
            },

            /**
             * The subitem list view or null if the content (type) is not
             * configured to be a container.
             *
             * @attribute subitemList
             * @type {eZ.SubitemListView|Null}
             * @writeOnce
             */
            subitemList: {
                valueFn: function () {
                    var contentType = this.get('contentType');

                    if ( contentType && contentType.get('isContainer') ) {
                        return new Y.eZ.SubitemListView({
                            location: this.get('location'),
                            config: this.get('config'),
                            bubbleTargets: this,
                        });
                    }
                    return null;
                },
                writeOnce: 'initOnly',
            },

            /**
             * Stores the identifier of the selected tab.
             *
             * @attribute selectedTab
             * @type {String}
             * @readOnly
             */
            selectedTab: {
                value: "view",
                readOnly: true,
            }
        }
    });
});
