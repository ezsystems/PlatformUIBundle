YUI.add('ez-formview', function (Y) {
    "use strict";
    /**
     * Provides the Form View class
     *
     * @module ez-formview
     */

    Y.namespace('eZ');

    var COLLAPSED_CLASS = 'collapsed';


    /**
     * The form view
     *
     * @namespace eZ
     * @class FormView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.FormView = Y.Base.create('formView', Y.eZ.TemplateBasedView, [], {
        events: {
            'fieldset label': {'tap': '_toggleFieldsetCollapse'}
        },

        /**
         * Renders the form view
         *
         * @method render
         * @return {eZ.FormView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                form: this.get('model')
            }));
            return this;
        },

        _toggleFieldsetCollapse: function (e) {

            var label = e.currentTarget,
                fieldSet = label.get('parentNode');

            if (fieldSet.hasClass(COLLAPSED_CLASS)) {
                fieldSet.one('details').show(true);
                label.setAttribute('data-icon-after', "\uE002");
            } else {
                fieldSet.one('details').hide(true);
                label.setAttribute('data-icon-after', "\uE004");
            }

            fieldSet.toggleClass(COLLAPSED_CLASS);
        }

    });

});
