YUI.add('ez-previewactionview', function (Y) {
    "use strict";
    /**
     * Provides the Preview Action View class
     *
     * @module ez-previewactionview
     */

    Y.namespace('eZ');

    /**
     * Button Action View
     *
     * @namespace eZ
     * @class PreviewActionView
     * @constructor
     * @extends Y.ButtonActionView
     */
    Y.eZ.PreviewActionView = Y.Base.create('previewActionView',  Y.eZ.ButtonActionView, [], {


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

            return this;
        }

    }, {
        ATTRS: {
            /**
             * Buttons array which provide preview options
             *
             * @attribute buttons
             * @type Array
             * @default []
             */
            buttons : {
                value : []
            }
        }
    });

});
