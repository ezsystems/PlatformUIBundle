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
        IS_VISIBLE_CLASS = 'is-visible',
        IS_SHOWING_DESCRIPTION = 'is-showing-description',
        FIELD_INPUT = '.ez-editfield-input',
        TOOLTIP_DESCR = '.ez-field-description',
        STANDARD_DESCR = 'ez-standard-description',

        _events= {
            ".ez-editfield-input": {
                "keypress": "_checkValidityDescription",
                "mouseover": "_showDescription",
                "mouseout": "_hideDescription",
                "tap": "_showDescription",
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
                    contentType: this.get('contentType').toJSON(),
                },
                container = this.get('container');

            if (this._useStandardFieldDefinitionDescription) {
                container.addClass(STANDARD_DESCR);
            }
            this.get('container').setHTML(
                this.template(Y.mix(this._variables(), defaultVariables, true))
            );

            if ( this._isTouch() ) {
                container.addClass('is-using-touch-device');
            }

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
                    this._showDescription();
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
         * Check if the fieldValue is valid, and if it is, hide de description
         *
         * @method _checkValidityDescription
         * @protected
         */
        _checkValidityDescription: function () {
            if (this.isValid()) {
                this._hideDescription();
            }
        },

        /**
         * Show the field description
         *
         * @method _showDescription
         * @protected
         */
        _showDescription: function () {
            var container = this.get('container');

            if (this._handleFieldDescriptionVisibility) {
                if (this._isTouch() &&  container.one(TOOLTIP_DESCR)) {
                    this._setTooltipPosition(FIELD_INPUT);
                } else {
                    container.addClass(IS_SHOWING_DESCRIPTION);
                }
            }
        },

        /**
         * Set the description tooltip position.
         * The tooltip position is modified by it's height and is relative to the field input.
         *
         * @method _setTooltipPosition
         * @protected
         */
        _setTooltipPosition: function (fieldInputDomClass) {
            var container = this.get('container'),
                tooltip = container.one(TOOLTIP_DESCR),
                fieldInput = container.one(fieldInputDomClass),
                tooltipHeight;

            if (!tooltip.hasClass(IS_VISIBLE_CLASS)) {
                this._tooltipInitialPosition = tooltip.getXY();
                tooltipHeight = tooltip.get('offsetHeight');
                tooltip.setXY([ fieldInput.getX(), fieldInput.getY() - tooltipHeight]);
                tooltip.addClass(IS_VISIBLE_CLASS);
                this._attachedViewEvents.push(container.one(FIELD_INPUT).on('clickoutside', Y.bind(this._hideDescription, this)));
            }

        },

        /**
         * Hide the field description or the tooltip
         *
         * @method _hideDescription
         * @protected
         */
        _hideDescription: function () {
            var container = this.get('container'),
                tooltip = container.one(TOOLTIP_DESCR);

            if (this._handleFieldDescriptionVisibility) {
                container.removeClass(IS_SHOWING_DESCRIPTION);
                if (tooltip && this._isTouch()) {
                    tooltip.removeClass(IS_VISIBLE_CLASS);
                    tooltip.setXY(this._tooltipInitialPosition);
                    tooltip.detach('clickoutside');
                }
            }
        },

        /**
         * Custom initializer method, it sets the event handling on the
         * errorStatusChange event
         *
         * @method initializer
         */
        initializer: function () {
            Y.eZ.TemplateBasedView.registerPartial('ez_fielddescription_tooltip', 'fielddescription-tooltip-ez-partial');
            /**
             * Set if the fieldDefinition description is active or not.
             *
             * @property _handleFieldDescriptionVisibility
             * @protected
             * @type boolean
             * @default true
             */
            this._handleFieldDescriptionVisibility = true;

            /**
             * Set if the fieldDefinition description has the standard display.
             * Standard means it will use the ez-standard-description CSS rule from fieldedit.css
             *
             * @property _useStandardFieldDefinitionDescription
             * @protected
             * @type boolean
             * @default true
             */
            this._useStandardFieldDefinitionDescription = true;

            /**
             * Contains the initial X an Y position of a tooltip
             * This will be used to restore its position when vanishing
             *
             * @property _tooltipInitialPosition
             * @protected
             * @type array
             */
            this._tooltipInitialPosition = [];

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
         * The default implementation returns undefined. Returning undefined
         * means that the field should be ignored when saving the content.
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
         * reflecting the current user input. Returns undefined when the field
         * value should not be taken into account.
         *
         * @method getField
         * @return Object or undefined
         */
        getField: function () {
            var value = this._getFieldValue(),
                fieldDefinition = this.get('fieldDefinition'),
                mainLanguageCode = this.get('content').get('mainLanguageCode'),
                editLanguageCode = this.get('languageCode'),
                field;

            if ( L.isUndefined(value) ) {
                return undefined;
            }
            field = Y.clone(this.get('field'));
            field.fieldValue = value;
            field.languageCode = editLanguageCode;
            if (!fieldDefinition.isTranslatable) {
                field.languageCode = mainLanguageCode;
            }

            return field;
        },

        /**
         * Returns whether the current browser is a touch device or not
         *
         * @method _isTouch
         * @private
         * @return {Boolean}
         */
        _isTouch: function () {
            return Y.UA.touchEnabled;
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
             * The logged in user
             *
             * @attribute user
             * @type {eZ.User}
             * @required
             */
            user: {},

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @default null
             */
            contentType: {
                value: null
            },

            /**
             * The language code in which the content is edited.
             *
             * @attribute languageCode
             * @type {String}
             * @default null
             */
            languageCode: {
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
