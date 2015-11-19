/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relationlist-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the relation list fields
     *
     * @module ez-relationlist-editview
     */
    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezobjectrelationlist';

    /**
     * Relation list edit view
     *
     * @namespace eZ
     * @class RelationListEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.RelationListEditView = Y.Base.create('relationListEditView', Y.eZ.FieldEditView, [Y.eZ.AsynchronousView], {
        events: {
            '.ez-relation-discover': {
                'tap': '_runUniversalDiscovery',
            },
            '.ez-relation-remove-content': {
                'tap': '_removeRelation'
            }
        },

        initializer: function () {
            var fieldValue = this.get('field').fieldValue;

            this._fireMethod = this._fireLoadObjectRelations;
            this._handleFieldDescriptionVisibility = false;
            if( fieldValue.destinationContentIds ){
                this._set('destinationContentsIds', fieldValue.destinationContentIds);
            }
            this.after('relatedContentsChange', function (e) {
                this._syncDestinationContentsIds(e);
                if (e.src === "remove") {
                    if (this.get('destinationContentsIds').length !== 0) {
                        this._vanish('tr[data-content-id="' + e.contentId + '"]', false);
                    } else {
                        this._vanish('.ez-relationlist-contents', true);
                    }
                } else {
                    this.render();
                }
            });
        },

        /**
         * Make a DOM element vanish.
         *
         * @method _vanish
         * @param {String} domIdentifier
         * @param {Boolean} reRender
         * @protected
         */
        _vanish: function (domIdentifier, reRender) {
            var that = this,
                container = this.get('container');

            container.one(domIdentifier).transition({
                duration: 0.3,
                opacity: 0,
            }, function() {
                container.one(domIdentifier).remove();
                if (reRender) {
                    that.render();
                }
            });
        },

        /**
         * Synchronize the destinationContentId attribute when destinationContent change.
         *
         * @method _syncDestinationContentsIds
         * @param {EventFacade} e
         * @protected
         */
        _syncDestinationContentsIds: function (e) {
            var destinationContentsIds = [];

            Y.Array.each(e.newVal, function (value) {
                destinationContentsIds.push(value.get('contentId'));
            });
            this._set('destinationContentsIds', destinationContentsIds);
        },

        /**
         * Fire the `loadObjectRelations` event
         *
         * @method _fireLoadObjectRelations
         * @protected
         */
        _fireLoadObjectRelations: function () {
            if ( !this._isFieldEmpty() ) {
                this.fire('loadObjectRelations', {
                    relationType: 'ATTRIBUTE',
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
            if ( this.get('destinationContentsIds') ) {
                return ( this.get('destinationContentsIds').length === 0 );
            }
            return true;
        },

        /**
         * Returns an object containing the additional variables
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            var relatedContents = this.get('relatedContents'),
                relatedContentsJSON = [];

            Y.Array.each(relatedContents, function (value) {
                relatedContentsJSON.push(value.toJSON());
            });

            return {
                relatedContents:  relatedContentsJSON,
                loadingError: this.get('loadingError'),
                isEmpty: this._isFieldEmpty(),
                isRequired: this.get('fieldDefinition').isRequired,
            };
        },

        /**
         * Tap event handler for the remove relation buttons.
         * It remove the content related to the button from the relation list.
         *
         * @method _removeRelation
         * @protected
         * @param {EventFacade} e
         */
        _removeRelation: function (e) {
            var remainingContents,
                removedContentId;

            e.preventDefault();
            remainingContents =  Y.Array.reject(this.get('relatedContents'), function (val) {
                return ((removedContentId = e.target.getAttribute('data-content-id')) ==  val.get('id'));
            });
            this.set('relatedContents', remainingContents, {src: "remove", contentId: removedContentId});
            this.validate();
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
            var that = this;

            e.preventDefault();
            this.fire('contentDiscover', {
                config: {
                    title: "Select the contents you want to add in the relation",
                    multiple: true,
                    contentDiscoveredHandler: Y.bind(this._selectRelation, this),
                    cancelDiscoverHandler: Y.bind(this.validate, this),
                    isSelectable: function (contentStruct) {
                        var selectionContentTypes = that.get('fieldDefinition').fieldSettings.selectionContentTypes,
                            contentTypeIdentifier = contentStruct.contentType.get('identifier');

                        return (
                            (selectionContentTypes.length === 0)
                            || (selectionContentTypes.indexOf(contentTypeIdentifier) > -1)
                        );
                    },
                },
            });
        },

        /**
         * Universal discovery contentDiscovered event handler to fill the relation list
         * after the user chose one or several contents.
         *
         * @method _selectRelation
         * @protected
         * @param {EventFacade} e
         */
        _selectRelation: function (e) {
            var relatedContents = this.get('relatedContents').concat();

            Y.Array.each(e.selection, function (struct) {
                if ( !this._isRelated(struct.contentInfo) ) {
                    relatedContents.push(struct.contentInfo);
                }
            }, this);

            this.set('errorStatus', false);

            this.set('relatedContents', relatedContents);
        },

        /**
         * Checks if the content info is already in the relation.
         *
         * @method _isRelated
         * @protected
         * @param {eZ.ContentInfo} contentInfo
         * @return Boolean
         */
        _isRelated: function (contentInfo) {
            return (this.get('destinationContentsIds').indexOf(contentInfo.get('contentId')) !== -1);
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
            return {destinationContentIds: this.get('destinationContentsIds')};
        },
    },{
        ATTRS: {
            /**
             * The related contents of the relation list
             *
             * @attribute relatedContents
             * @type Array of (eZ.ContentInfo) or {eZ.Content}
             */
            relatedContents: {
                value: [],
            },

            /**
             * Array of contents Ids in the relation (e.g. 42, not /api/ezp/v2/content/objects/42)
             *
             * @attribute destinationContentsIds
             * @type Array
             * @readOnly
             */
            destinationContentsIds: {
                value: null,
                readOnly: true,
            },
        },
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.RelationListEditView
    );
});
