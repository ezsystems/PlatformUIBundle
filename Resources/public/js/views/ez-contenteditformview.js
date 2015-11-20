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
        TRANSITION_EASING = 'ease-in-out',
        L = Y.Lang;

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
            '.fieldgroup-name': {'tap': '_toggleFieldsetCollapse'},
            '.ez-form-content': {
                'submit': '_haltSubmit'
            },
        },

        initializer: function () {
            this._setFieldEditViews();
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
                user = this.get('user'),
                fieldDefinitions = contentType.get('fieldDefinitions'),
                views = [],
                that = this,
                config = this.get('config'),
                languageCode = this.get('languageCode');

            Y.Object.each(fieldDefinitions, function (def) {
                var EditView, view,
                    field = version.getField(def.identifier);

                if (field) {
                    try {
                        EditView = Y.eZ.FieldEditView.getFieldEditView(def.fieldType);

                        view = new EditView({
                            content: content,
                            version: version,
                            contentType: contentType,
                            fieldDefinition: def,
                            field: field,
                            config: config,
                            languageCode: languageCode,
                            user: user,
                        });
                        views.push(view);
                        view.addTarget(that);
                    } catch (e) {
                        console.error(e.message);
                    }
                } else {
                    console.warn('Version doesn\'t contain field "' + def.identifier + '"');
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
            var valid = true;

            Y.Array.each(this._fieldEditViews, function (view) {
                view.validate();
                valid = valid && view.isValid();
            });
            return valid;
        },

        /**
         * Returns an array containing the field updated with the user input.
         * Any undefined field is ignored.
         *
         * @method getFields
         * @return Array
         */
        getFields: function () {
            var res = [];

            Y.Array.each(this._fieldEditViews, function (val) {
                var field = val.getField();

                if ( !L.isUndefined(field) ) {
                    res.push(field);
                }
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
        },

        /**
         * Form submit event handler to halt the form submission.
         *
         * @method _haltSubmit
         * @param {EventFacade} e
         */
        _haltSubmit: function (e) {
            e.halt(true);
        },
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
                writeOnce: "initOnly",
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
                writeOnce: "initOnly",
            },

            /**
             * The version handled in the form view
             *
             * @attribute version
             * @default {}
             * @type {eZ.Version}
             * @required
             */
            version: {
                writeOnce: "initOnly",
            },

            /**
             * The language code in which the content is edited
             *
             * @attribute languageCode
             * @type {String}
             * @required
             */
            languageCode: {
                writeOnce: "initOnly",
            },

            /**
             * The logged in user
             *
             * @attribute user
             * @type {eZ.User}
             * @required
             */
            user: {},
        }
    });
});
