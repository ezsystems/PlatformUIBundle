YUI.add('ez-editpreview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Preview class
     *
     * @module ez-editpreview
     */

    Y.namespace('eZ');

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditPreview
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.EditPreview = Y.Base.create('editPreview', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-preview-hide': {'tap': 'hide'}
        },

        /**
         * Initializer is called upon view's init
         * Creating modes lookup object
         *
         * @method initializer
         */
        initializer: function () {
            var previewModes = this.get('previewModes'),
                index, length;

            // Creating lookup object for easy preview modes search
            this.modesSearch = {};

            for (index = 0, length = previewModes.length; index < length; index++) {

                console.log(previewModes[index]);

                this.modesSearch[previewModes[index].id] = previewModes[index];
            }

        },

        /**
         * Renders the edit preview
         *
         * @method render
         * @return {eZ.EditPreview} the view itself
         */
        render: function () {

            console.log(this.modesSearch);

            this.get('container').setHTML(this.template({
                mode : this.modesSearch[this.get('currentMode')],
                source : this.get('previewSource'),
                legend : this.get('previewLegend')
            }));

            return this;
        },


        /**
         * Showing the edit preview with nice transition
         *
         * @method show
         */
        show: function () {
            

        },


        /**
         * Event event handler for the "close preview" link in the edit preview
         * Hiding the edit preview with nice transition
         *
         * @method hide
         * @param {Object} e event facade of the tap event
         */
        hide: function (e) {
            e.preventDefault();


        }

    }, {
        ATTRS: {

            /**
             * Preview parameters for different modes
             *
             * @attribute previewModes
             * @default []
             * @required
             */
            previewModes: {
                value: [{
                        id: "desktop",
                        width: 1024,
                        height: 768
                    }, {
                        id: "tablet",
                        width: 1024,
                        height: 768
                    }, {
                        id: "mobile",
                        width: 320,
                        height: 480
                    }
                ]
            },

            /**
             * Mode of the actual preview to be rendered
             *
             * @attribute currentMode
             * @default "mobile"
             * @required
             */
            currentMode: {
                value: "mobile"
            },

            /**
             * Source for the preview iframe
             *
             * @attribute currentMode
             * @default "/Getting-Started"
             * @required
             */
            previewSource: {
                value: "/Getting-Started"
            },

            /**
             * Legend describing the preview page
             *
             * @attribute currentMode
             * @default "/Getting-Started"
             * @required
             */
            previewLegend: {
                value: "Getting Started page"
            }

        }
    });

});
