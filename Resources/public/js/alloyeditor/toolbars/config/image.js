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
            'ezimagehref',
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

            return !!(widget && widget.name === 'ezembed' && widget.isImage());
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
