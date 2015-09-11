/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-heading', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for headings.
     *
     * @module ez-alloyeditor-toolbar-config-heading
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var BlockBase = Y.eZ.AlloyEditorToolbarConfig.BlockBase,
        styles = {
            name: 'styles',
            cfg: {
                styles: [
                    {name: 'Heading 1', style: {element: 'h1'}},
                    {name: 'Heading 2', style: {element: 'h2'}},
                    {name: 'Heading 3', style: {element: 'h3'}},
                    {name: 'Heading 4', style: {element: 'h4'}},
                    {name: 'Heading 5', style: {element: 'h5'}},
                    {name: 'Heading 6', style: {element: 'h6'}},
                ]
            }
        };

    /**
     * `styles` toolbar configuration for heading. The `heading` toolbar is
     * supposed to be shown when the user puts the caret inside an heading
     * element and when the selection is empty.
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Heading
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.Heading = {
        name: 'heading',
        buttons: [
            styles,
            'ezblocktextalignleft',
            'ezblocktextaligncenter',
            'ezblocktextalignright',
            'ezblocktextalignjustify',
            'ezblockremove',
        ],

        /**
         * Tests whether the `heading` toolbar should be visible. It is visible
         * when the selection is empty and when the caret is inside a heading.
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
                path.contains(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            );
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
