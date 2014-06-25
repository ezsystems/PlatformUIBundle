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
            console.log(this.get('field'));
            this.after('destinationContentChange', function (e) {
                this.render();
            });
        },

        /**
         * Checks whether the destinationContentId is empty
         *
         * @method _isFieldEmpty
         * @protected
         * @return {Boolean}
         */
        _isFieldEmpty: function () {
            //return !this.get('field').fieldValue.destinationContentId;
            return !this.get('field').fieldDefinitionIdentifier;
        },

        /**
         * Fire an event with the destinationContentId
         *
         * @method _fireLoadAttributeRelatedContent
         * @protected
         */
        _fireLoadAttributeRelatedContent: function () {
            this.fire('loadAttributeRelatedContent', {
                fieldDefinitionIdentifier: this.get('field').fieldDefinitionIdentifier
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
             * The destination content associated to the object relation
             *
             * @attribute content
             * @type Y.eZ.Content
             */
            destinationContent: {},
        },
    });

    Y.eZ.FieldView.registerFieldView('ezobjectrelation', Y.eZ.RelationView);
});
