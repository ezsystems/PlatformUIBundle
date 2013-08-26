YUI.add('ez-editpreview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Preview class
     *
     * @module ez-editpreview
     */

    Y.namespace('eZ');

    var IS_HIDDEN_CLASS = 'is-hidden',
        IS_LOADING_CLASS = 'is-loading';

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

            var container = this.get('container'),
                loader;

            container.setHTML(this.template({
                mode : this.modesSearch[this.get('currentModeId')],
                source : this.get('previewSource'),
                legend : this.get('previewLegend')
            }));

            // loader node for the iframe
            loader = container.one('.loader');
            loader.addClass(IS_LOADING_CLASS);

            container.one('.preview-iframe').on('load', function () {
                loader.removeClass(IS_LOADING_CLASS);
            });

            return this;
        },


        /**
         * Showing the edit preview with a nice transition
         *
         * @method show
         */
        show: function () {
            this.get('container').get('parentNode').removeClass(IS_HIDDEN_CLASS);
            this.render();
        },


        /**
         * Event event handler for the "close preview" link in the edit preview
         * Hiding the edit preview with a nice transition
         *
         * @method hide
         * @param {Object} e event facade of the tap event
         */
        hide: function (e) {
            e.preventDefault();
            this.get('container').get('parentNode').addClass(IS_HIDDEN_CLASS);
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
                        height: 700
                    }, {
                        id: "tablet",
                        width: 800,
                        height: 600
                    }, {
                        id: "mobile",
                        width: 321, /* preview-mobile.png image has such a strange dimensions */
                        height: 481 /* preview-mobile.png image has such a strange dimensions */
                    }
                ]
            },

            /**
             * Mode of the actual preview to be rendered
             *
             * @attribute currentModeId
             * @default "mobile"
             * @required
             */
            currentModeId: {
                value: "mobile"
            },

            /**
             * Source for the preview iframe
             *
             * @attribute previewSoruce
             * @type String
             * @default "/Getting-Started"
             * @required
             */
            previewSource: {
                value: "/Getting-Started"
            },

            /**
             * Legend describing the preview page
             *
             * @attribute previewLegend
             * @type String
             * @default "Getting Started page"
             * @required
             */
            previewLegend: {
                value: "Getting Started page"
            }

        }
    });

});
