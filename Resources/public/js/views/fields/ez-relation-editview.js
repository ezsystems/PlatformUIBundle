/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relation-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the relation fields
     *
     * @module ez-relation-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezobjectrelation';

    /**
     * Relation edit view
     *
     * @namespace eZ
     * @class RelationEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RelationEditView = Y.Base.create('relationEditView', Y.eZ.FieldEditView, [Y.eZ.AsynchronousView], {

        events: {
            '.ez-relation-remove': {
                'tap': '_removeRelation',
            },
            '.ez-relation-discover': {
                'tap': '_runUniversalDiscovery',
            },
        },

        initializer: function () {
            this._handleFieldDescriptionVisibility = false;
            this._fireMethod = this._fireLoadFieldRelatedContent;
            this._watchAttribute = 'destinationContent';
            if( this.get('field').fieldValue.destinationContentId ){
                this._set('destinationContentId', this.get('field').fieldValue.destinationContentId);
            }
            this._syncDestinationContentId();
        },

        /**
         * Synchronize the destinationContentId attribute when destinationContent change.
         *
         * @method _syncDestinationContentId
         * @protected
         */
        _syncDestinationContentId: function () {
            this.after("destinationContentChange", function () {
                if ( this.get('destinationContent') ) {
                    this._set('destinationContentId', this.get('destinationContent').get('contentId'));
                } else {
                    this._set('destinationContentId', null);
                }
            });
        },

        /**
         * Fire the `loadFieldRelatedContent` event
         *
         * @method _fireLoadFieldRelatedContent
         * @protected
         */
        _fireLoadFieldRelatedContent: function () {
            if ( !this._isFieldEmpty() ) {
                this.fire('loadFieldRelatedContent', {
                    fieldDefinitionIdentifier: this.get('fieldDefinition').identifier
                });
            }
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return !this.get('destinationContentId');
        },

        /**
         * Returns an object containing the additional variables
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            var dest = this.get('destinationContent');

            return {
                destinationContent: dest ? dest.toJSON() : null,
                loadingError: this.get('loadingError'),
                isEmpty: this._isFieldEmpty(),
                isRequired: this.get('fieldDefinition').isRequired,
            };
        },

        /**
         * Tap event handler for the remove button. It resets the relation.
         *
         * @method _removeRelation
         * @protected
         * @param {EventFacade} e
         */
        _removeRelation: function (e) {
            e.preventDefault();

            this.set('destinationContent', null);
            this.validate();
            this.get('container').one('.ez-relation-remove').set('disabled', true);
        },

        validate: function () {
            if ( this.get('fieldDefinition').isRequired && this._isFieldEmpty() ){
                this.set('errorStatus', 'This field is required');
            } else {
                this.set('errorStatus', false);
            }
        },

        /**
         * Fire the contentDiscover event to launch the universal discovery widget.
         *
         * @method _runUniversalDiscovery
         * @protected
         * @param {EventFacade} e
         */
        _runUniversalDiscovery: function (e) {
            e.preventDefault();
            this.fire('contentDiscover', {
                config: {
                    contentDiscoveredHandler: Y.bind(this._selectRelation, this),
                    cancelDiscoverHandler: Y.bind(this.validate, this),
                },
            });
        },

        /**
         * Universal discovery contentDiscovered event handler to fill the relation after the user chose a content
         *
         * @method _selectRelation
         * @protected
         * @param {EventFacade} e
         */
        _selectRelation: function (e) {
            var selectedContent = e.selection.contentInfo;

            this.set('errorStatus', false);
            this.set('destinationContent', selectedContent);
            this.get('container').one('.ez-relation-remove').set('disabled', false);
        },

        /**
         * Returns the field value.
         *
         * @protected
         * @method _getFieldValue
         * @return Object
         */
        _getFieldValue: function () {
            this.validate();
            if ( this._isFieldEmpty() ) {
                return {destinationContentId: null};
            } else {
                return {destinationContentId: this.get('destinationContentId')};
            }
        },
    },{
        ATTRS: {
            /**
             * The destination content or content info of the relation
             *
             * @attribute destinationContent
             * @type {eZ.Content|eZ.ContentInfo}
             */
            destinationContent: {
                value: null,
            },
            /**
             * The destination content Id of the relation
             *
             * @attribute destinationContentId
             * @type String
             * @readOnly
             */
            destinationContentId: {
                value: null,
                readOnly: true,
            },
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RelationEditView
    );
});
