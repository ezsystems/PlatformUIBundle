YUI.add('ez-contenteditformview', function (Y) {
    "use strict";
    /**
     * Provides the Form View class
     *
     * @module ez-contenteditformview
     */

    Y.namespace('eZ');

    var COLLAPSED_CLASS = 'is-collapsed',
        FIELDSET_FIELDS_CLASS = '.fieldgroup-fields';


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
                form: {
                    fieldGroups: this.get('contentType').getFieldGroups()
                }
            }));
            return this;
        },

        _toggleFieldsetCollapse: function (e) {
            var fieldSet = e.currentTarget.get('parentNode');

            if (fieldSet.hasClass(COLLAPSED_CLASS)) {

                fieldSet.transition({
                    height: function(node) {
                        var summaryHeight = parseInt(node.get('scrollHeight'),10) +
                                            parseInt(node.getStyle('paddingTop'),10) +
                                            parseInt(node.getStyle('paddingBottom'),10);
                        console.log(summaryHeight);
                        return summaryHeight + 'px';
                    },
                    duration: 0.4,
                    easing: 'ease-out',
                    on: {
                        start: function() {
                            var overflow = this.getStyle('overflow');
                            if (overflow !== 'hidden') { // enable scrollHeight/Width
                                this.setStyle('overflow', 'hidden');
                                this._transitionOverflow = overflow;
                            }
                        },
                        end: function() {
                            if (this._transitionOverflow) { // revert overridden value
                                this.setStyle('overflow', this._transitionOverflow);
                                delete this._transitionOverflow;
                            }
                        }
                    }
                });

            } else {

                fieldSet.transition({
                    height: '10px',
                    duration: 0.4,
                    easing: 'ease-in'
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
         * @required
         */
        contentType: {
            value: {}
        }
    }
});
