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

    var COLUMN_SORT_ASC_CLASS = 'ez-subitem-column-sortable-asc',
        COLUMN_SORT_DESC_CLASS = 'ez-subitem-column-sortable-desc',
        events = {
            '.ez-subitem-column-sortable': {
                'tap': '_toggleSorting',
            },
        };

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
            this._addDOMEventHandlers(events);
            this._set('identifier', 'listmore');
            this._set('name', Y.eZ.trans('list.view', {}, 'subitem'));

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
                    e.location.onceAfter('priorityChange', Y.bind(this.refresh, this));
                }
            });

            this.after('activeChange', this._addSortOrderClass);
            this.after('sortConditionChange', this._addSortOrderClass);
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

        /**
         * Resets the selected status from columns
         *
         * @protected
         * @method _resetSortOrderClass
         */
        _resetSortOrderClass: function() {
            var columns = this.get('container').all('.ez-subitem-column-sortable');

            columns.each( function (column) {
                column.removeClass(COLUMN_SORT_ASC_CLASS);
                column.removeClass(COLUMN_SORT_DESC_CLASS);
            });
        },

        /**
         * Adds the sort class according to the `sortCondition` attribute
         *
         * @protected
         * @method _addSortOrderClass
         */
        _addSortOrderClass: function () {
            var sortCondition = this.get('sortCondition'),
                property = this._getPropertyBySortField(sortCondition.sortField),
                column = this.get('container').one('.ez-subitem-' + property + '-column');

            this._resetSortOrderClass();

            if (column) {
                if (sortCondition.sortOrder === 'ASC') {
                    column.addClass(COLUMN_SORT_ASC_CLASS);
                } else {
                    column.addClass(COLUMN_SORT_DESC_CLASS);
                }
            }
        },

        /**
         * Toggles the sorting of columns
         * First click is asc, second click is desc.
         *
         * @protected
         * @method _toggleSorting
         * @param {EventFacade} e
         */
        _toggleSorting: function (e) {
            var property = e.target.getAttribute("data-column-identifier"),
                sortField = this.get('availableProperties')[property].sortField,
                sortOrder = 'ASC';

            if (e.target.hasClass(COLUMN_SORT_ASC_CLASS)) {
                sortOrder = 'DESC';
            }

            this.set('sortCondition', {
                sortField: sortField,
                sortOrder: sortOrder,
            });
            this.refresh();
        },

        /**
         * Retrives the property for a given sortField
         *
         * @protected
         * @method _getPropertyBySortField
         * @param {String} sortField
         * @return {String} property
         */
        _getPropertyBySortField: function (sortField) {
            var property;

            Y.Object.some(this.get('availableProperties'), function (propertyData, propertyName) {
                if (propertyData.sortField == sortField) {
                    property = propertyName;
                    return true;
                }
            });

            return property;
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
                    sortable: this.get('availableProperties')[identifier].sortable,
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
             * Lists the available properties to display.
             * Each entry in this object is an object with:
             *
             * * `sortable`: a boolean stating if the property can be sorted.
             * * `sortField`: a string with the sortField corresponding to the property
             *
             * @attribute availableProperties
             * @type Object
             * @readOnly
             */
            availableProperties: {
                readOnly: true,
                value: {
                    'name': {
                        'sortable': true,
                        'sortField': 'NAME',
                    },
                    'lastModificationDate': {
                        'sortable': true,
                        'sortField': 'MODIFIED',
                    },
                    'contentType': {
                        'sortable': false,
                    },
                    'priority': {
                        'sortable': true,
                        'sortField': 'PRIORITY',
                    },
                    'translations': {
                        'sortable': false,
                    },
                },
            },

            /**
             * A key value object to store the human readable names of the
             * columns.
             *
             * @attribute propertyNames
             * @type {Object}
             */
            propertyNames: {
                valueFn: function () {
                    return {
                        'name': Y.eZ.trans('name', {}, 'subitem'),
                        'lastModificationDate': Y.eZ.trans('modified', {}, 'subitem'),
                        'contentType': Y.eZ.trans('content.type', {}, 'subitem'),
                        'priority': Y.eZ.trans('priority', {}, 'subitem'),
                        'translations': Y.eZ.trans('translations', {}, 'subitem'),
                    };
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
