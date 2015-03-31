/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryconfirmedlistview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery confirmed list view.
     *
     * @module ez-universaldiscoveryconfirmedlistview
     */
    Y.namespace('eZ');

    var MAX_MINI_DISPLAY = 3,
        IS_FULL_LIST_VISIBLE = 'is-full-list-visible';

    /**
     * The universal discovery confirmed list view. It displays the contents
     * choosen by the user in the universal discovery widget. By default, only
     * the last 3 contents are really displayed.
     *
     * @namespace eZ
     * @class UniversalDiscoveryConfirmedListView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryConfirmedListView = Y.Base.create('universalDiscoveryConfirmedListView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-ud-mini-display-list': {
                'tap': '_toggleFullList'
            },
            '.ez-ud-full-list-close': {
                'tap': '_hideFullList',
            },
        },

        initializer: function () {
            this.after('confirmedListChange', function () {
                this.render();
            });
            this.after('showFullListChange', this._uiHandleFullList);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                hasConfirmedList: this._hasConfirmedList(),
                confirmedList: this._jsonifyList(this.get('confirmedList')),
                miniDisplayList: this._getMiniDisplayList(),
                remainingCount: this._getRemainingCount(),
            }));
            return this;
        },

        /**
         * Show or hide the full list depending on the `showFullList` flag
         *
         * @method _uiHandleFullList
         * @protected
         */
        _uiHandleFullList: function () {
            var container = this.get('container');

            if ( this.get('showFullList') ) {
                container.addClass(IS_FULL_LIST_VISIBLE);
            } else {
                container.removeClass(IS_FULL_LIST_VISIBLE);
            }
        },

        /**
         * Toggles the `showFullList` flag
         *
         * @method _toggleFullList
         * @protected
         */
        _toggleFullList: function () {
            this._set('showFullList', !this.get('showFullList'));
        },

        /**
         * Tap event handler on the close full list link
         *
         * @method _hideFullList
         * @param {EventFacade} e
         * @protected
         */
        _hideFullList: function (e) {
            e.preventDefault();
            this._set('showFullList', false);
        },

        /**
         * Returns the number of content in the content list that won't be
         * displayed in the *mini list*
         *
         * @method _getRemainingCount
         * @protected
         * @return {Number}
         */
        _getRemainingCount: function () {
            if ( !this._hasConfirmedList() || this.get('confirmedList').length < MAX_MINI_DISPLAY ) {
                return 0;
            }
            return this.get('confirmedList').length - MAX_MINI_DISPLAY;
        },

        /**
         * Extracts a portion of the content list to display before the *+X
         * more* message. If the confirmed list is not filled, it returns false.
         *
         * @method _getMiniDisplayList
         * @protected
         * @return {Array|false}
         */
        _getMiniDisplayList: function () {
            var list,
                hasConfirmedList = this._hasConfirmedList();

            if ( hasConfirmedList ) {
                list = this.get('confirmedList').concat().reverse();
                return this._jsonifyList(list.slice(0, MAX_MINI_DISPLAY));
            }
            return false;
        },

        /**
         * Transforms the given confirmed list so that it's suitable to be used
         * in the template, ie the models are replaced by the result of the
         * `toJSON` method
         *
         * @method _jsonifyList
         * @protected
         * @param {Array} list
         */
        _jsonifyList: function (list) {
            var res = [];

            Y.Array.each(list, function (struct, i) {
                res[i] = {
                    content: struct.content.toJSON(),
                    location: struct.location.toJSON(),
                    contentType: struct.contentType.toJSON(),
                };
            });
            return res;
        },

        /**
         * Checks whether the confirmed list is filled or not
         *
         * @method _hasConfirmedList
         * @protected
         * @return {Boolean}
         */
        _hasConfirmedList: function () {
            return !!this.get('confirmedList');
        },

        /**
         * Custom reset implementation to make sure to also reset the
         * read only `showFullList` attribute.
         *
         * @method reset
         * @param {String} name
         */
        reset: function (name) {
            if ( name === 'showFullList' ) {
                this._set('showFullList', false);
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
        },
    }, {
        ATTRS: {
            /**
             * The current confirmed list. It's an array containing one or
             * several content structure (ie an object with a content, a
             * location and a content type models) or null.
             *
             * @attribute confirmedList
             * @type {Array|Null}
             */
            confirmedList: {
                value: null,
            },

            /**
             * Flag indicating whether the full list should be shown
             *
             * @attribute showFullList
             * @type Boolean
             * @readOnly
             */
            showFullList: {
                readOnly: true,
                value: false,
            },
        },
    });
});
