/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selectionfilterview', function (Y) {
    "use strict";
    /**
     * Provides the the Selection Filter View
     *
     * @module ez-selectionfilterview
     */
    Y.namespace('eZ');

    var SELECTION_FILTER_CLASS = 'ez-selection-filter',
        FILTER_LIST_CLASS = 'ez-selection-filter-list',
        FILTER_OFF_CLASS = 'ez-selection-filter-off',
        FILTER_ON_CLASS = 'ez-selection-filter-on',
        ITEM_ACTIVE_CLASS = 'ez-selection-filter-item-active',
        ITEM_SELECTED_CLASS = 'ez-selection-filter-item-selected',
        SELECT_EVT = 'select',
        UNSELECT_EVT = 'unselect';

    /**
     * A view allowing to select one or several items amongst a list and to
     * filter the list by typing some text in an input field. It is based on YUI
     * AutoCompleteBase component.
     *
     * This view is meant to progressively enhance an existing markup:
     *
     *     <div class="container">
     *        <input type="text">
     *        <ul></ul>
     *     </div>
     *
     * Then, you can instantiate the view with:
     *
     *     new Y.eZ.SelectionFilterView({
     *         container: '.container',
     *         inputNode: '.container input',
     *         listNode: '.container ul',
     *         source: ['Iron Man', 'Hulk', 'Thor', 'Black Widow']
     *     });
     *
     * @namespace eZ
     * @class SelectionFilterView
     * @constructor
     * @extends AutoCompleteBase
     */
    Y.eZ.SelectionFilterView = Y.Base.create('selectionFilterView', Y.View, [Y.AutoCompleteBase], {
        ITEM_TAG: 'li',
        ITEM_TEMPLATE: '<li class="ez-selection-filter-item" />',

        /**
         * Initializes the selection filter view. It adds the necessary classes
         * and sets up the event handlers
         *
         * @method initializer
         */
        initializer: function () {
            var container = this.get('container'),
                listNode = this.get('listNode'),
                inputNode = this.get('inputNode');

            this._bindUIACBase();
            this._syncUIACBase();

            container.addClass(SELECTION_FILTER_CLASS);

            if ( !this.get('filter') ) {
                inputNode
                    .addClass(FILTER_OFF_CLASS)
                    .set('disabled', true);
            } else {
                inputNode.addClass(FILTER_ON_CLASS);
            }

            listNode.addClass(FILTER_LIST_CLASS);

            this.on('clear', this._uiSetDefaultList);

            this.on('results', function (e) {
                var list = [];

                Y.Array.each(e.results, function (elt) {
                    list.push(elt.raw);
                });
                this._uiSetList(list);
            });

            this._attachedViewEvents.push(
                listNode.delegate(
                    'mouseover', Y.bind(this._itemMouseOver, this), this.ITEM_TAG
                )
            );

            this._attachedViewEvents.push(
                listNode.delegate(
                    'mouseout', Y.bind(this._itemMouseOut, this), this.ITEM_TAG
                )
            );

            this._attachedViewEvents.push(
               listNode.delegate(
                   'tap', Y.bind(this._select, this), this.ITEM_TAG
               )
            );

            this.after('sourceChange', function () {
                this.resetFilter();
                this.render();
            });
        },

        /**
         * Event handler for the tap event happening on the item elements. It
         * selects or unselects the items depending on the current state.
         *
         * @protected
         * @method _select
         * @param {Object} e event facade
         */
        _select: function (e) {
            var selected = this.get('selected');

            if ( !this.get('isMultiple') && selected.length === 1 ) {
                /**
                 * Fired when a user action unselects an item
                 *
                 * @event unselect
                 * @param {String} text the value which was unselected
                 */
                this.fire(UNSELECT_EVT, {
                    text: selected[0]
                });
                this.unselect(selected[0]);
            }
            if ( !this._isItemSelected(e.currentTarget) ) {
                this._uiSelectItem(e.currentTarget);
                this.get('selected').push(e.currentTarget.getAttribute('data-text'));
                /**
                 * Fired when a user action selects an item
                 *
                 * @event select
                 * @param {String} text the value which was selected
                 * @param {Node} elementNode the node containing the value
                 * @param {Object} attributes the data attributes on the
                 * elementNode. Those attributes are ones returned by the
                 * function stored in the resultAttributesFormatter attribute.
                 */
                this.fire(SELECT_EVT, {
                    elementNode: e.target,
                    text: e.currentTarget.getAttribute('data-text'),
                    attributes: this._getTargetAttributes(e.currentTarget),
                });
            } else {
                this.unselect(e.currentTarget.getAttribute('data-text'), e.currentTarget);
                this.fire(UNSELECT_EVT, {
                    elementNode: e.currentTarget,
                    text: e.currentTarget.getAttribute('data-text'),
                    attributes: this._getTargetAttributes(e.currentTarget),
                });
            }
        },

        /**
         * Returns the attributes of the selected element. The attributes are
         * the data attribute of the selected element.
         *
         * @param {Node} the selected node
         * @method _getTargetAttributes
         * @return {Object} a hash with the attributes values.
         */
        _getTargetAttributes: function (target) {
            var attributes = target.get('attributes'), res = {}, name;

            attributes.each(function (attr) {
                name = attr.get('name');
                if ( name.indexOf('data-') === 0 ) {
                    res[name.replace(/^data-/, '')] = target.getAttribute(name);
                }
            });
            return res;
        },

        /**
         * Event handler for the mouseover event on the list items.
         *
         * @method _itemMouseOver
         * @param {Object} e event facade
         * @protected
         */
        _itemMouseOver: function (e) {
            this._uiActiveItem(e.currentTarget);
        },

        /**
         * Event handler for the mouseout event on the list items.
         *
         * @method _itemMouseOout
         * @param {Object} e event facade
         * @protected
         */
        _itemMouseOut: function (e) {
            this._uiUnactiveItem(e.currentTarget);
        },

        /**
         * Checks whether the item is selected
         *
         * @protected
         * @method _isItemSelected
         * @param {Node} item
         */
        _isItemSelected: function (item) {
            return item.hasClass(ITEM_SELECTED_CLASS);
        },

        /**
         * Selects the item in the DOM by adding the selected class
         *
         * @protected
         * @method _uiSelectItem
         * @param {Node} item
         */
        _uiSelectItem: function (item) {
            item.addClass(ITEM_SELECTED_CLASS);
        },

        /**
         * Unselects the item in the DOM by removing the selected class
         *
         * @protected
         * @method _uiSelectItem
         * @param {Node} item
         */
        _uiUnselectItem: function (item) {
            item.removeClass(ITEM_SELECTED_CLASS);
        },

        /**
         * Sets the item as active by adding the active class
         *
         * @method _uiActiveItem
         * @protected
         * @param {Node} item
         */
        _uiActiveItem: function (item) {
            item.addClass(ITEM_ACTIVE_CLASS);
        },

        /**
         * Sets the item as inactive by adding the active class
         *
         * @method _uiActiveItem
         * @protected
         * @param {Node} item
         */
        _uiUnactiveItem: function (item) {
            item.removeClass(ITEM_ACTIVE_CLASS);
        },

        /**
         * Adds the unfiltered list of items to the list node
         *
         * @method _uiSetDefaultList
         * @protected
         */
        _uiSetDefaultList: function () {
            this.get('source'); // just to make sure _rawSource is defined
            this._uiSetList(this._rawSource);
        },

        /**
         * Adds some items in the list node based on the list parameter. Each
         * element of the list should be an object with a display and a text entries
         *
         * @method _uiSetList
         * @protected
         * @param {Array} list
         */
        _uiSetList: function (list) {
            var resultTextLocator = this.get('resultTextLocator'),
                resultAttributesFormatter = this.get('resultAttributesFormatter');

            this.get('listNode').setContent('');
            Y.Array.each(list, function (elt) {
                this._uiAddItemNode(
                    (resultTextLocator ? resultTextLocator.call(this, elt) : elt.toString()),
                    resultAttributesFormatter(elt)
                );
            }, this);
        },

        /**
         * Adds an item in the list of possible choice.
         *
         * @method _uiAddItemNode
         * @protected
         * @param {String} content the string to display
         * @param {String} attrs hash to create data attributes
         */
        _uiAddItemNode: function (content, attrs) {
            var node = Y.Node.create(this.ITEM_TEMPLATE);

            Y.Object.each(attrs, function (value, attr) {
                node.setAttribute('data-' + attr, value);
            });
            node.append(content);
            if ( this.get('selected').indexOf(attrs.text) !== -1 ) {
                this._uiSelectItem(node);
            }
            this.get('listNode').append(node);
        },

        /**
         * Resets the filter input and the item list
         *
         * @method resetFilter
         */
        resetFilter: function () {
            this.get('inputNode').set('value', '');
            this._uiSetDefaultList();
        },

        /**
         * Returns the list item node based on a string value
         *
         * @method _getListNode
         * @protected
         * @param {String} value
         * @return {Node}
         */
        _getListNode: function (value) {
            return this.get('listNode').one('[data-text="' + value + '"]');
        },

        /**
         * Renders the view
         *
         * @method render
         * @return {eZ.SelectionFilterView} the view it self
         */
        render: function () {
            this._uiSetDefaultList();
            return this;
        },

        destructor: function () {
            this.get('listNode')
                .setContent('')
                .removeClass(FILTER_LIST_CLASS);
            this.get('inputNode')
                .set('value', '')
                .removeAttribute('autocomplete')
                .removeAttribute('disabled')
                .removeClass(FILTER_OFF_CLASS)
                .removeClass(FILTER_ON_CLASS);
            this.get('container').removeClass(SELECTION_FILTER_CLASS);
        },

        /**
         * Unselects an item based on its value
         *
         * @method unselect
         * @param {String} value
         * @param {Node} [selectedNode] optional selected node for internal use
         * only.
         */
        unselect: function (value, selectedNode) {
            var selected = this.get('selected');

            selected = Y.Array.reject(selected, function (val) {
                return (val === value);
            });

            this._set('selected', selected);

            if ( !selectedNode ) {
                selectedNode = this._getListNode(value);
            }
            if ( selectedNode ) {
                this._uiUnselectItem(selectedNode);
            }
        },

        /**
         * Focuses the filter input
         *
         * @method focus
         */
        focus: function () {
            if ( this.get('filter') ) {
                this.get('inputNode').focus();
            }
        },
    }, {
        ATTRS: {
            /**
             * Whether to allow filtering
             *
             * @attribute filter
             * @writeOnce
             * @default true
             */
            filter: {
                writeOnce: "initOnly",
                value: true,
            },

            /**
             * The node where the available items should be added
             *
             * @attribute listNode
             * @required
             * @writeOnce
             */
            listNode: {
                writeOnce: "initOnly",
                setter: Y.one,
                value: null
            },

            /**
             * Whether it should be possible to select several items
             *
             * @attribute isMultiple
             * @writeOnce
             * @default false
             */
            isMultiple: {
                writeOnce: "initOnly",
                value: false,
            },

            /**
             * The selected values
             *
             * @attribute selected
             * @writeOnce
             * @default []
             */
            selected: {
                writeOnce: "initOnly",
                value: []
            },

            /**
             * The source for the list of available items.
             * Overrides the source attribute from AutoCompleteBase to only
             * accepts array as source.
             *
             * @attribute source
             * @required
             */
            source: {
                validator: Y.Lang.isArray,
                setter: '_setSource',
                value: []
            },

            /**
             * A function to extract the attributes to add for each element in
             * the source array. The default implementation returns a hash
             * containing a `text` entry holding the `toString` return value of
             * the source element.
             *
             * @attribute resultAttributesFormatter
             * @type {Function}
             */
            resultAttributesFormatter: {
                validator: Y.Lang.isFunction,
                value: function (sourceElement) {
                    return {text: sourceElement.toString()};
                },
            },
        }
    });
});
