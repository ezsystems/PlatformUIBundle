/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistitemview', function (Y) {
    "use strict";
    /**
     * Provides the subitem list item view.
     *
     * @module ez-subitemlistitemview
     */
    Y.namespace('eZ');

    var PRIORITY_CELL = 'ez-subitem-hovered-priority-cell',
        PRIORITY_ERROR = 'ez-subitem-error-priority-cell',
        PRIORITY_SELECTED = 'ez-subitem-selected-priority-cell';

    /**
     * The subitem list item view.
     *
     * @namespace eZ
     * @class SubitemListItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemListItemView = Y.Base.create('subitemListItemView', Y.eZ.TemplateBasedView, [Y.eZ.TranslateProperty], {
        events: {
            '.ez-subitemlistitem-priority': {
                'mouseover': '_displayEditIcon',
                'mouseout': '_hideEditIcon',
                'tap': '_startPriorityEdit',
            },
            '.ez-subitem-priority-input': {
                'blur': '_validatePriority',
                'valuechange': '_validatePriority',
            },
            '.ez-subitem-priority-cancel': {
                'tap': '_restorePriorityCell',
            },
            '.ez-subitem-priority-form': {
                'submit': '_setPriority'
            },
        },

        initializer: function () {
            this.containerTemplate = '<tr class="' + this._generateViewClassName(this._getName()) + '"/>';

            this.after('editingPriorityChange', function (e) {
                if ( this.get('editingPriority') ) {
                    this._displayPriorityButtons();
                } else {
                    this._hidePriorityButtons();
                }
            });
        },

        render: function () {
            this.get('container').setHTML(this.template({
                properties: this._getProperties(),
                location: this.get('location').toJSON(),
                content: this.get('content').toJSON(),
                contentType: this.get('contentType').toJSON(),
            }));
            return this;
        },

        /**
         * Returns the property object from its identifier. A property object
         * describes the property of the content struct to display, it contains:
         *
         * * the `identifier`
         * * the `class` to add to the cell
         * * the formated `value`
         * * optionnally the value already rendered in `rendered`
         *
         * @method _getProperty
         * @protected
         * @param {String} propertyIdentifier
         * @return {Object}
         */
        _getProperty: function (propertyIdentifier) {
            var propertyDesc = this.get('availableProperties')[propertyIdentifier],
                property = {
                    "identifier": propertyIdentifier,
                    "class": "ez-subitemlistitem-cell ez-subitemlistitem-" + propertyIdentifier.toLowerCase(),
                };

            property.value = this._getFunction(propertyDesc.extractor).call(this, propertyIdentifier);
            if ( propertyDesc.formatter ) {
                property.value = this._getFunction(propertyDesc.formatter).call(this, property);
            }
            if ( propertyDesc.template ) {
                property.rendered = this._renderProperty(propertyDesc.template, property);
            }
            return property;

        },

        /**
         * Returns the array of property object for the properties to display.
         *
         * @method _getProperties
         * @return {Array}
         * @protected
         */
        _getProperties: function () {
            return this.get('displayedProperties').map(function (propertyIdentifier) {
                return this._getProperty(propertyIdentifier);
            }, this);
        },

        /**
         * Renders the property with the template which id is `tplId`.
         *
         * @method _renderProperty
         * @protected
         * @param {String} tplId
         * @param {Object} property
         * @return {String}
         */
        _renderProperty: function (tplId, property) {
            var template = Y.Template.get(tplId);

            return template({
                property: property,
                content: this.get('content').toJSON(),
                location: this.get('location').toJSON(),
                contentType: this.get('contentType').toJSON(),
            });
        },

        /**
         * Finds and returns a method by its name or `fn` if it's already a
         * function
         *
         * @method _getFunction
         * @private
         * @param {String|Function} fn
         * @return {Function}
         */
        _getFunction: function (fn) {
            if ( typeof fn !== "function" ) {
                fn = this[fn];
            }
            return fn;
        },

        /**
         * Returns an attribute value of the Content item
         *
         * @method _getContentAttribute
         * @protected
         * @param {String} attr
         * @return Mixed
         */
        _getContentAttribute: function (attr) {
            return this.get('content').get(attr);
        },

        /**
         * Returns the name of the content type
         *
         * @method _getContentTypeName
         * @protected
         * @return {String}
         */
        _getContentTypeName: function () {
            return this.translateProperty(
                this.get('config').localesMap,
                this.get('contentType').get('names')
            );
        },

        /**
         * Returns an attribut value of the Location
         *
         * @method _getLocationAttribute
         * @protected
         * @param {String} attr
         * @return Mixed
         */
        _getLocationAttribute: function (attr) {
            return this.get('location').get(attr);
        },

        /**
         * Returns the translations list
         *
         * @method _getTranslations
         * @protected
         * @return {Array} array of language codes in which the content is
         * translated
         */
        _getTranslations: function () {
            return this.get('content').get('currentVersion').getTranslationsList();
        },

        /**
         * Formats a date to human readable string.
         *
         * @method _formatDate
         * @protected
         * @param {Object} property
         * @return {String}
         */
        _formatDate: function (property) {
            var date = property.value;

            return date.toLocaleDateString(
                'en', {year: "numeric", month: "short", day: "numeric"}
            ) + ' ' + date.toLocaleTimeString(
                'en', {hour: '2-digit', minute: '2-digit', hour12: true}
            );
        },

        /**
         * Formats the translations list to a string suitable for the template
         *
         * @method _formatTranslations
         * @param {Object} property a translations property
         * @protected
         * @return {String}
         */
        _formatTranslations: function (property) {
            return property.value.join(', ');
        },

        /**
         * Displays the edit icon to inform the user input can be edited.
         *
         * @method _displayEditIcon
         * @protected
         */
        _displayEditIcon: function () {
            if ( this.get('canEditPriority') ) {
                this._getPriorityCell().addClass(PRIORITY_CELL);
            }
        },

        /**
         * Hides the edit icon
         *
         * @method _hideEditIcon
         * @protected
         */
        _hideEditIcon: function () {
            this._getPriorityCell().removeClass(PRIORITY_CELL);
        },

        /**
         * Starts the priority edit by setting the `editingPriority` to true (if
         * possible).
         *
         * @method _startPriorityEdit
         * @protected
         */
        _startPriorityEdit: function () {
            if ( this.get('canEditPriority') ) {
                this.set('editingPriority', true);
            }
        },

        /**
         * Ends the priority edit by setting the `editingPriority` to false.
         *
         * @protected
         * @method _endPriorityEdit
         */
        _endPriorityEdit: function () {
            this.set('editingPriority', false);
        },

        /**
         * Shows the error icon to inform the user input is not correctly filled.
         *
         * @method _displayErrorIcon
         * @protected
         */
        _displayErrorIcon: function () {
            this._getPriorityCell()
                .addClass(PRIORITY_ERROR)
                .removeClass(PRIORITY_SELECTED);
        },

        /**
         * Hides the error icon.
         *
         * @method _hideErrorIcon
         * @protected
         */
        _hideErrorIcon: function () {
            this._getPriorityCell()
                .removeClass(PRIORITY_ERROR)
                .addClass(PRIORITY_SELECTED);
        },

        /**
         * Displays the 'validate' & 'cancel' buttons
         *
         * @method _displayPriorityButtons
         * @protected
         */
        _displayPriorityButtons: function () {
            this._getPriorityCell().addClass(PRIORITY_SELECTED);
            this._getPriorityInput().removeAttribute('readonly');
        },

        /**
         * `tap` event handler on the cancel button. It makes sure to restore
         * the state of the priority cell.
         *
         * @method _restorePriorityCell
         * @protected
         * @param {Object} e event facade
         */
        _restorePriorityCell: function (e) {
            e.preventDefault();
            this._restorePriorityValue();
            this._endPriorityEdit();
        },

        /**
         * Restores the input value with the priority of the location
         *
         * @method _restorePriorityValue
         * @protected
         */
        _restorePriorityValue: function () {
            var input = this._getPriorityInput();

            input.set('value', this.get('location').get('priority'));
            input.setAttribute('readonly', 'readonly');
        },

        /**
         * Hides the validate and cancel buttons displayed while editing priority
         *
         * @method _hidePriorityButtons
         * @protected
         */
        _hidePriorityButtons: function () {
            this._getPriorityCell().removeClass(PRIORITY_SELECTED);
            this._getPriorityInput().setAttribute('readonly', 'readonly');
        },

        /**
         * `submit` event handler to change the priority of the Location
         *
         * @method _setPriority
         * @protected
         * @param {Object} e event facade
         */
        _setPriority: function (e) {
            e.preventDefault();
            this.fire('updatePriority', {
                location: this.get('location'),
                priority: this._getPriorityInput().get('value')
            });
            this._endPriorityEdit();
        },

        /**
         * Validates the priority input
         *
         * @method _validatePriority
         * @protected
         */
        _validatePriority: function () {
            var validity;
            
            if ( this.get('editingPriority') ) {
                validity = this._getPriorityInput().get('validity');

                if ( validity.patternMismatch || validity.valueMissing ) {
                    this._displayErrorIcon();
                } else {
                    this._hideErrorIcon();
                }
            }
        },

        /**
         * Returns the priority cell
         *
         * @method _getPriorityCell
         * @return {Node}
         */
        _getPriorityCell: function () {
            return this.get('container').one('.ez-subitemlistitem-priority');
        },

        /**
         * Returns the priority input
         *
         * @method _getPriorityInput
         * @return {Node}
         */
        _getPriorityInput: function (inputId) {
            return this.get('container').one('.ez-subitem-priority-input');
        },
    }, {
         ATTRS: {
            /**
             * True is the priority of the Location is being edited
             *
             * @attribute editingPriority
             * @default false
             * @type Boolean
             */
             editingPriority: {
                value: false,
             },

             /**
              * True is the priority of the Location can be edited
              *
              * @attribute canEditPriority
              * @default true
              * @type Boolean
              */
             canEditPriority: {
                 value: true,
             },

             /**
              * The content type of the content item being displayed
              *
              * @attribute contentType
              * @type {eZ.ContentType}
              */
             contentType: {},

             /**
              * The location of the content item being displayed
              *
              * @attribute location
              * @type {eZ.Location}
              */
             location: {},

             /**
              * The content item being displayed
              *
              * @attribute content
              * @type {eZ.Content}
              */
             content: {},

             /**
              * The properties to display
              *
              * @attribute displayedProperties
              * @type {Array}
              */
             displayedProperties: {},

             /**
              * Lists the available porperties to display and the corresponding
              * configuration for `_getProperty` to extract, format and
              * optionnally render the property. The object keys are the property
              * identifiers. Each entry in this object is an object with:
              *
              * * `extractor`: a function or a method name to extract the value.
              * This function receives the property identifier as a parameter.
              * * [optional] `formatter`: a function or a method name to format
              * the value. This function receives the property identifier as a
              * parameter.
              * * [optional] `template`: a template id to directly render the
              * property. The template receives the corresponding property
              * object, the Location, the Content item and the Content type
              * objects.
              *
              * @attribute availableProperties
              * @type Object
              * @readOnly
              */
             availableProperties: {
                 readOnly: true,
                 value: {
                     'name': {
                         'extractor': '_getContentAttribute',
                         'template': 'subitemlistitem-name-ez-template',
                     },
                     'lastModificationDate': {
                         'extractor': '_getContentAttribute',
                         'formatter': '_formatDate',
                     },
                     'contentType': {
                         'extractor': '_getContentTypeName',
                     },
                     'priority': {
                         'extractor': '_getLocationAttribute',
                         'template': 'subitemlistitem-priority-ez-template',
                     },
                     'translations': {
                         'extractor': '_getTranslations',
                         'formatter': '_formatTranslations',
                     },
                     'locationId': {
                         'extractor': '_getLocationAttribute',
                     },
                     'mainLanguageCode': {
                         'extractor': '_getContentAttribute',
                     },
                 },
             },
         },
    });
});
