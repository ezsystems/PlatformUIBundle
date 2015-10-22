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
        IS_EMPTY = 'is-empty',
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
                'tap': function (e) {
                    e.preventDefault();
                    this._hideFullList();
                }
            },
            '.ez-ud-full-list-item-remove': {
                'tap': '_confirmRemoval',
            }
        },

        initializer: function () {
            this.after('confirmedListChange', function (e) {
                if ( this._hasConfirmedList() ) {
                    this.render();
                } else {
                    // do not rerender the view if it's getting empty so that
                    // the hiding transition can be seen
                    this._uiHandleEmptyClass();
                    this._hideFullList();
                }
            });
            this.after('showFullListChange', this._uiHandleFullList);
            this.after('trackOutsideEventsChange', this._handleClickOutsideEventHandler);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                confirmedList: this._jsonifyList(this.get('confirmedList')).reverse(),
                miniDisplayList: this._getMiniDisplayList(),
                remainingCount: this._getRemainingCount(),
            }));
            this._uiHandleEmptyClass();
            return this;
        },

        /**
         * tap event handler on the remove button.
         *
         * @method _removeContent
         * @param {EventFacade} e
         * @protected
         */
        _confirmRemoval: function (e) {
            var contentId = e.target.getAttribute('data-content-id');

            e.preventDefault();
            this._set('trackOutsideEvents', false);
            this.fire('confirmBoxOpen', {
                config: {
                    title: "Are you sure you want to remove this item?",
                    confirmHandler: Y.bind(function () {
                        this._removeContent(contentId);
                        this._set('trackOutsideEvents', true);
                    }, this),
                    cancelHandler: Y.bind(function () {
                        this._set('trackOutsideEvents', true);
                    }, this),
                },
            });
        },

        /**
         * Fires the unselectContent to remove the content from the universal
         * discovery selection.
         *
         * @method _removeContent
         * @param {String} contentId
         * @protected
         */
        _removeContent: function (contentId) {
            /**
             * Fired to unselect a content in universal discovery widget
             *
             * @event unselectContent
             * @param {String} contentId
             */
            this.fire('unselectContent', {
                contentId: contentId
            });
        },

        /**
         * Adds or removes the `is-empty` class on the container depending on
         * the confirmedList content
         *
         * @method _uiHandleEmptyClass
         * @protected
         */
        _uiHandleEmptyClass: function () {
            var container = this.get('container');

            if ( this._hasConfirmedList() ) {
                container.removeClass(IS_EMPTY);
            } else {
                container.addClass(IS_EMPTY);
            }
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
                this._set('trackOutsideEvents', true);
            } else {
                container.removeClass(IS_FULL_LIST_VISIBLE);
                this._set('trackOutsideEvents', false);
            }
        },

        /**
         * `trackOutsideEventsChange` event handler.
         * Adds or removes the click outside event handler depending on the
         * `trackOutsideEvents` attribute value.
         *
         * @method _handleClickOutsideEventHandler
         * @protected
         */
        _handleClickOutsideEventHandler: function () {
            if ( this.get('trackOutsideEvents') ) {
                this._addClickOutsideHandler();
            } else {
                this._removeClickOutsideHandler();
            }
        },

        /**
         * Adds the click outside event handler
         *
         * @method _addClickOutsideHandler
         * @protected
         */
        _addClickOutsideHandler: function () {
            this._clickOutsideHandler = this.get('container').on('clickoutside', Y.bind(function (e) {
                // This condition is workaround to make sure any tap on the
                // confirmbox does not hide the full list.
                if ( !e.target.ancestor('.ez-confirmbox-container', true) ) {
                    this._hideFullList();
                }
            }, this));
        },

        /**
         * Removes the click outside event handler
         *
         * @method _removeClickOutsideHandler
         * @protected
         */
        _removeClickOutsideHandler: function () {
            if ( this._clickOutsideHandler ) {
                this._clickOutsideHandler.detach();
                this._clickOutsideHandler = null;
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
         * Hides the full list
         *
         * @method _hideFullList
         * @protected
         */
        _hideFullList: function () {
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
                    contentInfo: struct.contentInfo.toJSON(),
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
             * several content structure (ie an object with a contentInfo, a
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

            /**
             * Flag indicating whether the confirmed list should track the
             * outside events (click).
             *
             * @attribute trackOutsideEvents
             * @readOnly
             */
            trackOutsideEvents: {
                readOnly: true,
            }
        },
    });
});
