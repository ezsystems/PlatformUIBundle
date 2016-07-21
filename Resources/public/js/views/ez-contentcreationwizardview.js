/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardview', function (Y) {
    "use strict";
    /**
     * Provides the content creation wizard view class
     *
     * @method ez-contentcreationwizardview
     */

    var SELECTED_TYPE_EVT = 'selectedContentType',
        LOCATION_CHOSEN_CLASS = 'is-location-chosen',
        STEP_CONTENTTYPE = 'contenttype',
        STEP_LOCATION = 'location';

    /**
     * The content creation wizard view.
     *
     * @namespace eZ
     * @class ContentCreationWizardView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentCreationWizardView = Y.Base.create('contentCreationWizardView', Y.eZ.TemplateBasedView, [Y.eZ.TranslateProperty], {
        events: {
            '.ez-contentcreationwizard-close': {
                'tap': '_closeWizard',
            },
            '.ez-contentcreationwizard-next': {
                'tap': '_moveToStepLocation',
            },
            '.ez-contentcreationwizard-back': {
                'tap': '_moveToStepContentType',
            },
            '.ez-contentcreationwizard-contenttype-name': {
                'tap': '_moveToStepContentType',
            },
            '.ez-contentcreationwizard-pick-location': {
                'tap': '_pickLocation',
            },
            '.ez-contentcreationwizard-finish': {
                'tap': '_endWizard',
            },
        },

        initializer: function () {
            this.after('*:' + SELECTED_TYPE_EVT, this._storeContentType);
            this.after('selectedContentTypeChange', this._uiSetButtonsState);
            this.after('selectedParentLocationChange', this._uiSetLocation);
            this.after('stepChange', this._uiSetStep);
            this.after('activeChange', function (e) {
                if ( !this.get('active') ) {
                    this._resetState();
                } else {
                    this._set('step', STEP_CONTENTTYPE);
                    this._renderContentTypeSelector();
                }
            });
        },

        /**
         * tap event hander on the finish button. It fires the
         * `contentCreationWizardEnding` event with the result of the wizard.
         *
         * @method _endWizard
         * @protected
         */
        _endWizard: function () {
            /**
             * Fired when the content creation wizard ends with a selected
             * Content Type and a selected Parent Location.
             *
             * @event contentCreationWizardEnding
             * @param {eZ.ContentType} contentType
             * @param {eZ.Location} parentLocation
             */
            this.fire('contentCreationWizardEnding', {
                contentType: this.get('selectedContentType'),
                parentLocation: this.get('selectedParentLocation'),
            });
        },

        /**
         * Launches the UDW to select the parent Location of the future Content
         * item.
         *
         * @method _pickLocation
         * @protected
         */
        _pickLocation: function () {
            var startingLocationId = false;

            if ( this.get('selectedParentLocation') ) {
                startingLocationId = this.get('selectedParentLocation').get('id');
            }
            this.fire('contentDiscover', {
                config: {
                    title: 'Select a parent Location for the new Content item',
                    contentDiscoveredHandler: Y.bind(this._storeLocation, this),
                    startingLocationId: startingLocationId,
                    isSelectable: function (struct) {
                        return struct.contentType.get('isContainer');
                    },
                },
            });
        },

        /**
         * UDW `contentDiscoveredHandler` to store the selected Location in the
         * `selectedParentLocation` attribute.
         *
         * @method _storeLocation
         * @protected
         * @param {EventFacade} e
         */
        _storeLocation: function (e) {
            this._set('selectedParentLocation', e.selection.location);
        },

        /**
         * Returns the node used to display the Content name.
         *
         * @method _getContentNameNode
         * @private
         */
        _getContentNameNode: function () {
            return this.get('container').one('.ez-contentcreationwizard-content-name');
        },

        /**
         * Reflects in the UI the new selected Location
         *
         * @method _uiSetLocation
         * @protected
         */
        _uiSetLocation: function () {
            var container = this.get('container'),
                location = this.get('selectedParentLocation');

            if ( location ) {
                container.addClass('is-location-chosen');
                this._getContentNameNode().setContent(
                    location.get('contentInfo').get('name')
                );
            } else {
                container.removeClass(LOCATION_CHOSEN_CLASS);
                this._getContentNameNode().setContent('');
            }

            this._uiSetFinishButtonState();
        },

        /**
         * `selectedContentType` event handler to store the selected Content
         * Type.
         *
         * @method _storeContentType
         * @protected
         * @param {EventFacade} e
         */
        _storeContentType: function (e) {
            this._set('selectedContentType', e.contentType);
        },

        /**
         * Changes the step to the choose Location step.
         *
         * @method _moveToStepLocation
         * @protected
         */
        _moveToStepLocation: function () {
            this._set('step', STEP_LOCATION);
        },

        /**
         * Changes the step to the choose Content Type step
         *
         * @method _moveToStepContentType
         * @protected
         */
        _moveToStepContentType: function () {
            this._set('step', STEP_CONTENTTYPE);
        },

        /**
         * Updates the state of the Next and Finish buttons.
         *
         * @method _uiSetButtonsState
         * @protected
         */
        _uiSetButtonsState: function () {
            this._uiSetNextButtonState();
            this._uiSetFinishButtonState();
        },

        /**
         * Enables or disables the Next button depending on the
         * `selectedContentType` attribute value.
         *
         * @method _uiSetNextButtonState
         * @protected
         */
        _uiSetNextButtonState: function () {
            var disabled = !this.get('selectedContentType');

            this.get('container')
                .one('.ez-contentcreationwizard-next').set('disabled', disabled);
        },

        /**
         * Enables or disables the Finish button depending on the
         * `selectedContentType` and `selectedParentLocation` attribute values.
         *
         * @method _uiSetFinishButtonState
         * @protected
         */
        _uiSetFinishButtonState: function () {
            var disabled = !this.get('selectedContentType') || !this.get('selectedParentLocation');

            this.get('container')
                .one('.ez-contentcreationwizard-finish').set('disabled', disabled);
        },

        /**
         * `stepChange` event handler to change the UI state.
         *
         * @method _uiSetStep
         * @protected
         * @param {EventFacade} e
         */
        _uiSetStep: function (e) {
            var contentTypeNameNode = this._getContentTypeNameNode();

            this.get('container')
                .removeClass('is-step-' + e.prevVal)
                .addClass('is-step-' + e.newVal);
            if ( e.newVal === STEP_LOCATION ) {
                contentTypeNameNode.setContent(
                    this.translateProperty(
                        this.get('config').localesMap,
                        this.get('selectedContentType').get('names')
                    )
                );
            } else {
                contentTypeNameNode.setContent('');
            }
        },

        /**
         * Returns the node used to display the Content Type name.
         *
         * @method _getContentTypeNameNode
         * @protected
         * @return {Node}
         */
        _getContentTypeNameNode: function () {
            return this.get('container').one('.ez-contentcreationwizard-contenttype-name');
        },

        /**
         * Closes the wizard by firing the `contentCreationWizardClose` event.
         *
         * @method _closeWizard
         * @protected
         */
        _closeWizard: function () {
            /**
             * Fired to close the Content Creation Wizard.
             *
             * @event contentCreationWizardClose
             */
            this.fire('contentCreationWizardClose');
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            return this;
        },

        /**
         * Renders the Content Type selector view in its container.
         *
         * @method _renderContentTypeSelector
         * @protected
         */
        _renderContentTypeSelector: function () {
            var container = this.get('container');

            container.one('.ez-contenttypeselector-container').append(
                this.get('contentTypeSelectorView').render().get('container')
            );
        },

        /**
         * Resets the state of the view to make it ready for a new run.
         *
         * @method _resetState
         * @protected
         */
        _resetState: function () {
            this._set('step', undefined);
            this._set('selectedContentType', null);
            this._set('selectedParentLocation', null);
            this.reset('contentTypeGroups');
        },
    }, {
        ATTRS: {
            /**
             * Hold the current step identifier ('contenttype' or 'location')
             *
             * @readOnly
             * @attribute step
             * @default undefined
             */
            step: {
                readOnly: true,
            },

            /**
             * Contains the selected Content Type after the user has selected
             * one with the Content Type Selector.
             *
             * @attribute selectedContentType
             * @type {Null|eZ.ContentType}
             * @default null
             * @readOnly
             */
            selectedContentType: {
                value: null,
                readOnly: true,
            },

            /**
             * Contains the selected Location to use as the parent Location for
             * the future Content item.
             *
             * @attribute selectedParentLocation
             * @type {Null|eZ.Location}
             * @default null
             * @readOnly
             */
            selectedParentLocation: {
                value: null,
                readOnly: true,
            },

            /**
             * Contains the list of Content Type Groups with the loaded Content
             * Type to display in the Content Type Selector.
             *
             * @attribute contentTypeGroups
             * @default null
             * @type {Null|Array}
             */
            contentTypeGroups: {
                value: null,
                setter: function (groups) {
                    this.get('contentTypeSelectorView').set('contentTypeGroups', groups);
                    return groups;
                },
            },

            /**
             * The Content Type Selector View instance.
             *
             * @attribute contentTypeSelectorView
             * @type {eZ.View}
             * @default eZ.ContentTypeSelectorView
             */
            contentTypeSelectorView: {
                valueFn: function () {
                    return new Y.eZ.ContentTypeSelectorView({
                        config: this.get('config'),
                        selectedContentTypeEvent: SELECTED_TYPE_EVT,
                        bubbleTargets: this,
                    });
                }
            },
        },
    });
});
