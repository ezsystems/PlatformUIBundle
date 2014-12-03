/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
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
        TRANSITION_EASING = 'ease-in-out';

    /**
     * The form view
     *
     * @namespace eZ
     * @class ContentEditFormView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentEditFormView = Y.Base.create('contentEditFormView', Y.eZ.TemplateBasedView, [Y.eZ.AccordionElement], {
        events: {
            '.fieldgroup-name': {'tap': '_toggleFieldsetCollapse'}
        },

        initializer: function () {
            this.after('contentTypeChange', this._setFieldEditViews);
            if ( this.get('contentType') ) {
                this._setFieldEditViews();
            }

            this.after('activeChange', function (e) {
                Y.Array.each(this._fieldEditViews, function (view) {
                    view.set('active', e.newVal);
                });
            });
        },

        /**
         * Sets the field edit views instance for the current content/contentType
         *
         * @method _setFieldEditViews
         * @protected
         */
        _setFieldEditViews: function () {
            var content = this.get('content'),
                version = this.get('version'),
                contentType = this.get('contentType'),
                fieldDefinitions = contentType.get('fieldDefinitions'),
                views = [];

            Y.Object.each(fieldDefinitions, function (def) {
                var EditView;

                try {
                    EditView = Y.eZ.FieldEditView.getFieldEditView(def.fieldType);

                    views.push(
                        new EditView({
                            content: content,
                            version: version,
                            contentType: contentType,
                            fieldDefinition: def,
                            field: version.getField(def.identifier)
                        })
                    );
                } catch (e) {
                    console.error(e.message);
                }
            });

            /**
             * The field edit views instances for the current content
             *
             * @property _fieldEditViews
             * @default []
             * @type Array of {eZ.FieldEditView}
             */
            this._fieldEditViews = views;
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
            this._renderFieldEditViews();
            return this;
        },

        /**
         * Checks whether the form is valid or not
         *
         * @method isValid
         * @return Boolean
         */
        isValid: function () {
            return Y.Array.every(this._fieldEditViews, function (view) {
                view.validate();
                return view.isValid();
            });
        },

        /**
         * Returns an array containing the field updated with the user input
         *
         * @method getFields
         * @return Array
         */
        getFields: function () {
            var res = [];

            Y.Array.each(this._fieldEditViews, function (val) {
                res.push(val.getField());
            });
            return res;
        },

        /**
         * Makes sure the field edit views are correctly destroyed
         *
         * @method destructor
         */
        destructor: function () {
            Y.Array.each(this._fieldEditViews, function (v, idx) {
                v.destroy();
            });
            this._fieldEditViews = [];
        },

        /**
         * Renders the field edit views in the correct fieldset (field group)
         *
         * @protected
         * @method _renderFieldEditViews
         */
        _renderFieldEditViews: function () {
            var container = this.get('container');

            Y.Array.each(this._fieldEditViews, function (view) {
                var fieldset,
                    def = view.get('fieldDefinition');

                fieldset = container.one('.ez-fieldgroup-' + def.fieldGroup + ' .fieldgroup-fields');
                fieldset.append(view.render().get('container'));
            });
        },

        /**
         * Toggles collapsing for parent fieldSet with "SlideUp/Down" effect.
         *
         * @method _toggleFieldsetCollapse
         * @protected
         */
        _toggleFieldsetCollapse: function (e) {
            var fieldset = e.currentTarget.get('parentNode');

            this._collapse({
                collapsedClass: COLLAPSED_CLASS,
                detectElement: fieldset,
                duration: TRANSITION_DURATION,
                easing: TRANSITION_EASING,
                collapseElement: fieldset.one(FIELDSET_FIELDS_CLASS)
            });
        }
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
            contentType: {},

            /**
             * The content instance
             *
             * @attribute content
             * @default {}
             * @type {eZ.Content}
             * @required
             */
            content: {},

            /**
             * The version handled in the form view
             *
             * @attribute version
             * @default {}
             * @type {eZ.Version}
             * @required
             */
            version: {},
        }
    });
});
