/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-paragraph', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for paragraphs.
     *
     * @module ez-alloyeditor-toolbar-config-paragraph
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase;

    /**
     * `styles` toolbar configuration for paragraph. The `paragraph` toolbar is
     * supposed to be shown when the user puts the caret inside a paragraph
     * element and when the selection is empty.
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Paragraph
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.Paragraph = {
        name: 'paragraph',
        buttons: [
            'ezblocktextalignleft',
            'ezblocktextaligncenter',
            'ezblocktextalignright',
            'ezblocktextalignjustify',
            'ezblockremove',
        ],

        /**
         * Tests whether the `paragraph` toolbar should be visible. It is
         * visible when the selection is empty and when the caret is inside a
         * paragraph.
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
            var nativeEditor = payload.editor.get('nativeEditor'),
                path = nativeEditor.elementPath();

            return (
                nativeEditor.isSelectionEmpty() &&
                path.contains('p')
            );
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
