/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-fieldeditview', function (Y) {
    "use strict";
    /**
     * Provides the base class for the field edit views
     *
     * @module ez-fieldeditview
     */

    Y.namespace('eZ');

    var L = Y.Lang,
        FIELD_INFO_ICON_SEL = '.ez-editfield-i',
        TOOLTIP_SEL = '.ez-fielddefinition-tooltip',
        TOOLTIP_TAIL_UP_CLASS = 'ez-tail-up-tooltip',
        TOOLTIP_TAIL_DOWN_CLASS = 'ez-tail-down-tooltip',
        IS_DISPLAYED_CLASS = 'is-displayed',
        IS_VISIBLE_CLASS = 'is-visible',
        _events= {
            ".ez-editfield-i": {
                "tap": "_showTooltip"
            },
            ".ez-fielddefinition-tooltip-close": {
                "tap": "_handleCloseTooltipTap"
            }
        };

    /**
     * Field Edit View. This is an *abstract* class, so it's not supposed to be
     * used directly.
     *
     * @namespace eZ
     * @class FieldEditView
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.FieldEditView = Y.Base.create('fieldEditView', Y.eZ.TemplateBasedView, [], {
        /**
         * Contains the default content of the error message placeholder. It
         * is used to restore the error placeholder when the view switches
         * from the error state to the normal state.
         *
         * @property _errorDefaultContent
         * @protected
         * @type string
         */
        _errorDefaultContent: '',

        /**
         * Contains the class to add/remove on/from the container when an error
         * is detected.
         *
         * @property _errorClass
         * @protected
         * @type string
         * @default 'is-error'
         */
        _errorClass: 'is-error',

        /**
         * Default implementation of the field edit view render. By default, it
         * injects the field definition, the field, the content and the content
         * type
         *
         * @method render
         * @return {eZ.FieldEditView}
         */
        render: function () {
            var defaultVariables = {
                    fieldDefinition: this.get('fieldDefinition'),
                    field: this.get('field'),
                    content: this.get('content').toJSON(),
                    version: this.get('version').toJSON(),
                    contentType: this.get('contentType').toJSON()
                };

            this.get('container').setHTML(
                this.template(Y.mix(this._variables(), defaultVariables, true))
            );
            return this;
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

        /**
         * Reflects in the UI the errorStatus change
         *
         * @method _errorUI
         * @protected
         * @param {Object} e the event facade of the errorStatusChange event
         */
        _errorUI: function (e) {
            var container = this.get('container');

            if ( e.newVal ) {
                container.addClass(this._errorClass);
                if ( L.isString(e.newVal) ) {
                    this._errorDefaultContent = container.one('.ez-editfield-error-message').getContent();
                    this._setErrorMessage(e.newVal);
                }
            } else {
                container.removeClass(this._errorClass);
                if ( this._errorDefaultContent ) {
                    this._setErrorMessage(this._errorDefaultContent);
                }
            }
        },

        /**
         * Sets the error message in UI
         *
         * @method _setErrorMessage
         * @protected
         * @param {String} msg the error message
         */
        _setErrorMessage: function (msg) {
            this.get('container').one('.ez-editfield-error-message').setContent(msg);
        },

        /**
         * Show the tooltip taking into account distance between it's supposed
         * position and bottom of the screen
         *
         * @method _showTooltip
         * @protected
         */
        _showTooltip: function () {
            var container = this.get('container'),
                tooltip = container.one(TOOLTIP_SEL),
                infoIcon = container.one(FIELD_INFO_ICON_SEL),
                tooltipHeight;

            tooltip.addClass(IS_DISPLAYED_CLASS);

            if (this._tooltipFitsTailUp()) {
                // making sure, that the default tail state is in place
                // and removing changes to the tooltip position (if any)
                if (tooltip.hasClass(TOOLTIP_TAIL_DOWN_CLASS)) {
                    tooltip.addClass(TOOLTIP_TAIL_UP_CLASS);
                    tooltip.removeClass(TOOLTIP_TAIL_DOWN_CLASS);
                    tooltip.setStyle('top', 'auto');
                }
            } else {
                // switching tooltip to the tail-down state
                tooltip.addClass(TOOLTIP_TAIL_DOWN_CLASS);
                tooltip.removeClass(TOOLTIP_TAIL_UP_CLASS);
                tooltipHeight = parseInt(tooltip.getComputedStyle('height'), 10);
                tooltip.setY(infoIcon.getY() - tooltipHeight);
            }
            tooltip.addClass(IS_VISIBLE_CLASS);
            this._attachedViewEvents.push(tooltip.on('clickoutside', Y.bind(this._handleClickOutside, this)));
        },

        /**
         * Hides the tooltip
         *
         * @method _hideTooltip
         * @protected
         */
        _hideTooltip: function () {
            var tooltip = this.get('container').one(TOOLTIP_SEL);

            tooltip.removeClass(IS_VISIBLE_CLASS);
            tooltip.removeClass(IS_DISPLAYED_CLASS);
            tooltip.detach('clickoutside');
        },

        /**
         * Considers tooltip's height and position on the screen to decide if it
         * fits on the screen in current conditions
         *
         * @method _tooltipFitsTailUp
         * @protected
         * @return {boolean} true, if the tooltip fits in tail-up state
         */
        _tooltipFitsTailUp: function () {
            var container = this.get('container'),
                tooltip = container.one(TOOLTIP_SEL),
                infoIcon = container.one(FIELD_INFO_ICON_SEL),
                screenHeight = container.get('winHeight'),
                scrollHeight = container.get('docScrollY'),
                tooltipHeight = parseInt(tooltip.getComputedStyle('height'), 10),
                infoIconHeight = parseInt(infoIcon.getComputedStyle('height'), 10);

            return (infoIcon.getY() - scrollHeight + infoIconHeight + tooltipHeight < screenHeight);
        },

        /**
         * Event handler for a tap on the "close" link of a tooltip
         *
         * @method _handleCloseTooltipTap
         * @param e {Object} Event facade object
         * @protected
         */
        _handleCloseTooltipTap: function (e) {
            e.preventDefault();
            this._hideTooltip();
        },

        /**
         * Event handler for a click anywhere outside of the tooltip
         *
         * @method _handleClickOutside
         * @param e {Object} Event facade object
         * @protected
         */
        _handleClickOutside: function (e) {
            if (e.target.generateID() != this.get('container').one(FIELD_INFO_ICON_SEL).generateID()) {
                this._hideTooltip();
            }
        },

        /**
         * Custom initializer method, it sets the event handling on the
         * errorStatusChange event
         *
         * @method initializer
         */
        initializer: function () {
            Y.eZ.TemplateBasedView.registerPartial('ez_fieldinfo_tooltip', 'fieldinfo-tooltip-ez-partial');
            this.after('errorStatusChange', this._errorUI);

            this.events = Y.merge(_events, this.events);
        },

        /**
         * Checks whether the current user input is valid or not. This methood
         * should be implemented by each field edit view and is supposed to
         * set the `errorStatus` attribute.
         *
         * The default implementation does nothing.
         *
         * @method validate
         */
        validate: function () {
        },

        /**
         * Returns whether the view is currently in a valid state
         *
         * @method isValid
         * @return boolean
         */
        isValid: function () {
            return this.get('errorStatus') === false;
        },

        /**
         * Returns the value of the field from the current user input. This
         * method should be implemented in each field edit view.
         *
         * The default implementation returns undefined.
         *
         * @method _getFieldValue
         * @protected
         * @return mixed
         */
        _getFieldValue: function () {
            console.error(
                'Error: _getFieldValue() is not implemented in ' + this.constructor.NAME
            );
            return undefined;
        },

        /**
         * Returns an updated version of the field containing a field value
         * reflecting the current user input
         *
         * @method getField
         * @return Object
         */
        getField: function () {
            var field = Y.clone(this.get('field'));

            field.fieldValue = this._getFieldValue();
            return field;
        },
    }, {
        ATTRS: {
            /**
             * The validation error status. A truthy value means there's an
             * error. Setting this attribute to a non empty string will add this
             * string as an error message (under the field name by default)
             *
             * @attribute errorStatus
             * @type mixed
             * @default false
             */
            errorStatus: {
                value: false
            },

            /**
             * The field definition of the field to edit
             *
             * @attribute fieldDefinition
             * @type Object
             * @default null
             */
            fieldDefinition: {
                value: null
            },

            /**
             * The field to edit
             *
             * @attribute field
             * @type Object
             * @default null
             */
            field: {
                value: null
            },

            /**
             * The content the field to edit belongs to
             *
             * @attribute content
             * @type {eZ.Content}
             * @default null
             */
            content: {
                value: null
            },

            /**
             * The version the field to edit belongs to
             *
             * @attribute version
             * @type {eZ.Version}
             * @default null
             */
            version: {
                value: null
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @default null
             */
            contentType: {
                value: null
            }
        },

        /**
         * Registry of all registered field edit views indexed by field type
         * identifier
         *
         * @property
         * @private
         * @type Object
         * @default {}
         */
        REGISTRY: {},

        /**
         * Registers a field edit view for the given field type identifier
         *
         * @method registerFieldEditView
         * @static
         * @param {String} fieldTypeIdentifier the field type identifier
         *                 (ezstring, eztext, ...)
         * @param {Function} editView the constructor function of the field edit
         *                   view
         */
        registerFieldEditView: function (fieldTypeIdentifier, editView) {
            Y.eZ.FieldEditView.REGISTRY[fieldTypeIdentifier] = editView;
        },

        /**
         * Returns the field edit view constructor for the given field type identifier.
         * Throw a TypeError if no field edit view is registered for it
         *
         * @method getFieldEditView
         * @static
         * @param {String} fieldTypeIdentifier the field type identifier
         *                 (ezstring, eztext, ...)
         * @return {Function}
         */
        getFieldEditView: function (fieldTypeIdentifier) {
            var view = Y.eZ.FieldEditView.REGISTRY[fieldTypeIdentifier];

            if ( typeof view === 'function' ) {
                return view;
            }
            throw new TypeError("No implementation of Y.eZ.FieldEditView for " + fieldTypeIdentifier);
        }
    });
});
