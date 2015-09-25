/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relationlist-view', function (Y) {
    "use strict";
    /**
     * Provides the Relation list View class
     *
     * @module ez-relationlist-view
     */
    Y.namespace('eZ');

    /**
     * The relation list view
     *
     * @namespace eZ
     * @class RelationListView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.RelationListView = Y.Base.create('relationlistView', Y.eZ.FieldView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadObjectRelations;
            this._watchAttribute = 'relatedContents';
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            var fieldValue = this.get('field').fieldValue;

            return (!fieldValue || !fieldValue.destinationContentIds || !fieldValue.destinationContentIds.length);
        },

        /**
         * Fire the `loadObjectRelations` event to retrieve the related contents
         *
         * @method _fireLoadObjectRelations
         * @protected
         */
        _fireLoadObjectRelations: function () {
            if (!this._isFieldEmpty()){
                this.fire('loadObjectRelations', {
                    relationType: 'ATTRIBUTE',
                    fieldDefinitionIdentifier: this.get('fieldDefinition').identifier
                });
            }
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
                relatedContents: relatedContentsJSON,
                loadingError: this.get('loadingError'),
            };
        },
    },{
        ATTRS: {
            /**
             * The related contents of the relation list
             *
             * @attribute relatedContents
             * @type Array
             */
            relatedContents: {
                value: null,
            },
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelationlist', Y.eZ.RelationListView);
});
