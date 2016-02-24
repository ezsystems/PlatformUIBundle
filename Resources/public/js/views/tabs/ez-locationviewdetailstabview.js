/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewdetailstabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View View Tab view class.
     *
     * @module ez-locationviewdetailstabview
     */
    Y.namespace('eZ');

    var SORTFIELD_NAME_DICTIONARY = {
            'PUBLISHED': 'Publication date',
            'PATH': 'Location path',
            'CLASS_IDENTIFIER': 'Content type identifier',
            'MODIFIED': 'Modification date',
            'SECTION': 'Section',
            'DEPTH': 'Location depth',
            'CLASS_NAME': 'Content type name',
            'PRIORITY': 'Priority',
            'NAME': 'Content name',
        },
        events = {
            '.ez-subitems-ordering-sort-type': {
                'change': '_setSortType',
            },
            '.ez-subitems-sorting-order': {
                'change': '_setSortingOrder',
            },
        };

    /**
     * The Location View View Details tab class.
     *
     * @namespace eZ
     * @class LocationViewDetailsTabView
     * @constructor
     * @extends eZ.LocationViewTabView
     */
    Y.eZ.LocationViewDetailsTabView = Y.Base.create('locationViewDetailsTabView', Y.eZ.LocationViewTabView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadUser;

            this.after(['creatorChange', 'ownerChange'], function (e) {
                this.render();
            });
            this.events = Y.merge(this.events, events);
            this._set('sortField', this.get('location').get('sortField'));
            this._set('sortOrder', this.get('location').get('sortOrder'));
            this.after(['sortFieldChange', 'sortOrderChange'], function (e) {
                this.fire('sortUpdate', {sortType: this.get('sortField'), sortOrder: this.get('sortOrder')});
            });
        },

        render: function () {
            var container = this.get('container'),
                content = this.get('content'),
                currentVersion = content.get('currentVersion'),
                translationsList = currentVersion.getTranslationsList(),
                creator = null,
                owner = null;

            if (this.get('creator')) {
                creator=this.get('creator').toJSON();
            }

            if (this.get('owner')) {
                owner=this.get('owner').toJSON();
            }

            container.setHTML(this.template({
                "content": content.toJSON(),
                "location": this.get('location').toJSON(),
                "currentVersion": currentVersion.toJSON(),
                "lastContributor": creator,
                "contentCreator": owner,
                "translationsList": translationsList,
                "languageCount": translationsList.length,
                "loadingError": this.get('loadingError'),
                "sortFields": this._getSortFields(),
                "isAscendingOrder": (this.get('sortOrder') === 'ASC')
            }));

            return this;
        },

        /**
         * Map the sortFields identifiers in objects.
         * These objects contain the identifier, the name of the sort field and a boolean to see if it's the current selected sortField.
         *
         * @method _getSortFields
         * @protected
         * @return {Array} contains objects with identifier, name and a boolean to see if selected
         */
        _getSortFields: function () {
            var sortFieldIdentifiers = this._getOrderingMethods(),
                sortFields = Y.Array.map(sortFieldIdentifiers, function(id) {
                    return {identifier: id, name: SORTFIELD_NAME_DICTIONARY[id], selected: (id === this.get('sortField'))};
                }, this);

            return sortFields;
        },

        /**
         * Check if the default sortField is 'standard', then get the available ordering methods.
         * 'Standard' sort fields are: Content name, Priority, Modification date, Publication date
         *
         * @method _getOrderingMethods
         * @protected
         * @return {Array} contains the sortField identifiers
         */
        _getOrderingMethods: function () {
            var location = this.get('location'),
                standardSortFields = ['NAME', 'PRIORITY', 'MODIFIED', 'PUBLISHED'];

            if (standardSortFields.indexOf(location.get('sortField')) === -1) {
                standardSortFields.push(location.get('sortField'));
            }
            return standardSortFields;
        },

        /**
         * Set the selected sort type attribute
         *
         * @method _setSortType
         * @protected
         */
        _setSortType: function () {
            var container = this.get('container'),
                sortFieldSelector = container.one(".ez-subitems-ordering-sort-type"),
                sortFieldSelectedIndex = sortFieldSelector.get('selectedIndex');

            this._set('sortField', sortFieldSelector.get('options').item(sortFieldSelectedIndex).get('value'));
        },

        /**
         * Set the selected sort order attribute
         *
         * @method _setSortingOrder
         * @protected
         */
        _setSortingOrder: function () {
            var container = this.get('container'),
                sortFieldSelector = container.one(".ez-subitems-sorting-order"),
                sortFieldSelectedIndex = sortFieldSelector.get('selectedIndex');

            this._set('sortOrder', sortFieldSelector.get('options').item(sortFieldSelectedIndex).get('value'));
        },

        /**
         * Fire the `loadUser` event
         * @method _fireLoadUser
         * @protected
         */
        _fireLoadUser: function () {
            var creatorId = this.get('content').get('currentVersion').get('resources').Creator,
                ownerId = this.get('content').get('resources').Owner;

            /**
             * Fired when the details view needs authors
             * @event loadUser
             * @param {String} userId Id of the author
             * @param {String} attributeName Where to store the result
             */
            this.fire('loadUser', {
                userId: creatorId,
                attributeName: 'creator',
            });

            if (creatorId === ownerId) {
                this.onceAfter('creatorChange', function (e) {
                    this.set('owner', this.get('creator'));
                });
            } else {
                this.fire('loadUser', {
                    userId: ownerId,
                    attributeName: 'owner',
                });
            }
        },
    }, {
        ATTRS: {
            /**
             * The title of the tab
             *
             * @attribute title
             * @type {String}
             * @default "Details"
             * @readOnly
             */
            title: {
                value: "Details",
                readOnly: true,
            },

            /**
             * The identifier of the tab
             *
             * @attribute identifier
             * @type {String}
             * @default "details"
             * @readOnly
             */
            identifier: {
                value: "details",
                readOnly: true,
            },

            /**
             * The creator of the content
             *
             * @attribute creator
             * @type {Object}
             */
            creator: {},

            /**
             * The owner of the content
             *
             * @attribute owner
             * @type {Object}
             */
            owner: {},

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @writeOnce
             */
            content: {
                writeOnce: 'initOnly',
            },

            /**
             * The location being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
                writeOnce: 'initOnly',
            },

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },

            /**
             * The selected sort field
             *
             * @attribute sortField
             * @type {String}
             */
            sortField: {
                value: ''
            },

            /**
             * The selected sort order
             *
             * @attribute sortOrder
             * @type {String}
             */
            sortOrder: {
                value: ''
            },
        }
    });
});
