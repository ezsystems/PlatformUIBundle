/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistmoreview', function (Y) {
    "use strict";
    /**
     * Provides the subitem list view paginated with a *Load More* button
     *
     * @module ez-subitemlistmoreview
     */
    Y.namespace('eZ');

    /**
     * The subitem list view paginated with a *Load More* button
     *
     * @namespace eZ
     * @class SubitemListMoreView
     * @constructor
     * @extends eZ.AsynchronousSubitemView
     */
    Y.eZ.SubitemListMoreView = Y.Base.create('subitemListMoreView', Y.eZ.AsynchronousSubitemView, [], {
        initializer: function () {
            this._set('identifier', 'listmore');
            this._set('name', 'List view');

            this._ItemView = this.get('itemViewConstructor');
            this._itemViewBaseConfig = {
                displayedProperties: this.get('displayedProperties'),
            };

            this.after('*:editingPriorityChange', function (e) {
                if ( e.newVal ) {
                    this._lockPriorityEdit(e.target);
                } else {
                    this._unlockPriorityEdit();
                }
            });

            this.on('*:updatePriority', function (e) {
                if ( this._isSortedByPriority() ) {
                    this._set('loading', true);
                    this._disableLoadMore();
                    e.location.onceAfter('priorityChange', Y.bind(this._refresh, this));
                }
            });
        },

        /**
         * Returns whether the subitems should be sorted by priority.
         *
         * @method _isSortedByPriority
         * @private
         * @return {Boolean}
         */
        _isSortedByPriority: function () {
            return this.get('location').get('sortField') === 'PRIORITY';
        },

        /**
         * Restores the `canEditPriority` attribute so that the priority can be
         * editing in all views
         *
         * @method _unlockPriorityEdit
         * @protected
         */
        _unlockPriorityEdit: function () {
            this._itemViews.forEach(function (itemView) {
                itemView.set('canEditPriority', true);
            });
        },

        /**
         * Makes sure only one priority can be edited at a time.
         *
         * @protected
         * @method _lockPriorityEdit
         * @param {View} view the view where the priority occurs
         */
        _lockPriorityEdit: function (view) {
            this._itemViews.forEach(function (itemView) {
                itemView.set('canEditPriority', (itemView === view));
            });
        },

        render: function () {
            if ( !this.get('items') ) {
                this.get('container').setHTML(this.template({
                    location: this.get('location').toJSON(),
                    columns: this._getColumns(),
                }));
            }
            return this;
        },

        /**
         * Returns an array of objects describing the columns to add to the
         * list. Each object contains an `identifier` and a `name`.
         *
         * @method _getColumns
         * @protected
         * @return Array
         */
        _getColumns: function () {
            return this.get('displayedProperties').map(function (identifier) {
                return {
                    name: this.get('propertyNames')[identifier],
                    identifier: identifier,
                };
            }, this);
        },
    }, {
        ATTRS: {
            /**
             * The properties to display
             *
             * @attribute displayedProperties
             * @type Array
             */
            displayedProperties: {
                value: ['name', 'lastModificationDate', 'contentType', 'priority', 'translations'],
            },

            /**
             * A key value object to store the human readable names of the
             * columns.
             *
             * @attribute propertyNames
             * @type {Object}
             */
            propertyNames: {
                value: {
                    'name': 'Name',
                    'lastModificationDate': 'Modified',
                    'contentType': 'Content type',
                    'priority': 'Priority',
                    'translations': 'Translations',
                }
            },

            /**
             * The constructor function to use to instance the item view
             * instances.
             *
             * @attribute itemViewConstructor
             * @type {Function}
             * @default {Y.eZ.SubitemListItemView}
             */
            itemViewConstructor: {
                valueFn: function () {
                    return Y.eZ.SubitemListItemView;
                },
            },
        }
    });
});
