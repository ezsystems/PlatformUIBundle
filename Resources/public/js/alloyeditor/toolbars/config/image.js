/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-image', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for images.
     *
     * @module ez-alloyeditor-toolbar-config-image
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase;

    /**
     * `styles` toolbar configuration for image. The `image` toolbar is
     * supposed to be shown when the user gives the focus to an image
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Image
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.Image = {
        name: 'image',
        buttons: [
            'ezblockremove',
        ],

        /**
         * Tests whether the `image` toolbar should be visible, it is visible
         * when an ezembed widget containing an <img> is visible.
         *
         * @method test
         * @param {Object} payload
         * @param {AlloyEditor.Core} payload.editor
         * @param {Object} payload.data
         * @param {Object} payload.data.selectionData
         * @param {Event} payload.data.nativeEvent
         * @return {Boolean}
         */
        test: function (payload) {
            var nativeEvent = payload.data.nativeEvent,
                target = new CKEDITOR.dom.element(nativeEvent.target),
                widget = payload.editor.get('nativeEditor').widgets.getByElement(target);

            // TODO: looking "> img" is inaccurate and does not match an image
            // embed right after its creation. Also, it checks a "private"
            // behaviour of the ezembed widget. Instead, the widget should
            // provide an API to check if it's an image and of course the same
            // markup should be generated somehow when editing an existing
            // RichText with an image.
            // Remains the question of how to discrimate an embed for image from
            // a *regular* embed.
            // see https://jira.ez.no/browse/EZP-25000#comment-180620
            return !!(widget && widget.name === 'ezembed' && widget.element.findOne('> img'));
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
