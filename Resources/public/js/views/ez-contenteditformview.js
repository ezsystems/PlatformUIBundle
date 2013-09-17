YUI.add('ez-contenteditformview', function (Y) {
    "use strict";
    /**
     * Provides the Form View class
     *
     * @module ez-contenteditformview
     */

    Y.namespace('eZ');

    var COLLAPSED_CLASS = 'is-collapsed',
        FIELDSET_FIELDS_CLASS = '.fieldgroup-fields',
        TRANSITION_DURATION = 0.4,
        TRANSITION_EASE_IN = 'ease-in',
        TRANSITION_EASE_OUT = 'ease-out';


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
            '.fieldgroup-name': {'tap': '_toggleFieldsetCollapse'}
        },

        /**
         * Renders the form view
         *
         * @method render
         * @return {eZ.ContentEditFormView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                fieldGroups: this.get('contentType').getFieldGroups()
            }));
            return this;
        },

        /**
         * Toggles collapsing for parent fieldSet with "SlideUp/Down" effect.
         *
         * @method _toggleFieldsetCollapse
         * @protected
         */
        _toggleFieldsetCollapse: function (e) {
            var fieldSet = e.currentTarget.get('parentNode'),
                fields = fieldSet.one(FIELDSET_FIELDS_CLASS);

            if (fieldSet.hasClass(COLLAPSED_CLASS)) {

                fields.transition({
                    height: function(node) {
                        return node.get('scrollHeight') + 'px';
                    },
                    duration: TRANSITION_DURATION,
                    easing: TRANSITION_EASE_OUT
                });

            } else {

                fields.transition({
                    height: 0,
                    duration: TRANSITION_DURATION,
                    easing: TRANSITION_EASE_IN
                });

            }

            fieldSet.toggleClass(COLLAPSED_CLASS);
        }

    });

}, {
    ATTRS: {
        /**
         * The content type instance, which we use to build correct Field Groups
         *
         * @attribute contentType
         * @default {}
         * @type {eZ.ContentType}
         * @required
         */
        contentType: {
            value: {}
        },

        /**
         * The content instance
         *
         * @attribute content
         * @default {}
         * @type {eZ.Content}
         * @required
         */
        content: {
            value: {}
        }
    }
});
