/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-rawcontentview', function (Y) {
    "use strict";
    /**
     * Provides the Raw Content View class
     *
     * @module ez-rawcontentview
     */
    Y.namespace('eZ');

    var COLLAPSED_RAW_VIEW = 'is-raw-content-view-collapsed',
        COLLAPSED_GROUP = 'is-field-group-collapsed',
        COLLAPSED_GROUP_HEIGHT = '1em';

    /**
     * The raw content view
     *
     * @namespace eZ
     * @class RawContentView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.RawContentView = Y.Base.create('rawContentView', Y.eZ.TemplateBasedView, [Y.eZ.AccordionElement], {
        events: {
            '.ez-raw-content-title': {
                'tap': '_collapseView'
            },
            '.ez-fieldgroup-name': {
                'tap': '_collapseFieldGroup'
            }
        },

        initializer: function () {
            /**
             * The field views instances for the current content
             *
             * @property _fieldViews
             * @protected
             * @default []
             * @type Array of {eZ.FieldView}
             */
            this._fieldViews = [];
            if ( this.get('contentType') ) {
                this._setFieldViews();
            }
            this.after('activeChange', this._forwardActive);

            this.after('*:switchLanguage', function (e) {
                this.set('languageCode', e.languageCode);
            });

            this.after('languageCodeChange', function () {
                this._setFieldViews();
                this.render();
                this._forwardActive();
            });
        },

        /**
         * Forwards the active flag to the field views.
         *
         * @method _forwardActive
         * @protected
         */
        _forwardActive: function () {
            this._fieldViews.forEach(function (v) {
                v.set('active', this.get('active'));
            }, this);
        },

        /**
         * Tap event handler to collapse/uncollapse the raw content view
         *
         * @method _collapseView
         * @protected
         * @param {Object} e event face of the tap event
         */
        _collapseView: function (e) {
            var container = this.get('container');

            e.preventDefault();
            this._collapse({
                collapsedClass: COLLAPSED_RAW_VIEW,
                detectElement: container,
                collapseElement: container.one('.ez-fieldgroups')
            });
        },

        /**
         * Tap event handler to collapse/uncollapse the field group
         *
         * @method _collapseFieldGroup
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _collapseFieldGroup: function (e) {
            var group = e.currentTarget.next('.ez-fieldgroup');

            e.preventDefault();
            this._collapse({
                collapsedClass: COLLAPSED_GROUP,
                collapsedHeight: COLLAPSED_GROUP_HEIGHT,
                collapseElement: group,
                callback: function () {
                    e.currentTarget.toggleClass(COLLAPSED_GROUP);
                }
            });
        },

        /**
         * Sets the field views for the current content
         *
         * @method _setFieldViews
         * @protected
         */
        _setFieldViews: function () {
            var definitions = this.get('contentType').get('fieldDefinitions'),
                content = this.get('content'),
                config = this.get('config');

            this._destroyFieldViews();
            Y.Object.each(definitions, function (def) {
                var View, fieldView,
                    field = content.getField(def.identifier, this.get('languageCode'));

                if (field) {
                    View = Y.eZ.FieldView.getFieldView(def.fieldType);
                    fieldView = new View({
                        fieldDefinition: def,
                        field: field,
                        content: this.get('content'),
                        contentType: this.get('contentType'),
                        config: config,
                    });
                    fieldView.addTarget(this);
                    this._fieldViews.push(fieldView);
                } else {
                    console.warn('Content doesn\'t contain field "' + def.identifier + '"');
                }
            }, this);
        },

        /**
         * Renders the raw content view
         *
         * @method render
         * @return {eZ.RawContentView} the view itself
         */
        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                content: this.get('content').toJSON(),
                fieldGroups: this.get('contentType').getFieldGroups(),
            }));

            container.one('.ez-language-switcher-container').append(
                this.get('languageSwitcherView').render().get('container')
            );

            this._renderFieldViews();
            return this;
        },

        /**
         * Renders the field views in the correct field group
         *
         * @protected
         * @method _renderFieldViews
         */
        _renderFieldViews: function () {
            var container = this.get('container');

            Y.Array.each(this._fieldViews, function (view) {
                var def = view.get('fieldDefinition');

                container.one('.ez-fieldgroup-' + def.fieldGroup).append(
                    view.render().get('container')
                );
            });
        },

        /**
         * Destroys the field views
         *
         * @method _destroyFieldViews
         * @private
         */
        _destroyFieldViews: function () {
            Y.Array.each(this._fieldViews, function (view) {
                view.destroy({remove: true});
            });
            this._fieldViews = [];
        },

        destructor: function () {
            this._destroyFieldViews();
        },
    }, {
        ATTRS: {
            /**
             * The location of the Content item being rendered
             *
             * @attribute location
             * @type Y.eZ.Location
             */
            location: {},

            /**
             * The rendered Content item
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            content: {},

            /**
             * The Content Type of the Content item
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             */
            contentType: {},

            /**
             * Language code of language currently active for the current location
             *
             * @attribute languageCode
             * @type String
             */
            languageCode: {},

            /**
             * Configure the language switcher view to fire an event when
             * switching language ('event' value) or to let the browser follow
             * the link to switch language ('navigate' value).
             *
             * @attribute languageSwitchMode
             * @type {String}
             * @default undefined
             * @writeOnce
             */
            languageSwitchMode: {
                writeOnce: 'initOnly',
            },

            /**
             * The language switcher view instance
             *
             * @attribute languageSwitcherView
             * @type eZ.LanguageSwitcherView
             */
            languageSwitcherView: {
                valueFn: function () {
                    return new Y.eZ.LanguageSwitcherView({
                        content: this.get('content'),
                        location: this.get('location'),
                        languageCode: this.get('languageCode'),
                        switchMode: this.get('languageSwitchMode'),
                        bubbleTargets: this
                    });
                }
            }
        }
    });
});
