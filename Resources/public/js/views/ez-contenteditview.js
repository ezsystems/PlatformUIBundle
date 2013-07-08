YUI.add('ez-contenteditview', function (Y) {
    /**
     * Provides the Content Edit View class
     *
     * @module ez-contenteditview
     */

    Y.namespace('eZ');

    /**
     * The content edit view
     *
     * @namespace eZ
     * @class ContentEditView
     * @constructor
     * @extends View
     */
    Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.View, [], {

        /**
         * Renders the content edit view
         *
         * @method render
         * @return {eZ.ContentEditView} the view itself
         */
        render: function () {
            return this;
        }

    });

});
