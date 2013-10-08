YUI.add('ez-editpreviewview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Preview View class
     *
     * @module ez-editpreviewview
     */

    Y.namespace('eZ');

    var IS_HIDDEN_CLASS = 'is-hidden',
        IS_LOADING_CLASS = 'is-loading';

    /**
     * The edit action bar
     *
     * @namespace eZ
     * @class EditPreviewView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.EditPreviewView = Y.Base.create('editPreviewView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-preview-hide': {'tap': '_editPreviewHide'}
        },

        /**
         * Renders the edit preview
         *
         * @method render
         * @return {eZ.EditPreview} the view itself
         */
        render: function () {

            var container = this.get('container'),
                content = this.get('content'),
                loader;

            container.setHTML(this.template({
                mode : this.get('previewModes')[this.get('currentModeId')],
                source : '/content/versionview/' + content.get('contentId') + '/1/eng-GB',
                legend : content.get('name')
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
         * Positioning
         *
         * @method show
         */
        show: function () {
            var previewContainer = this.get('container').get('parentNode'),
                previewActionContainer,
                previewWidth;

            if (previewContainer.hasClass(IS_HIDDEN_CLASS)) {
                previewActionContainer = previewContainer.get('parentNode');
                previewWidth = previewActionContainer.getX();

                previewContainer.setStyle('width', previewWidth + 'px');
                previewContainer.setXY([previewWidth * 2, 0]);

                previewContainer.removeClass(IS_HIDDEN_CLASS);
            }

            this.render();
        },

        /**
         * Event event handler for the "close preview" link in the edit preview
         * Hiding the edit preview with a nice transition
         *
         * @method _editPreviewHide
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _editPreviewHide: function (e) {
            e.preventDefault();
            this.get('container').get('parentNode').addClass(IS_HIDDEN_CLASS);
            this.fire('editPreviewHide');
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
                value: {
                    "desktop" : {
                        id: "desktop",
                        width: 1100,
                        height: 700
                    },
                    "tablet" : {
                        id: "tablet",
                        width: 769, /* preview-tablet.png image has such a strange dimensions */
                        height: 1025 /* preview-tablet.png image has such a strange dimensions */
                    },
                    "mobile" : {
                        id: "mobile",
                        width: 321, /* preview-mobile.png image has such a strange dimensions */
                        height: 481 /* preview-mobile.png image has such a strange dimensions */
                    }
                }
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
             * Content which should be previewed
             *
             * @attribute content
             * @type Y.eZ.Content
             * @default {}
             * @required
             */
            content: {
                value: {}
            }
        }
    });

});
