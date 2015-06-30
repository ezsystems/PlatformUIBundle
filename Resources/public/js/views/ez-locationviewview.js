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
         * Converts each location and content model in the path to a plain
         * object representation
         *
         * @method _pathToJSON
         * @private
         * @return Array
         */
        _pathToJSON: function () {
            var path = [];

            Y.Array.each(this.get('path'), function (struct, key) {
                path[key] = {
                    location: struct.location.toJSON(),
                    content: struct.content.toJSON()
                };
            });
            return path;
        },

        /**
         * Renders the location view
         *
         * @method render
         * @return {eZ.LocationViewView} the view itself
         */
        render: function () {
            var container = this.get('container');

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
         * Returns the title of the page when the location view is the active
         * view.
         *
         * @method getTitle
         * @return String
         */
        getTitle: function () {
            var title = this.get('content').get('name');

            return Y.Array.reduce(this.get('path'), title, function (title, val) {
                return title + ' / ' + val.content.get('name');
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

        destructor: function () {
            var bar = this.get('actionBar');

            bar.removeTarget(this);
            bar.destroy();
            Y.Array.each(this.get('tabs'), function (tab) {
                tab.removeTarget(this);
                tab.destroy();
            });
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
             * The config
             *
             * @attribute config
             * @type Mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },

            /**
             * The path from the root location to the current location. Each
             * entry of the path consists of the location and its content under
             * the `location` and `content` keys.
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
             * @writeOnce
             */
            languageCode: {
                writeOnce: "initOnly",
                value: 'eng-GB'
            },

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
                        content: this.get('content'),
                        contentType: this.get('contentType'),
                        bubbleTargets: this,
                    });
                }
            },

            /**
             * The list of the Location View tab Views
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
                            bubbleTargets: this,
                        }),
                    ];
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
