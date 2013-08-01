YUI.add('ez-contenteditformview', function (Y) {
    "use strict";
    /**
     * Provides the Form View class
     *
     * @module ez-contenteditformview
     */

    Y.namespace('eZ');

    var COLLAPSED_CLASS = 'is-collapsed',
        FIELDSET_FIELDS_CLASS = '.ez-formview-fieldset-fields';


    /**
     * The form view
     *
     * @namespace eZ
     * @class ContentEditFormView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentEditFormView = Y.Base.create('contentEditFormView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-formview-fieldset-name': {'tap': '_toggleFieldsetCollapse'}
        },

        /**
         * Renders the form view
         *
         * @method render
         * @return {eZ.ContentEditFormView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                form: this.get('model')
            }));
            return this;
        },

        _toggleFieldsetCollapse: function (e) {

            var legend = e.currentTarget,
                fieldSet = legend.get('parentNode');

            if (fieldSet.hasClass(COLLAPSED_CLASS)) {
                fieldSet.one(FIELDSET_FIELDS_CLASS).show(true);
            } else {
                fieldSet.one(FIELDSET_FIELDS_CLASS).hide(true);
            }

            fieldSet.toggleClass(COLLAPSED_CLASS);
        }

    });

});
