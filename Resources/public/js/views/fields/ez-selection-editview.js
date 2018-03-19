/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selection-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Selection (ezselection) fields
     *
     * @module ez-selection-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezselection',
        IS_LIST_HIDDEN = 'is-list-hidden',
        IS_TOP_LIST = 'is-top-list';

    /**
     * Selection edit view. It uses the SelectionFilterView to provide a rich UI
     * to help selecting one or several items over a long list.
     *
     * @namespace eZ
     * @class SelectionEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.SelectionEditView = Y.Base.create('selectionEditView', Y.eZ.FieldEditView, [], {
        VALUES_TPL: '<li class="ez-selection-value" />',

        events: {
            '.ez-selection-values': {
                'tap': '_toggleShowSelectionUI',
            },
            '.ez-selection-value': {
                'tap': '_removeValue'
            },
        },

        /**
         * Initializes the selection edit view.
         *
         * @method initializer
         */
        initializer: function () {
            /**
             * The selection filter view instance. It is created when the view
             * is set as active.
             *
             * @property _selectionFilter
             * @protected
             * @type eZ.SelectionFilterView
             */
            this._selectionFilter = null;

            /**
             * Holds the clickoutside event handle.
             *
             * @property _clickoutsideHandler
             * @protected
             * @type {EventHandle}
             */
            this._clickoutsideHandler = null;
            this._useStandardFieldDefinitionDescription = false;

            this.after('activeChange', function (e) {
                if ( e.newVal ) {
                    this._initSelectionFilter();
                }
            });

            this._set('values', this._getSelectedTextValues());

            this.after('fieldChange', function (e) {
                this._set('values', this._getSelectedTextValues());
            });
            this.after('valuesChange', this._uiSyncSelectionValues);
            this.after('valuesChange', this._validateAddedRemovedValues);
            this.after('showSelectionUIChange', this._uiShowSelectionList);
        },

        /**
         * Renders the selection edit view.
         *
         * @method render
         */
        render: function () {
            this.get('container').addClass(IS_LIST_HIDDEN);
            return Y.eZ.FieldEditView.prototype.render.apply(this, arguments);
        },

        /**
         * Recreates the selection filter when the view is rerendered.
         *
         * @method _afterActiveReRender
         * @protected
         */
        _afterActiveReRender: function () {
            this._selectionFilter.destroy();
            this._clickoutsideHandler.detach();
            this._initSelectionFilter();
        },

        /**
         * Initializes and the selection filter view for the current
         * field/fieldDefinition. Once created, it is render right away.
         *
         * @method _initSelectionFilter
         * @protected
         */
        _initSelectionFilter: function () {
            this._selectionFilter = this._getSelectionFilter();

            this._selectionFilter.on('select', Y.bind(function (e) {

                if ( !this.get('isMultiple') ) {
                    this.set('showSelectionUI', false);
                }

                if ( Y.Object.keys(e.attributes).length === 1 ) {
                    this._addSelection(e.attributes.text);
                } else {
                    this._addSelection(e.attributes);
                }

            }, this));

            this._selectionFilter.on('unselect', Y.bind(function (e) {
                this._removeSelection(e.text);
            }, this));

            this._selectionFilter.render();
            this._clickoutsideHandler = this.get('container').one('.ez-selection-input-ui').on(
                'clickoutside', Y.bind(function (e) {
                    this.set('showSelectionUI', false);
                }, this)
            );
            this._attachedViewEvents.push(this._clickoutsideHandler);
        },

        /**
         * Returns the selection filter
         *
         * @method _getSelectionFilter
         * @protected
         * @return Y.eZ.SelectionFilterView
         */
        _getSelectionFilter: function () {
            var container = this.get('container'),
                selected = this._getSelectedTextValues(),
                input = container.one('.ez-selection-filter-input'),
                source = this._getSource();

            return new Y.eZ.SelectionFilterView({
                container: input.get('parentNode'),
                inputNode: input,
                listNode: this.get('container').one('.ez-selection-options'),
                selected: selected,
                source: source,
                filter: (source.length > 5),
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                isMultiple: this.get('isMultiple'),
            });
        },

        /**
         * Returns the selection source
         *
         * @method _getSource
         * @protected
         * @return {Array}
         */
        _getSource: function () {
            return this.get('fieldDefinition').fieldSettings.options;
        },

        /**
         * Returns an array of the values stored by the field being edited.
         *
         * @method _getSelectedTextValues
         * @protected
         * @return {Array}
         */
        _getSelectedTextValues: function () {
            var field = this.get('field'),
                fieldDefinition = this.get('fieldDefinition'),
                valueIndexes = [],
                options = [],
                res = [];

            if ( field && field.fieldValue ) {
                valueIndexes = field.fieldValue;
            }
            if ( fieldDefinition && fieldDefinition.fieldSettings.options ) {
                options = fieldDefinition.fieldSettings.options;
            }

            Y.Array.each(valueIndexes, function (index) {
                if (index in options) {
                    res.push(options[index]);
                } else {
                    res.push(Y.eZ.trans('select.option.does.not.exist', {}, 'fieldedit'));
                }
            });
            return res;
        },

        /**
         * Adds the value to list of the currently selected values
         *
         * @method _addSelection
         * @protected
         * @param {String|Object}  value
         */
        _addSelection: function (value) {
            var values = this.get('values');

            values.push(value);
            this._set('values', values, {"added": value});
        },

        /**
         * Removes the value from the list of the currently selected values
         *
         * @method _removeSelection
         * @protected
         * @param {String} value
         * @param {Node} [node] the node storing the value in the list
         */
        _removeSelection: function (value, node) {
            var values = this.get('values');

            values = Y.Array.reject(values, function (val) {
                return (typeof val === 'object' ? val.text === value : val === value);
            });

            this._selectionFilter.unselect(value);
            this._set('values', values, {
                "removed": value,
                "node": node || null
            });
        },

        /**
         * Event handler for the tap event on a selected value. It removes the
         * tapped value from the selected list
         *
         * @param {Object} e event facade
         * @method _removeValue
         * @protected
         */
        _removeValue: function (e) {
            if (this.get('isNotTranslatable')) {
                return;
            }

            this._removeSelection(e.target.getAttribute('data-text'), e.target);
        },

        destructor: function () {
            if ( this._selectionFilter ) {
                this._selectionFilter.destroy();
                delete this._selectionFilter;
            }
        },

        /**
         * Event handler for the tap event on selection UI to display/hide the
         * selection filter
         *
         * @param {Object} e event facade
         * @method _toggleShowSelectionUI
         * @protected
         */
        _toggleShowSelectionUI: function (e) {
            if (this.get('isNotTranslatable')) {
                return;
            }

            if ( !e.target || !e.target.hasClass('ez-selection-value') ) {
                this.set('showSelectionUI', !this.get('showSelectionUI'));
            }
        },

        /**
         * Returns true if the selection filter list should appear on top of the
         * selection
         *
         * @method _isTopList
         * @private
         * @return Boolean
         */
        _isTopList: function () {
            var c = this._selectionFilter.get('container'),
                bottomSpace;

            bottomSpace = c.get('winHeight') + c.get('docScrollY') - Math.round(c.getY());
            return c.get('offsetHeight') > bottomSpace;
        },

        /**
         * Event handler for the showSelectionUIChange event. It displays/hides
         * the selection fitler depending on the new value of the
         * showSelectionUI attribute.
         *
         * @method _uiShowSelectionList
         * @protected
         * @param {Object} event facade
         */
        _uiShowSelectionList: function (e) {
            var container = this.get('container');

            if ( e.newVal ) {
                if ( this._isTopList() ) {
                    container.addClass(IS_TOP_LIST);
                } else {
                    container.removeClass(IS_TOP_LIST);
                }
                container.removeClass(IS_LIST_HIDDEN);
                this._selectionFilter.resetFilter();
                this._selectionFilter.focus();
            } else {
                this._selectionFilter.resetFilter();
                container.addClass(IS_LIST_HIDDEN);
            }
            this.validate();
        },

        /**
         * Event handler for the valuesChange event. It makes sure the displayed
         * selected values are in sync where the actual selection.
         *
         * @method _uiSyncSelectionValues
         * @protected
         * @param {Object} e event facade
         */
        _uiSyncSelectionValues: function (e) {
            var selectionValues = this.get('container').one('.ez-selection-values'),
                node;

            if ( e.added ) {
                if ( typeof e.added === "object" ) {
                    node = Y.Node.create(this.VALUES_TPL).setContent(e.added.text);
                    Y.Object.each(e.added, function (value, key) {
                        node.setAttribute('data-' + key, value);
                    });
                } else {
                    node = Y.Node.create(this.VALUES_TPL).setContent(e.added);
                    node.setAttribute('data-text', e.added);
                }
                selectionValues.append(node);
            } else if ( e.removed ) {
                if ( e.node ) {
                    node = e.node;
                } else {
                    node = selectionValues.one('.ez-selection-value[data-text="' + e.removed + '"]');
                }
                node.remove(true);
            }
        },

        /**
         * Check if there is a value that has been added or removed with the event facade.
         * If it is, then call validate().
         *
         * @method _validateAddedRemovedValues
         * @protected
         * @param {Object} e event facade
         */
        _validateAddedRemovedValues: function (e) {
            if ( e.added || e.removed ) {
                this.validate();
            }
        },

        /**
         * Validates the current state of the selection. A selection is invalid
         * if it's required and empty.
         *
         * @method validate
         */
        validate: function () {
            if (
                this.get('fieldDefinition').isRequired
                && this.get('values').length === 0
            ) {
                this.set('errorStatus', 'This field is required');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Defines the variables to imported in the field edit template.
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired, isMultiple and selected
         * entries
         */
        _variables: function () {
            var def = this.get('fieldDefinition');

            return {
                "isRequired": def.isRequired,
                "selected": this.get('values'),
                "isMultiple": this.get('isMultiple'),
            };
        },

        /**
         * Returns the field value. The selection field value is an array
         * containing the indexes of the selected values in the field definition
         * options field settings.
         *
         * @protected
         * @method _getFieldValue
         * @return Array
         */
        _getFieldValue: function () {
            var values = this.get('values'),
                options =  this.get('fieldDefinition').fieldSettings.options,
                res = [];

            Y.Array.each(values, function (val) {
                res.push(options.indexOf(val));
            }, this);

            return res;
        }
    }, {
        ATTRS: {
            /**
             * The text values of the selected options
             *
             * @attribute values
             * @readonly
             * @default []
             * @type Array
             */
            values: {
                readOnly: true,
                value: []
            },

            /**
             * Whether the selection filter should be shown
             *
             * @attribute showSelectionUI
             * @type boolean
             * @default false
             */
            showSelectionUI: {
                value: false,
            },

            /**
             * Whether the field accepts several values
             *
             * @attribute isMultiple
             * @readonly
             * @type boolean
             */
            isMultiple: {
                readOnly: true,
                getter: function () {
                    return this.get('fieldDefinition').fieldSettings.isMultiple;
                },
            }
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.SelectionEditView
    );
});
