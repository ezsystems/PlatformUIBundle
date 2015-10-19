/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-mixin-embeddiscovercontent', function (Y) {
    "use strict";

    /**
     * Provides the EmbedDiscoverContent mixin
     *
     * @module ez-alloyeditor-button-mixin-embeddiscovercontent
     */
    Y.namespace('eZ.AlloyEditorButton');

    var React = Y.eZ.React;

    /**
     * ButtonEmbedDiscoverContent is a mixing providing the necessary code to
     * trigger UDW and use the content choosen by the user to correctly set the
     * properties of the ezembed widget.
     *
     * @class ButtonEmbedDiscoverContent
     * @namespace eZ.AlloyEditorButton
     */
    Y.eZ.AlloyEditorButton.ButtonEmbedDiscoverContent = {
        propTypes: {
            /**
             * The editor instance where the component is being used.
             *
             * @property {Object} editor
             */
            editor: React.PropTypes.object.isRequired,

            /**
             * The title of the UDW
             *
             * @property {String} udwTitle
             */
            udwTitle: React.PropTypes.string,

            /**
             * The method to use as the contentDiscoveredHandler in the UDW
             *
             * @property {String} udwContentDiscoveredMethod
             */
            udwContentDiscoveredMethod: React.PropTypes.string,
        },

        /**
         * Triggers the UDW to choose the content to embed.
         *
         * @method _chooseContent
         * @protected
         */
        _chooseContent: function () {
            this.props.editor.get('nativeEditor').fire('contentDiscover', {
                config: {
                    title: this.props.udwTitle,
                    multiple: false,
                    contentDiscoveredHandler: this[this.props.udwContentDiscoveredMethod],
                }
            });
        },

        /**
         * Sets the href and the content of the ezembed widget based on the
         * given content
         *
         * @method _setContent
         * @protected
         * @param {eZ.Content} content
         */
        _setContent: function (content) {
            var editor = this.props.editor.get('nativeEditor'),
                wrapper, embedWidget;

            wrapper = editor.getSelection().getStartElement();
            embedWidget = editor.widgets.getByElement(wrapper);
            embedWidget.element.data(
                'href',
                'ezcontent://' + content.get('contentId')
            );
            embedWidget.element.setText(content.get('name'));
            embedWidget.focus();
        },
    };
});
