/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeselectorview', function (Y) {
    'use strict';
    /**
     * Provides the content type selector view class
     *
     * @module ez-contenttypeselector
     */
    Y.namespace('eZ');

    var _GET_NAME = function (type) {
            return type.get('names')['eng-GB'];
        };

    /**
     * Content type selector view
     *
     * @namespace eZ
     * @class ContentTypeSelectorView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentTypeSelectorView = Y.Base.create('contentTypeSelectorView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-contenttypeselector-group-checkbox': {
                'change': '_syncSelectedIds',
            }
        },

        initializer: function () {
            this.after('selectedGroupIdsChange', function () {
                this._filterByGroups();
                this._handleCheckboxState();
            });
        },

        destructor: function () {
            var filter = this.get('filterView');

            if ( filter ) {
                filter.destroy();
                this._set('filterView', undefined);
            }
        },

        /**
         * Filters the displayed content types by the selected content type
         * groups.
         *
         * @method _filterByGroups
         * @protected
         */
        _filterByGroups: function () {
            this.get('filterView').set('source', this._getContentTypes());
        },

        /**
         * Makes sure there's always at least one content type groups checked by
         * disabling the selected checkbox if there's only one
         *
         * @method _handleCheckboxState
         * @protected
         */
        _handleCheckboxState: function () {
            if ( this.get('selectedGroupIds').length === 1 ) {
                this._disableSelectedCheckbox();
            } else {
                this._enableCheckboxes();
            }
        },

        /**
         * Disables the checked checkbox
         *
         * @method _disableSelectedCheckbox
         * @private
         */
        _disableSelectedCheckbox: function () {
            this._getCheckboxes(true).set('disabled', true);
        },

        /**
         * Enables the checkboxes
         *
         * @method _enableCheckboxes
         * @private
         */
        _enableCheckboxes: function () {
            this._getCheckboxes().set('disabled', false);
        },

        /**
         * Returns an array of the content types in the selected content type
         * groups. This array is sorted by name of the content types
         *
         * @method _getContentTypes
         * @protected
         */
        _getContentTypes: function () {
            var types = [],
                selectedIds = this.get('selectedGroupIds');

            Y.Array.each(this.get('contentTypeGroups'), function (group) {
                if ( selectedIds.indexOf(group.get('id')) !== -1 ) {
                    types = types.concat(group.get('contentTypes'));
                }
            });
            types.sort(function (a, b) {
                if ( _GET_NAME(a) < _GET_NAME(b) ) {
                    return -1;
                } else if ( _GET_NAME(a) > _GET_NAME(b) ) {
                    return 1;
                }
                return 0;
            });
            return types;
        },

        /**
         * Renders the content type selector view
         *
         * @method render
         * @return {eZ.ContentTypeSelectorView} the view itself
         */
        render: function () {
            var groups = [],
                selectedIds = this.get('selectedGroupIds');

            Y.Array.each(this.get('contentTypeGroups'), function (group) {
                var jsonGroup = group.toJSON();

                if ( selectedIds.indexOf(group.get('id')) !== -1 ) {
                    jsonGroup.checked = true;
                }
                groups.push(jsonGroup);
            });
            this.get('container').setHTML(this.template({
                contentTypeGroups: groups,
            }));
            this._handleCheckboxState();
            this._renderFilterView();
            return this;
        },

        /**
         * Renders the filter view
         *
         * @method _renderFilterView
         */
        _renderFilterView: function () {
            var filter,
                that = this,
                container = this.get('container');

            filter = new Y.eZ.SelectionFilterView({
                container: container,
                inputNode: container.one('.ez-contenttypeselector-filter'),
                listNode: container.one('.ez-contenttypeselector-list'),
                source: this._getContentTypes(),
                resultFilters: 'phraseMatch',
                resultTextLocator: function (sourceElement) {
                    return _GET_NAME(sourceElement);
                },
                resultAttributesFormatter: function (sourceElement) {
                    return {
                        id: sourceElement.get('id'),
                        text: _GET_NAME(sourceElement),
                    };
                },
            });
            this._set('filterView', filter);
            filter.on('select', function (e) {
                that._createContentEvent(e.attributes.id);
            });
            filter.render();
        },

        /**
         * Fires the `createContent` event
         *
         * @method _createContentEvent
         * @protected
         * @param {String} typeId the content type id
         */
        _createContentEvent: function (typeId) {
            var type;

            type = Y.Array.find(this._getContentTypes(), function (t) {
                return t.get('id') === typeId;
            });

            this.fire('createContent', {
                contentType: type,
                languageCode: 'eng-GB',
            });
        },

        /**
         * keeps the `selectedGroupIds` attribute and the checked content type
         * groups id in sync
         *
         * @method _syncSelectedIds
         * @protected
         */
        _syncSelectedIds: function () {
            this.set('selectedGroupIds', this._getSelectedIds());
        },

        /**
         * Returns the selected content type groups id from the DOM
         *
         * @protected
         * @method _getSelectedIds
         * @return {Array} array of the content groups id (string)
         */
        _getSelectedIds: function () {
            var selected = this._getCheckboxes(true),
                res = [];

            selected.each(function (checkbox) {
                res.push(checkbox.get('value'));
            });
            return res;
        },

        /**
         * Returns a NodeList containing the content type groups checkbox. If
         * `checked` is true, only the checked checkbox are returned.
         *
         * @method _getCheckboxes
         * @private
         * @return {NodeList}
         */
        _getCheckboxes: function (checked) {
            return this.get('container').all(
                '.ez-contenttypeselector-group-checkbox' + (checked ? ':checked' : '')
            );
        },
    }, {
        ATTRS: {
            /**
             * Stores the list of content type groups
             *
             * @attribute contentTypeGroups
             * @type {Array}
             */
            contentTypeGroups: {},

            /**
             * A SelectionFilterView instance that displays the available
             * content types. This attribute is only filled after the view is
             * rendered.
             *
             * @attribute filter
             * @readOnly
             * @type {eZ.SelectionFilterView}
             */
            filterView: {
                readOnly: true,
            },

            /**
             * The list of the selected content type groups ids
             *
             * @attribute selectedGroupIds
             * @type {Array}
             * @default an array containing the id of the 'Content' group
             */
            selectedGroupIds: {
                value: ['/api/ezp/v2/content/typegroups/1'],
            }
        }
    });
});
