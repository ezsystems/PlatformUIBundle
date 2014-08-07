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

    var MODULE_CLASS_NAME = 'ez-view-createcontentactionview';

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
            this.containerTemplate = '<div class="ez-view-buttonactionview ' + MODULE_CLASS_NAME + '"/>';
            this.after({
                'contentGroupsListChange': this._handleContentGroupsListChange,
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

            container.setHTML(this.template({
                actionId: this.get('actionId'),
                disabled: this.get('disabled'),
                label: this.get('label'),
                hint: this.get('hint')
            }));

            container.on('clickoutside', this._hideView, this);

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
         * Handler for contentGroupsListChange event
         * Updates data properties of the {{#crossLink "Y.eZ.CreateContentFilterView"}}Y.eZ.CreateContentFilterView{{/#crossLink}}
         *
         * @method _handleContentGroupsListChange
         */
        _handleContentGroupsListChange: function () {
            var contentFilter = this.get('contentFilter'),
                typesData = this.get('contentGroupsList');

            contentFilter.setAttrs({
                'groups': typesData.groups,
                'source': typesData.source,
                'extendedSource': typesData.types
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
             * Stores content type data as a result of AJAX request
             *
             * @attribute contentGroupsList
             * @type {Object}
             */
            contentGroupsList: {},

            /**
             * Stores {{#crossLink "Y.eZ.CreateContentFilterView"}}Y.eZ.CreateContentFilterView{{/#crossLink}} instance
             *
             * @attribute contentFilter
             * @type eZ.CreateContentFilterView
             */
            contentFilter: {},

            /**
             * The node which is expanded
             *
             * @attribute expandableNode
             * @type Y.Node
             * @readOnly
             */
            expandableNode: {
                readOnly: true,
                getter: function () {
                    return this.get('container').one('.ez-expandable-area');
                },
            },
        }
    });
});
