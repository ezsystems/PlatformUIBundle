/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relation-view', function (Y) {
    "use strict";
    /**
     * Provides the Relation View class
     *
     * @module ez-relation-view
     */
    Y.namespace('eZ');

    /**
     * The relation view
     *
     * @namespace eZ
     * @class RelationView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.RelationView = Y.Base.create('relationView', Y.eZ.FieldView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadFieldRelatedContent;
            this._watchAttribute = 'destinationContent';
        },

        /**
         * Checks whether the field is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            return !this.get('field').fieldValue.destinationContentId;
        },

        /**
         * Fire the `loadFieldRelatedContent` event
         *
         * @method _fireLoadFieldRelatedContent
         * @protected
         */
        _fireLoadFieldRelatedContent: function () {
            if (!this._isFieldEmpty()) {
                this.fire('loadFieldRelatedContent', {
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
            var dest = this.get('destinationContent');

            return {
                destinationContent: dest ? dest.toJSON() : null,
                loadingError: this.get('loadingError'),
            };
        },
    },{
        ATTRS: {
            /**
             * The destination content of the relation
             *
             * @attribute destinationContent
             * @type Y.eZ.Content
             */
            destinationContent: {
                value: null,
            },
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelation', Y.eZ.RelationView);
});
