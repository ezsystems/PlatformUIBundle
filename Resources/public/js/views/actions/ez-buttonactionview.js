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
     * @extends Y.TemplateBasedView
     */
    Y.eZ.ButtonActionView = Y.Base.create('buttonActionView',  Y.eZ.TemplateBasedView, [], {


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
         * Runs primary action
         *
         * @method run
         */
        run: function () {
            this.fire('action', {
                action : this.get('action'),
                option : this.get('option')
            });
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
             * The secondary option of the action (e.g. 'mobile' option for 'preview' action)
             *
             * @attribute option
             * @default ''
             * @type string
             * @required
             */
            option: {
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
             */
            hint: {
            },

            /**
             * Weather or not the action button is disabled
             *
             * @attribute disabled
             * @default false
             * @type boolean
             */
            disabled: {
               value: false
            }
        }
    });

});
