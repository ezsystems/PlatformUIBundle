/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-buttonactionview', function (Y) {
    "use strict";
    /**
     * Provides the button action view class
     *
     * @module ez-buttonactionview
     */
    Y.namespace('eZ');

    var ACTION_SUFFIX = 'Action';

    /**
     * Button Action View
     *
     * @namespace eZ
     * @class ButtonActionView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ButtonActionView = Y.Base.create('buttonActionView',  Y.eZ.TemplateBasedView, [], {
        events: {
            '.action-trigger': {
                'tap': '_handleActionClick'
            }
        },

        initializer: function () {
            this.on('disabledChange', this._handleToggleButtonState);
        },

        /**
         * Renders the action
         *
         * @method render
         * @return {eZ.ButtonActionView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                actionId: this.get('actionId'),
                disabled: this.get('disabled'),
                label: this.get('label'),
                hint: this.get('hint')
            }));

            return this;
        },

        /**
         * Adds the button action view class name to the container of the view.
         * It is meant to be used by child class so that we can reuse the button
         * action view CSS styles.
         *
         * @protected
         * @method _addParentClassName
         */
        _addButtonActionViewClassName: function () {
            var classes = this._getClasses();

            this.get('container').addClass(
                this._generateViewClassName(classes[0].superclass.constructor.NAME)
            );
        },

        /**
         * Handles tap on the view's action button
         *
         * @method _handleActionClick
         * @param e {Object} event facade
         * @protected
         */
        _handleActionClick: function (e) {
            /**
             * Fired when the action button is clicked. Name of the event
             * consists of the action view's 'actionId' attribute and 'Action'
             * suffix.  For example for a view with actionId = "publish", the
             * event fired will be named "publishAction".
             *
             * @event <actionId>Action
             * @param {eZ.Content} the content model object
             */
            this.fire(this.get('actionId') + ACTION_SUFFIX, {
                content: this.get('content')
            });
        },

        /**
         * Handles *:disabledChange event
         *
         * @method _handleToggleButtonState
         * @param event {Object} event facade
         * @protected
         */
        _handleToggleButtonState: function (event) {
            var buttons = this.get('container').all('.action-trigger'),
                buttonMethod = event.newVal ? 'setAttribute' : 'removeAttribute';

            buttons[buttonMethod]('disabled', event.newVal);
        }
    }, {
        ATTRS: {
            /**
             * The priority of the action. Actions are orderd by priority (from
             * top to bottom) If priority is equal, actions are ordered in the
             * order they are added to list
             *
             * @attribute priority
             * @default 0
             * @type int
             */
            priority: {
                value: 0
            },

            /**
             * The primary action id, should be unique among other instances of
             * actions, since it is used for styling, running commands, etc.
             *
             * @attribute action
             * @default ''
             * @type string
             * @required
             */
            actionId: {
                value: ''
            },

            /**
             * Action label
             *
             * @attribute label
             * @default ''
             * @type string
             * @required
             */
            label: {
                value: ''
            },

            /**
             * Action hint (shown in small font below the label)
             *
             * @attribute hint
             * @type string
             * @default ''
             */
            hint: {
                value: ''
            },

            /**
             * Whether or not the action button is disabled
             *
             * @attribute disabled
             * @default false
             * @type boolean
             */
            disabled: {
                value: false
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
                value: {}
            },

            /**
             * Version currently being edited (if used in the edit context)
             *
             * @attribute version
             * @type eZ.Version
             * @default {}
             */
            version: {
                value: {}
            }
        }
    });
});
