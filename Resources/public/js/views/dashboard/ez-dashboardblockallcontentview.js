/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-dashboardblockallcontentview', function (Y) {
    'use strict';

    /**
     * Provides the All Content Dashboard Block View class
     *
     * @module ez-dashboardblockallcontentview
     */
    Y.namespace('eZ');

    var BLOCK_IDENTIFIER = 'all-content',
        CLASS_LOADING = 'is-loading',
        CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-allcontent-block-row',
        SELECTOR_CONTENT = '.ez-allcontent-block-content',
        EVENTS = {};

    EVENTS[SELECTOR_ROW] = {tap: '_uiShowRowOptions'};

    /**
     * The all content dashboard block view
     *
     * @namespace eZ
     * @class DashboardBlockAllContentView
     * @constructor
     * @extends eZ.DashboardBlockBaseView
     */
    Y.eZ.DashboardBlockAllContentView = Y.Base.create('dashboardBlockAllContentView', Y.eZ.DashboardBlockBaseView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireSearchEvent;
            /**
             * Stores the click outside event handler
             *
             * @property _clickOutsideHandler
             * @type {Object}
             * @protected
             */
            this._clickOutsideHandler = null;
            this.events = Y.merge(this.events, EVENTS);

            this._set('identifier', BLOCK_IDENTIFIER);
            this.get('container').addClass(this._generateViewClassName(Y.eZ.DashboardBlockBaseView.NAME));
        },

        /**
         * Renders the dashboard block view
         *
         * @method render
         * @return {eZ.DashboardBlockAllContentView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template()).addClass(CLASS_LOADING);

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
         * Makes request for data
         *
         * @method _fireSearchEvent
         * @protected
         * @param event {Object} event facade
         */
        _fireSearchEvent: function () {
            this.fire('contentSearch', {
                viewName: 'all-content',
                loadContentType: true,
                search: {
                    criteria: {SubtreeCriterion: this.get('rootLocation').get('pathString')},
                    /*
                     * @TODO sort items by modification date
                     * see https://jira.ez.no/browse/EZP-24998
                     *
                     * sortClauses: {DateModifiedClause: 'DESC'},
                     */
                    limit: 10
                },
                callback: Y.bind(this._renderContentRows, this)
            });
        },

        /**
         * Renders content rows in a block
         *
         * @method _renderContentRows
         * @protected
         * @param error {Boolean} is error?
         * @param list {Array} rows content data
         */
        _renderContentRows: function (error, list) {
            var rows = list.map(function (data) {
                return {
                    content: data.content.toJSON(),
                    contentType: data.contentType.get('names')[data.content.get('mainLanguageCode')]
                };
            });

            this.get('container').setHTML(this.template({rows: rows})).removeClass(CLASS_LOADING);
        },

        destructor: function () {
            this._clearClickOutsideHandler();
        }
    });
});
