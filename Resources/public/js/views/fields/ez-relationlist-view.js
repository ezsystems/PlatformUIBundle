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
            this._fireMethod = this._fireLoadFieldRelatedContents;
            this._watchAttribute = 'destinationContents';
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
         * Fire the `loadFieldRelatedContents` event to retrieve the related contents
         *
         * @method _fireLoadFieldRelatedContents
         * @protected
         */
        _fireLoadFieldRelatedContents: function () {
            if (!this._isFieldEmpty()){
                this.fire('loadFieldRelatedContents', {
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
            var dest = this.get('destinationContents'),
                destinationContentsJSON = [];

            Y.Array.each(dest, function (value) {
                destinationContentsJSON.push(value.toJSON());
            });

            return {
                destinationContents: destinationContentsJSON,
                loadingError: this.get('loadingError'),
            };
        },
    },{
        ATTRS: {
            /**
             * The destination contents of the relation list
             *
             * @attribute destinationContents
             * @type Array
             */
            destinationContents: {
                value: null,
            },
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelationlist', Y.eZ.RelationListView);
});
