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

    var MAX_MINI_DISPLAY = 3;

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

        initializer: function () {
            this.after('confirmedListChange', function () {
                this.render();
            });
        },

        render: function () {
            this.get('container').setHTML(this.template({
                hasConfirmedList: this._hasConfirmedList(),
                miniDisplayList: this._getMiniDisplayList(),
                remainingCount: this._getRemainingCount(),
            }));
            return this;
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
            Y.Array.each(list, function (struct, i) {
                list[i] = {
                    content: struct.content.toJSON(),
                    location: struct.location.toJSON(),
                    contentType: struct.contentType.toJSON(),
                };
            });
            return list;
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
        },
    });
});
