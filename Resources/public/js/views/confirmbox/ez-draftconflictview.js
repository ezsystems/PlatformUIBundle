/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-draftconflictview', function (Y) {
    "use strict";

    Y.namespace('eZ');

    var CLASS_ROW_SELECTED = 'is-row-selected',
        SELECTOR_ROW = '.ez-draft-conflict-list-row',
        SELECTOR_CONTENT = '.ez-draft-conflict-list-content',
        EVENTS = {};

    EVENTS[SELECTOR_ROW] = {tap: '_uiShowRowOptions'};

    /**
     * The Draft conflict view.
     *
     * @namespace eZ
     * @class DraftConflictView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.DraftConflictView = Y.Base.create('draftConflictView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-draft-conflict-link': {
                'tap': '_confirmDraftEdition',
            },
        },

        initializer: function () {
            /**
             * Stores the click outside event handler
             *
             * @property _clickOutsideHandler
             * @type {Object}
             * @protected
             */
            this._clickOutsideHandler = null;
            this.events = Y.merge(this.events, EVENTS);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                drafts: this._prepareDraftForDisplay(),
                content: this.get('content').toJSON(),
                languageCode: this.get('languageCode'),
                contentType: this.get('contentType').toJSON(),
            }));
            return this;
        },

        /**
         * Shows the row options
         *
         * @method _uiShowRowOptions
         * @protected
         * @param event {Object} event facade
         */
        _uiShowRowOptions: function (event) {
            this._uiHideRowOptions();
            event.currentTarget.addClass(CLASS_ROW_SELECTED);

            this._clickOutsideHandler = this.get('container').one(SELECTOR_CONTENT).on(
                'clickoutside',
                Y.bind(this._uiHideRowOptions, this)
            );
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
         * @method _uiHideRowOptions
         * @protected
         */
        _uiHideRowOptions: function () {
            this.get('container').all(SELECTOR_ROW).removeClass(CLASS_ROW_SELECTED);

            this._clearClickOutsideHandler();
        },

        /**
         * Prepares the list of draft to be displayed
         *
         * @method _prepareDraftForDisplay
         * @protected
         * @return {Array} of JSONified eZ.VersionInfo
         */
        _prepareDraftForDisplay: function () {
            var drafts = [];

            this.get('drafts').forEach(function (draft) {
                drafts.push(draft.toJSON());
            });

            return drafts;
        },

        /**
         *  Fire the `confirm` event
         *
         * @protected
         * @method _confirmDraftEdition
         */
        _confirmDraftEdition: function (e) {
            e.preventDefault();

            /**
             * Fired to redirect to the draft edition
             * @event confirm
             */
            this.fire('confirm', {route: e.target.getAttribute('href')});
        },

    }, {
        ATTRS: {
            /**
             * Draft to be displayed in the conflict screen
             *
             * @attribute drafts
             * @default []
             * @type {Array}
             */
            drafts: {
                value: [],
            },

            /**
             * Content being displayed
             *
             * @attribute content
             * @default {}
             * @type {eZ.Content}
             */
            content: {
                value: {},
            },

            /**
             * languageCode currently in use
             *
             * @attribute languageCode
             * @default ""
             * @type {String}
             */
            languageCode: {
                value: "",
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @default {}
             * @type Y.eZ.ContentType
             */
            contentType: {
                value: {},
            },
        },
    });
});
