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
        initializer: function () {
            if (!this._isFieldEmpty()){
                this.after('activeChange', this._fireLoadAttributeRelatedContent);
            }
            this.after('destinationContentChange', function (e) {
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
         * Fire the `loadAttributeRelatedContent` event
         *
         * @method _fireLoadAttributeRelatedContent
         * @protected
         */
        _fireLoadAttributeRelatedContent: function () {
            this.fire('loadAttributeRelatedContent', {
                fieldDefinitionIdentifier: this.get('fieldDefinition').identifier
            });
        },

        /**
         * Returns an object containing the additional variables
         *
         * @method _variables
         * @protected
         * @return Object
         */
        _variables: function () {
            if ( this.get('destinationContent') ) {
                return {
                    destinationContent: this.get('destinationContent').toJSON()
                };
            }
            else{
                return {
                    destinationContent: null
                };
            }
        },
    },{
        ATTRS: {
            /**
             * The destination content of the relation
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            destinationContent: {},
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelation', Y.eZ.RelationView);
});
