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
     * @extends Y.eZ.ButtonActionView
     */
    Y.eZ.PreviewActionView = Y.Base.create('previewActionView',  Y.eZ.ButtonActionView, [], {

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

            container.setHTML(this.template({
                actionId : this.get('actionId'),
                disabled : this.get('disabled'),
                label : this.get('label'),
                hint : this.get('hint'),
                buttons : this.get('buttons')
            }));

            //Do NOT render preview yet (to reduce loading time for main UI parts)
            Y.one(EDIT_PREVIEW_CONTAINER).append(this.get('editPreview').get('container'));

            return this;
        },

        destructor: function () {
            this.get('editPreview').destroy();
        },

        /**
         * Handles tap on one of the view's action buttons
         *
         * _handleActionClick
         * @param e {Object} event facade
         * @protected
         */
        _handleActionClick: function (e) {

            var actionTrigger = e.currentTarget,
                option = actionTrigger.getAttribute('data-action-option');

            this.get('editPreview').set('currentModeId', option);
            this.get('editPreview').show();

            // UI changes
            this.get('container').all('[data-action="preview"]').removeClass(IS_SELECTED_CLASS);
            actionTrigger.addClass(IS_SELECTED_CLASS);
        },

        /**
         * Makes changes to UI once editPreview is hidden (removes preview selection)
         *
         * @method render
         * @return {eZ.EditActionBar} the view itself
         * @protected
         */
        _handleEditPreviewHide : function () {
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
            buttons : {
                value : []
            },

            /**
             * The EditPreviewView (by default) instance
             *
             * @attribute editPreviewView
             * @default new Y.eZ.EditPreviewView()
             * @type {eZ.EditPreviewView}
             * @required
             */
            editPreview: {
                value: new Y.eZ.EditPreviewView()
            },

            /**
             * Content which is currently loaded in content edit view
             *
             * @attribute content
             * @type Y.eZ.Content
             * @default {}
             * @required
             */
            content: {
                value: {},
                setter: function (val, name) {
                    this.get('editPreview').set('content', val);
                    return val;
                }
            }

        }
    });

});
