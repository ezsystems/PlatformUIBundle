/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-createcontentactionview', function (Y) {
    'use strict';
    /**
     * Provides the create content action view class
     *
     * @module ez-createcontentactionview
     */

    Y.namespace('eZ');

    /**
     * Create Content Action View
     *
     * @namespace eZ
     * @class CreateContentActionView
     * @constructor
     * @extends eZ.ButtonActionView
     */
    Y.eZ.CreateContentActionView = Y.Base.create('createContentActionView', Y.eZ.ButtonActionView, [Y.eZ.Expandable], {
        initializer: function () {
            this.after({
                'contentTypeGroupsChange': this._handleContentTypeGroupsChange,
                'activeChange': this._handleActiveChange,
                'createContentAction': this._toggleExpanded
            });
        },

        /**
         * Renders the action
         *
         * @method render
         * @return Y.eZ.CreateContentActionView the view itself
         */
        render: function () {
            var container = this.get('container');

            this._addButtonActionViewClassName();
            container.on('clickoutside', this._hideView, this);
            return this.constructor.superclass.render.call(this);
        },

            return this;
        },

        /**
         * Handler for activeChange event.
         * CreateContentFilterView has to be initialized after activeChange event is fired.
         * Adds {{#crossLink "Y.eZ.CreateContentFilterView"}}Y.eZ.CreateContentFilterView{{/#crossLink}} instance to the view
         *
         * @method _handleActiveChange
         */
        _handleActiveChange: function () {
            var container = this.get('container'),
                contentFilter = new Y.eZ.CreateContentFilterView({
                    container: container.one('.ez-expandable-area'),
                    inputNode: container.one('.autocomplete-filter'),
                    listNode: container.one('.autocomplete-list'),
                    source: this.get('fieldTypesList')
                }).addTarget(this);

            this.set('contentFilter', contentFilter);

            return this;
        },

        /**
         * Handler for contentTypeGroupsChange event
         * Updates data properties of the {{#crossLink "Y.eZ.CreateContentFilterView"}}Y.eZ.CreateContentFilterView{{/#crossLink}}
         *
         * @method _handleContentTypeGroupsChange
         */
        _handleContentTypeGroupsChange: function () {
            var contentFilter = this.get('contentFilter'),
                groups = this.get('contentTypeGroups'),
                typeNames = [],
                types = {};

            Y.Array.each(groups, function (group) {
                Y.Array.each(group.get('contentTypes'), function (type) {
                    var name = type.get('names')['eng-GB'];

                    typeNames.push(name);
                    types[name] = { // TODO this is buggy, the content types names are not unique...
                        contentType: type,
                        groupId: group.get('id'),
                    };
                });
            });

            contentFilter.setAttrs({
                'groups': groups,
                'source': typeNames,
                'extendedSource': types
            }).resetFilter();

            return this;
        },

        /**
         * Toggles the expanded state
         *
         * @method _toggleExpanded
         * @protected
         */
        _toggleExpanded: function () {
            this.set('expanded', !this.get('expanded'));

            return this;
        },

        /**
         * Hides the expanded view
         *
         * @method _hideView
         * @protected
         */
        _hideView: function () {
            this.set('expanded', false);
        }
    }, {
        ATTRS: {
            /**
             * Stores an array of content type groups
             *
             * @attribute contentTypeGroups
             * @type Array
             */
            contentTypeGroups: {},

            /**
             * Stores {{#crossLink "Y.eZ.CreateContentFilterView"}}Y.eZ.CreateContentFilterView{{/#crossLink}} instance
             *
             * @attribute contentFilter
             * @type eZ.CreateContentFilterView
             */
            contentFilter: {},
        }
    });
});
