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

    var IS_CONTENTTYPE_SELECTOR_LOADED = 'is-contenttypeselector-loaded';

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
            this.set('disabled', !this.get('contentType').get('isContainer'));
            this.get('contentTypeSelectorView').addTarget(this);
            this.after({
                'contentTypeGroupsChange': this._renderContentTypeSelector,
                'createContentAction': this._toggleExpanded,
                'expandedChange': this._setClickOutsideEventHandler,
            });
        },

        /**
         * Renders the action
         *
         * @method render
         * @return Y.eZ.CreateContentActionView the view itself
         */
        render: function () {
            this._addButtonActionViewClassName();
            return this.constructor.superclass.render.call(this);
        },

        /**
         * Renders the content type selector
         *
         * @method _renderContentTypeSelector
         * @protected _renderContentTypeSelector
         */
        _renderContentTypeSelector: function () {
            var container = this.get('container');

            container.addClass(IS_CONTENTTYPE_SELECTOR_LOADED);
            container.one('.ez-contenttype-selector').append(
                this.get('contentTypeSelectorView').render().get('container')
            );
        },

        /**
         * expandedChange event handler to define or detach the click outside
         * event handler so that the view gets hidden when the user click
         * somewhere else
         *
         * @method _setClickOutsideEventHandler
         * @param {Object} e event facade of the expandedChange event
         * @protected
         */
        _setClickOutsideEventHandler: function (e) {
            if ( e.newVal ) {
                this._clickOutsideSubscription = this.get('container').on(
                    'clickoutside', Y.bind(this._hideView, this)
                );
            } else {
                this._clickOutsideSubscription.detach();
            }
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
        },

        destructor: function () {
            this.get('contentTypeSelectorView').removeTarget(this);
            this.get('contentTypeSelectorView').destroy();
        }
    }, {
        ATTRS: {
            /**
             * Stores an array of content type groups
             *
             * @attribute contentTypeGroups
             * @type Array
             */
            contentTypeGroups: {
                setter: function (groups) {
                    this.get('contentTypeSelectorView').set('contentTypeGroups', groups);
                    return groups;
                },
            },

            /**
             * Holds the content type selector view instance
             *
             * @attribute contentTypeSelectorView
             * @type Y.eZ.ContentTypeSelectorView
             */
            contentTypeSelectorView: {
                valueFn: function () {
                    return new Y.eZ.ContentTypeSelectorView();
                }
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             */
            contentType: {
                writeOnce: "initOnly",
            },
        }
    });
});
