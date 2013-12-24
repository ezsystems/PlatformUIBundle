YUI.add('ez-maplocation-editview', function (Y) {
    "use strict";
    /**
     * Provides the field edit view for the Map Location (ezstring) fields
     *
     * @module ez-maplocation-editview
     */

    Y.namespace('eZ');

    var FIELDTYPE_IDENTIFIER = 'ezgmaplocation';

    /**
     * Map Location edit view
     *
     * @namespace eZ
     * @class MapLocationEditView
     * @constructor
     * @extends eZ.FieldEditView
     */
    Y.eZ.MapLocationEditView = Y.Base.create('mapLocationEditView', Y.eZ.FieldEditView, [], {
        events: {
            '.ez-maplocation-find-address-button': {
                'click': '_findAddress'
            },
            '.ez-maplocation-locate-me-button': {
                'click': '_locateMe'
            }
        },

        /**
         * Attempts to find location of the address in the address input
         *
         * @protected
         * @method _findAddress
         */
        _findAddress: function () {
            console.log("Find Address!");
        },

        /**
         * Attempts to locate the current user's device position using Geolocation API
         *
         * @protected
         * @method _locateMe
         */
        _locateMe: function () {
            console.log("Locate Me!");
        },

        /**
         * Defines the variables to imported in the field edit template for text
         * line.
         *
         * @protected
         * @method _variables
         * @return {Object} containing isRequired, maxLength and minLength
         * entries
         */
        _variables: function () {
            return {
                "isRequired": this.get('fieldDefinition').isRequired
            };
        }
    });

    Y.eZ.FieldEditView.registerFieldEditView(
        FIELDTYPE_IDENTIFIER, Y.eZ.MapLocationEditView
    );
});
