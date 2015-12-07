/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editpreviewview', function (Y) {
    "use strict";
    /**
     * Provides the Edit Preview View class
     *
     * @module ez-editpreviewview
     */
    Y.namespace('eZ');

    var IS_HIDDEN_CLASS = 'is-editpreview-hidden',
        IS_LOADING_CLASS = 'is-loading';

    /**
     * The edit preview view
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
         * Returns the version to use to generate the preview. If the version
         * was not saved yet, we are actually generating the preview to the
         * current version.
         *
         * @method _getPreviewedVersion
         * @return {eZ.Version}
         */
        _getPreviewedVersion: function () {
            var version = this.get('version'),
                currentVersion = this.get('content').get('currentVersion');

            return version.isNew() ? currentVersion : version;
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
                version = this._getPreviewedVersion(),
                languageCode = this.get('languageCode');

            container.setHTML(this.template({
                mode: this.get('previewModes')[this.get('currentModeId')],
                source: '/content/versionview/' + content.get('contentId') + '/' + version.get('versionNo') + '/' + languageCode,
                legend: version.get('names')[languageCode]
            })).addClass(IS_LOADING_CLASS);

            this._attachedViewEvents.push(container.one('.ez-preview-iframe').on('load', function () {
                container.removeClass(IS_LOADING_CLASS);
            }));

            return this;
        },

        /**
         * Showing the edit preview view with a nice transition
         *
         * @method show
         */
        show: function (newWidth) {
            var previewContainer = this.get('container').get('parentNode');

            if ( this.isHidden() ) {
                previewContainer.setStyles({
                    'width': newWidth + 'px',
                    'height': previewContainer.get('winHeight') + 'px',
                });
                previewContainer.setXY([newWidth * 2, previewContainer.get('docScrollY')]);
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
            /**
             * Fired when the "close preview" link is clicked
             *
             * @event editPreviewHide
             */
            this.fire('editPreviewHide');
        },

        /**
         * Checks whether the preview is hidden
         *
         * @method isHidden
         * @return {Boolean}
         */
        isHidden: function () {
            return this.get('container').get('parentNode').hasClass(IS_HIDDEN_CLASS);
        },
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
                    "desktop": {
                        id: "desktop",
                        width: 1100,
                        height: 700
                    },
                    "tablet": {
                        id: "tablet",
                        width: 769, /* preview-tablet.png image has such a strange dimensions */
                        height: 1025 /* preview-tablet.png image has such a strange dimensions */
                    },
                    "mobile": {
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
            },

            /**
             * The version which should be previewed
             *
             * @attribute version
             * @type eZ.Version
             * @default {}
             * @required
             */
            version: {
                value: {}
            },

            /**
             * The languageCode of the content previewed
             *
             * @attribute languageCode
             * @type String
             * @required
             */
            languageCode: {
                value: ''
            }

        }
    });
});
