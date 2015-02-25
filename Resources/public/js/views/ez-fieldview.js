/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fieldview', function (Y) {
    "use strict";
    /**
     * Provides the generic Field View class
     *
     * @module ez-fieldview
     */
    Y.namespace('eZ');

    var CONTAINER_CLASS_PREFIX = 'ez-fieldview-',
        FIELD_EMPTY_CLASS = CONTAINER_CLASS_PREFIX + 'is-empty';

    /**
     * The field view
     *
     * @namespace eZ
     * @class FieldView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.FieldView = Y.Base.create('fieldView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the field view. By default, it injects the field,
         * the fieldDefinition and the value of the field.
         *
         * @method render
         * @return {Y.eZ.FieldView} the view it self
         */
        render: function () {
            var container = this.get('container'),
                def = this.get('fieldDefinition'),
                isEmpty = this._isFieldEmpty(),
                defaultVariables = {
                    fieldDefinition: def,
                    field: this.get('field'),
                    value: this._getFieldValue(),
                    isEmpty: isEmpty,
                };

            container.addClass(CONTAINER_CLASS_PREFIX + def.fieldType.toLowerCase());
            if ( isEmpty ) {
                container.addClass(FIELD_EMPTY_CLASS);
            }
            container.setHTML(
                this.template(Y.mix(this._variables(), defaultVariables, true))
            );
            return this;
        },

        /**
         * Overrides the eZ.TemplateBasedView implementation to be make sure the
         * all field views have the correct class on the container even when
         * using a custom template.
         * Note: the render method adds a class based on the field type being
         * handled allowing to style the field views per field type.
         *
         * @method _generateViewClassName
         * @protected
         * @return {String}
         */
        _generateViewClassName: function (name) {
            return Y.eZ.TemplateBasedView.VIEW_PREFIX + Y.eZ.FieldView.NAME.toLowerCase();
        },

        /**
         * Returns the value to display
         *
         * @method _getFieldValue
         * @protected
         * @return {String}
         */
        _getFieldValue: function () {
            return this.get('field').fieldValue;
        },

        /**
         * Checks whether the field value is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return !this._getFieldValue();
        },

        /**
         * Returns an object containing the additional variables needed in the
         * field edit view template. The default implementation returns an empty
         * object
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            return {};
        },

    }, {
        ATTRS: {
            /**
             * The field definition of the displayed field
             *
             * @attribute fieldDefinition
             * @type {}
             */
            fieldDefinition: {},

            /**
             * The field being displayed
             *
             * @attribute field
             * @type {}
             */
            field: {},
        },

        /**
         * Hash containing the custom field view implementations for the
         * different field type identifier
         *
         * @property REGISTRY
         * @private
         * @static
         * @default {}
         */
        REGISTRY: {},

        /**
         * Registers a custom field view implementation for the given field type
         * identifier.
         *
         * @method registerFieldView
         * @static
         * @param {String} fieldTypeIdentifier
         * @param {Function} view the constructor function of the custom field
         * view implementation
         */
        registerFieldView: function (fieldTypeIdentifier, view) {
            Y.eZ.FieldView.REGISTRY[fieldTypeIdentifier] = view;
        },

        /**
         * Returns the view constructor for the given field type identifier. If
         * no custom implementation is registered, the Y.eZ.FieldView
         * constructor is returned
         *
         * @method getFieldView
         * @static
         * @param {String} fieldTypeIdentifier
         * @return {Function} the constructor of the field view
         */
        getFieldView: function (fieldTypeIdentifier) {
            var view = Y.eZ.FieldView.REGISTRY[fieldTypeIdentifier];

            if ( typeof view === 'function' ) {
                return view;
            }
            return Y.eZ.FieldView;
        },
    });
});
