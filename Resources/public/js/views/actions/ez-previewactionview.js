/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-previewactionview', function (Y) {
    "use strict";
    /**
     * Provides the Preview Action View class
     *
     * @module ez-previewactionview
     */
    Y.namespace('eZ');

    var EDIT_PREVIEW_CONTAINER = '.ez-editpreviewview-container',
        IS_SELECTED_CLASS = "is-selected";

    /**
     * Preview Action View
     *
     * @namespace eZ
     * @class PreviewActionView
     * @constructor
     * @extends eZ.ButtonActionView
     */
    Y.eZ.PreviewActionView = Y.Base.create('previewActionView',  Y.eZ.ButtonActionView, [], {
        events: {
            '.action-trigger': {
                'tap': '_previewAction'
            }
        },

        /**
         * Initializer is called upon view's init
         * Creating actions lookup object, misc init workflow
         *
         * @method initializer
         */
        initializer: function () {
            this.get('editPreview').addTarget(this);
            this.on('*:editPreviewHide', this._handleEditPreviewHide, this);
        },

        /**
         * Renders the action
         *
         * @method render
         * @return {eZ.PreviewActionView} the view itself
         */
        render: function () {
            var container = this.get('container');

            this._addButtonActionViewClassName();
            container.setHTML(this.template({
                actionId: this.get('actionId'),
                disabled: this.get('disabled'),
                label: this.get('label'),
                hint: this.get('hint'),
                buttons: this.get('buttons')
            }));

            //Do NOT render preview yet (to reduce loading time for main UI parts)
            container.one(EDIT_PREVIEW_CONTAINER).append(this.get('editPreview').get('container'));

            return this;
        },

        destructor: function () {
            this.get('editPreview').removeTarget(this);
            this.get('editPreview').destroy();
        },

        /**
         * Handles tap on any of the preview mode action buttons
         *
         * @method previewAction
         * @param e {Object} event facade
         * @protected
         */
        _previewAction: function (e) {
            var actionTrigger = e.currentTarget,
                option = actionTrigger.getAttribute('data-action-option');

            this.get('editPreview').set('currentModeId', option);
            this.get('editPreview').show(this.get('container').getX());

            // UI changes
            this.get('container').all('[data-action="preview"]').removeClass(IS_SELECTED_CLASS);
            actionTrigger.addClass(IS_SELECTED_CLASS);
        },

        /**
         * Makes changes to UI once editPreview is hidden (removes preview selection)
         *
         * @method _handleEditPreviewHide
         * @protected
         */
        _handleEditPreviewHide: function () {
            this.get('container').all('[data-action="preview"]').removeClass(IS_SELECTED_CLASS);
        }

    }, {
        ATTRS: {
            /**
             * Array of objects describing buttons which provide preview options
             *
             * @attribute buttons
             * @type Array
             * @default []
             */
            buttons: {
                value: []
            },

            /**
             * The EditPreviewView (by default) instance
             *
             * @attribute editPreview
             * @default new Y.eZ.EditPreviewView()
             * @type {eZ.EditPreviewView}
             * @required
             */
            editPreview: {
                valueFn: function () {
                    return new Y.eZ.EditPreviewView();
                }
            },

            /**
             * Content which is currently loaded in content edit view
             *
             * @attribute content
             * @type eZ.Content
             * @default {}
             * @required
             */
            content: {
                value: {},
                setter: function (val, name) {
                    this.get('editPreview').set('content', val);
                    return val;
                }
            },

            /**
             * The version
             *
             * @attribute version
             * @type eZ.Version
             * @default {}
             */
            version: {
                value: {},
                setter: function (val, name) {
                    this.get('editPreview').set('version', val);
                    return val;
                }
            }
        }
    });
});
