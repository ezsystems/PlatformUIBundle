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
            this._setFieldViews();
            this.after('activeChange', function (e) {
                Y.Array.each(this._fieldViews, function (v) {
                    v.set('active', e.newVal);
                });
            });
        },

        /**
         * Tap event handler to collapse/uncollapse the raw content view
         *
         * @method _collapseView
         * @protected
         * @param {Object} event face of the tap event
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
         * @param {Object} event facade of the tap event
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
                views = [],
                config = this.get('config');

            Y.Object.each(definitions, function (def) {
                var View, fieldView, fieldConfig;

                if (config && config.fieldViews && config.fieldViews[def.fieldType]) {
                    fieldConfig = config.fieldViews[def.fieldType];
                }

                View = Y.eZ.FieldView.getFieldView(def.fieldType);
                fieldView = new View({
                    fieldDefinition: def,
                    field: content.getField(def.identifier),
                    config: fieldConfig,
                });
                fieldView.addTarget(this);
                views.push(
                    fieldView
                );
            }, this);

            /**
             * The field views instances for the current content
             *
             * @property _fieldViews
             * @default []
             * @type Array of {eZ.FieldView}
             */
            this._fieldViews = views;
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

        destructor: function () {
            Y.Array.each(this._fieldViews, function (view) {
                view.destroy();
            });
        },
    }, {
        ATTRS: {
            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             * @writeOnce
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             */
            contentType: {
                writeOnce: "initOnly",
            },

            /**
             * The config at the current location
             *
             * @attribute config
             * @type Mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            }
        }
    });
});
