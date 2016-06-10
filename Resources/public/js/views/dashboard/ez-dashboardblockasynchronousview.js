/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockasynchronousview', function (Y) {
    'use strict';

    /**
     * Provides the All Content Dashboard Block View class
     *
     * @module ez-dashboardblockallcontentview
     */
    Y.namespace('eZ');

    var CLASS_LOADING = 'is-loading',
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-block-row',
        SELECTOR_CONTENT = '.ez-block-content',
        EVENTS = {};

    EVENTS[SELECTOR_ROW] = {tap: '_uiShowRowOptions'};

    /**
     * The asynchronous dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockAsynchronousView
     * @constructor
     * @extends eZ.DashboardBlockBaseView
     */
    Y.eZ.DashboardBlockAsynchronousView = Y.Base.create('dashboardBlockAsynchronousView', Y.eZ.DashboardBlockBaseView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadDataEvent;
            this._watchAttribute = 'items';
            /**
             * Stores the click outside event handler
             *
             * @property _clickOutsideHandler
             * @type {Object}
             * @protected
             */
            this._clickOutsideHandler = null;
            this.events = Y.merge(this.events, EVENTS);

            this.get('container')
                .addClass(this._generateViewClassName(Y.eZ.DashboardBlockBaseView.NAME))
                .addClass(this._generateViewClassName(Y.eZ.DashboardBlockAsynchronousView.NAME))
                .addClass(CLASS_LOADING);

            this.after('itemsChange', this._uiEndLoading);
        },

        render: function () {
            var items = this.get('items').map(this._getTemplateItem);

            this.get('container').setHTML(this.template({
                items: items,
                loadingError: this.get('loadingError'),
            }));

            return this;
        },

        /**
         * Shows the row options
         *
         * @method _uiShowOptions
         * @protected
         * @param event {Object} event facade
         */
        _uiShowRowOptions: function (event) {
            this._uiHideRowOptions();

            event.currentTarget.addClass(CLASS_ROW_SELECTED);

            this._clickOutsideHandler = this.get('container').one(SELECTOR_CONTENT).on('clickoutside', Y.bind(this._uiHideRowOptions, this));
        },

        /**
         * Clears the click outside handler
         *
         * @method _clearClickOutsideHandler
         * @protected
         */
        _clearClickOutsideHandler: function () {
            if (this._clickOutsideHandler) {
                this._clickOutsideHandler.detach();
            }
        },

        /**
         * Hides the row options
         *
         * @method _uiHideOptions
         * @protected
         */
        _uiHideRowOptions: function () {
            this.get('container').all(SELECTOR_ROW).removeClass(CLASS_ROW_SELECTED);

            this._clearClickOutsideHandler();
        },

        /**
         * Removes the loading state of the UI
         *
         * @method _uiEndLoading
         * @protected
         */
        _uiEndLoading: function () {
            this.get('container').removeClass(CLASS_LOADING);
        },

        /**
         * Fires an event to request the data to display.
         * This method must reimplemented when extending eZ.DashboardBlockAsynchronousView.
         *
         * @method _fireLoadDataEvent
         * @protected
         * @param event {Object} event facade
         */
        _fireLoadDataEvent: function (event) {},

        /**
         * Gets item template data.
         * This method must reimplemented when extending eZ.DashboardBlockAsynchronousView.
         *
         * @method _getTemplateItem
         * @protected
         * @param item {Any} item data
         */
        _getTemplateItem: function (item) {
            return item;
        },

        destructor: function () {
            this._clearClickOutsideHandler();
        }
    }, {
        ATTRS: {
            /**
             * The block content items
             *
             * @attribute items
             * @type Array
             * @default []
             */
            items: {
                value: []
            }
        }
    });
});
