/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-embed', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for embeds.
     *
     * @module ez-alloyeditor-toolbar-config-embed
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase;

    /**
     * `styles` toolbar configuration for embed. The `embed` toolbar is
     * supposed to be shown when the user gives the focus to an ezembed widget
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Embed
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.Embed = {
        name: 'embed',
        buttons: [
            'ezembedhref',
            'ezblockremove',
        ],

        /**
         * Tests whether the `embed` toolbar should be visible, it is visible
         * when an ezembed widget gets the focus.
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

            return !!(widget && widget.name === 'ezembed');
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
