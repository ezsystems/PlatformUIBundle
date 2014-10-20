/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-createcontentfilterview', function (Y) {
    'use strict';
    /**
     * Provides the the Create Content Filter View
     *
     * @module ez-createcontentfilterview
     */

    Y.namespace('eZ');

    var SELECTION_FILTER_CLASS = 'ez-filter',
        FILTER_LIST_CLASS = 'ez-filter-list',
        FILTER_NAME = 'charMatch';

    /**
     * @namespace eZ
     * @class CreateContentFilterView
     * @constructor
     * @extends {{#crossLink "Y.eZ.SelectionFilterView"}}Y.eZ.SelectionFilterView{{/#crossLink}}
     */
    Y.eZ.CreateContentFilterView = Y.Base.create('createContentFilterView', Y.eZ.TemplateBasedView, {});
    Y.extend(Y.eZ.CreateContentFilterView, Y.eZ.SelectionFilterView, {
        events: {
            '.ez-createcontent-filter-group': {
                'tap': '_handleToggleCheckboxSelection'
            }
        },
        initializer: function () {
            var listNode = this.get('listNode');

            this._bindUIACBase();
            this._syncUIACBase();
            this.get('container').addClass(SELECTION_FILTER_CLASS);
            this.on({
                'clear': this._uiSetDefaultList,
                'results': this._filter,
                'select': this._handleSelect
            });

            listNode.addClass(FILTER_LIST_CLASS);
            this._attachedViewEvents.push(
                listNode.delegate('mouseover', Y.bind(this._itemMouseOver, this), this.ITEM_TAG),
                listNode.delegate('mouseout', Y.bind(this._itemMouseOut, this), this.ITEM_TAG),
                listNode.delegate('tap', Y.bind(this._select, this), this.ITEM_TAG)
            );
        },

        /**
         * Adds the unfiltered list of items to the list node
         *
         * @method _uiSetDefaultList
         * @protected
         */
        _uiSetDefaultList: function () {
            var list = [],
                initialList = this.get('initialListState');

            // perform these actions once on view
            if (initialList.length === 0) {
                this.get('source');

                Y.Array.map(this._rawSource, function (text) {
                    list.push({text: text});
                });

                this.set('initialListState', list);

                // render group type items once after initialization
                // prevent re-rendering when the filter query set to null
                this._uiRenderGroupItems();
            } else {
                list = initialList;
            }

            if (this.get('selectedGroups').length > 0) {
                list = this._filterResultsByGroups(list);
            }

            this._uiSetList(list).set('lastQuery', '');
        },

        /**
         * Adds some items in the list node based on the list parameter. Each
         * element of the list should be an object with a display and a text entries
         *
         * @method _uiSetList
         * @protected
         * @param {Array} list filtered list of elements
         */
        _uiSetList: function (list) {
            var fragment = Y.one(document.createDocumentFragment()),
                extSource = this.get('extendedSource');

            Y.Array.each(list, function (item) {
                fragment.append(
                    this._uiCreateTypeNode(item.text, item.text, extSource[item.text].groupId)
                );
            }, this);

            this.get('listNode').empty().append(fragment);

            return this;
        },

        /**
         * Adds an item to the list of possible choices
         *
         * @method _uiCreateTypeNode
         * @protected
         * @param {String}  content a name of content type
         * @param {String}  text data-text attribute value
         * @param {Integer} groupId id of the content type group
         */
        _uiCreateTypeNode: function (content, text, groupId) {
            return Y.Node.create(this.get('itemTemplate'))
                .setAttribute('data-text', text)
                .setAttribute('data-group-id', groupId)
                .append(content);
        },

        /**
         * Renders group items list
         *
         * @method _uiRenderGroupItems
         * @protected
         */
        _uiRenderGroupItems: function () {
            var groupsContainer = this.get('container').one('.content-type-groups .groups'),
                fragment = Y.one(document.createDocumentFragment());

            Y.Array.each(this.get('groups'), function (group) {
                fragment.append(this._uiCreateGroupNode(group.get('id'), group.get('identifier')));
            }, this);

            groupsContainer.empty().append(fragment);

            return this;
        },

        /**
         * Create a single group item
         *
         * @method _uiCreateGroupNode
         * @protected
         * @param {Integer} id      an id of the content group
         * @param {String} content  a content group name to be displayed
         */
        _uiCreateGroupNode: function (id, content) {
            return Y.Node.create(this.get('groupTemplate'))
                .setAttribute('data-group-id', id)
                .append(Y.Node.create('<input type="checkbox" />'))
                .append(content);
        },

        /**
         * Add a selected group to the list of selected groups
         * or removes a group from the selected groups
         * depending on checkbox selction
         *
         * @method _handleToggleCheckboxSelection
         * @protected
         * @param {Object} event event facade
         */
        _handleToggleCheckboxSelection: function (event) {
            var checkbox = event.currentTarget.one('[type="checkbox"]'),
                selectedGroups = this.get('selectedGroups'),
                groupId = event.currentTarget.getAttribute('data-group-id'),
                index;

            event.preventDefault();

            checkbox.set('checked', !checkbox.get('checked'));

            if (checkbox.get('checked')) {
                selectedGroups.push(groupId);
            } else {
                index = selectedGroups.indexOf(groupId);

                if (index > -1) {
                    selectedGroups.splice(index, 1);
                    this.set('selectedGroups', selectedGroups);
                }
            }

            /**
            * Fired after changing the checkbox selection.
            * Refreshes a list of available content types.
            *
            * @event results
            */
            this.fire('results');

            return this;
        },

        /**
         * Filter query results by selected content type groups
         *
         * @method _filterResultsByGroups
         * @protected
         * @param {Array} results list of results limited by search query
         */
        _filterResultsByGroups: function (results) {
            var extSource = this.get('extendedSource'),
                selectedGroups = this.get('selectedGroups');

            if (selectedGroups.length > 0) {
                results = Y.Array.filter(results, function (element) {
                    return (selectedGroups.indexOf(extSource[element.text].groupId) > -1) ? true : false;
                });
            }

            return results;
        },

        /**
         * Event handler for *:results event
         *
         * @method _filter
         * @protected
         * @param {Object} event event facade
         */
        _filter: function (event) {
            var results, resultsProperty;

            if (typeof event.results !== 'undefined') {
                results = event.results;
                this.set('lastQuery', event.query);
            } else {
                resultsProperty = this.get('results');

                results = (typeof resultsProperty !== 'undefined' && resultsProperty.length > 0)
                    ? resultsProperty
                    : this.get('initialListState');

                // apply query filter to the results filtered by content group
                results = Y.AutoCompleteFilters.charMatch(this.get('lastQuery'), results);
            }

            this._uiSetList(this._filterResultsByGroups(results));

            return this;
        },

        /**
         * Event handler for *:select event.
         * Prepares data for creating a new content of selected content type
         *
         * @method _handleSelect
         * @protected
         * @param {Object} event event facade
         */
        _handleSelect: function (event) {
            var selectedTypeInfo = this.get('extendedSource')[event.text];

            /**
            * Fired when a user selects a content type.
            * Passes the selected content type and language in which the content
            * should be created. The language is hardcoded for now.
            *
            * @event createContent
            * @param {eZ.ContentType} contentType the content type to use to
            * create the content
            * @param {String} languageCode the language code of the language in
            * which the content should be created
            */
            this.fire('createContent', {
                contentType: selectedTypeInfo.contentType,
                languageCode: 'eng-GB', // hardcoded for now
            });
        }
    }, {
        ATTRS: {
            /**
             * Last query from the search input
             *
             * @attribute lastQuery
             * @type {String}
             */
            lastQuery: {},

            /**
             * Information about the content type groups
             *
             * @attribute groups
             * @type {Object}
             */
            groups: {},

            /**
             * List of selected groups' ids
             *
             * @attribute selectedGroups
             * @type {Array}
             * @default []
             */
            selectedGroups: {
                value: []
            },

            /**
             * Full list of available content types
             *
             * @attribute initialListState
             * @type {Array}
             * @default []
             */
            initialListState: {
                value: []
            },

            /**
             * Extended version of source property.
             * Contains information about the groups
             * the content types belong to.
             *
             * @attribute extendedSource
             * @type {Object}
             */
            extendedSource: {},

            /**
             * Single content type group item template
             *
             * @attribute groupTemplate
             * @type {String}
             * @readOnly
             */
            groupTemplate: {
                readOnly: true,
                getter: function () {
                    return '<div class="ez-createcontent-filter-group" />';
                }
            },

            /**
             * Single content type item template
             *
             * @attribute itemTemplate
             * @type {Object}
             * @readOnly
             */
            itemTemplate: {
                readOnly: true,
                getter: function () {
                    return '<li class="ez-createcontent-filter-item" />';
                }
            },

            /**
             * Function name which will be used to highlight results
             *
             * @attribute resultHighlighter
             * @type {String}
             */
            resultHighlighter: {
                value: FILTER_NAME
            },

            /**
             * Array of local result filter functions
             *
             * @attribute resultFilters
             * @type {Array}
             */
            resultFilters: {
                value: [FILTER_NAME]
            }
        }
    });
});
