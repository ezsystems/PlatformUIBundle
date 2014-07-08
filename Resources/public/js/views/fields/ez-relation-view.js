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
    Y.eZ.RelationView = Y.Base.create('relationView', Y.eZ.FieldView, [], {
        events: {
            '.ez-relation-retry': {
                'tap': '_retryLoading',
            },
        },

        initializer: function () {
            if (!this._isFieldEmpty()){
                this.after('activeChange', this._fireLoadFieldRelatedContent);
            }
            this.after('destinationContentChange', function (e) {
                this.render();
            });

            this.after('loadingErrorChange', function (e) {
                this.render();
            });
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
            this.fire('loadFieldRelatedContent', {
                fieldDefinitionIdentifier: this.get('fieldDefinition').identifier
            });
        },

        /**
         * Tap event handler for the retry button. It resets the
         * `destinationContent` and `loadingError` attributes and fires again the
         * `loadFieldRelatedContent` event
         *
         * @method _retryLoading
         * @protected
         * @param {Object} e
         */
        _retryLoading: function (e) {
            this.setAttrs({
                destinationContent: null,
                loadingError: false
            });
            this._fireLoadFieldRelatedContent();
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
             * @attribute content
             * @type Y.eZ.Content
             */
            destinationContent: {
                value: null,
            },

            /**
             * Loading error state
             *
             * @attribute loadingError
             * @type Boolean
             */
            loadingError: {
                value: false,
            }
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelation', Y.eZ.RelationView);
});
