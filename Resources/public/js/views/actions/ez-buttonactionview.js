YUI.add('ez-buttonactionview', function (Y) {
    "use strict";
    /**
     * Provides the Button Action View model class
     *
     * @module ez-buttonactionview
     */

    Y.namespace('eZ');

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

        /**
         * Renders the action
         *
         * @method render
         * @return {eZ.ButtonActionView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                actionId : this.get('actionId'),
                disabled : this.get('disabled'),
                label : this.get('label'),
                hint : this.get('hint')
            }));

            return this;
        },

        /**
         * Handles tap on the view's action button
         *
         * _handleActionClick
         * @param e {Object} event facade
         * @private
         */
        _handleActionClick: function (e) {
            this.fire(this.get('actionId') + 'Action');
        }

    }, {
        ATTRS: {
            /**
             * The priority of the action. Actions are orderd by priority (from top to bottom)
             * If priority is equal, actions are ordered in the order they are added to list
             *
             * @attribute priority
             * @default 0
             * @type int
             * @required
             */
            priority: {
                value: 0
            },

            /**
             * The primary action id, should be unique among other instances of actions, since it is used for styling, running commands, etc.
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
            }
        }
    });

});
