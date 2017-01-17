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
        HeadingConfig,
        name = 'heading',
        getStyles = function () {
            return {
                name: 'styles',
                cfg: {
                    showRemoveStylesItem: false,
                    styles: [
                        {name: Y.eZ.trans('heading.1', {}, 'onlineeditor'), style: {element: 'h1'}},
                        {name: Y.eZ.trans('heading.2', {}, 'onlineeditor'), style: {element: 'h2'}},
                        {name: Y.eZ.trans('heading.3', {}, 'onlineeditor'), style: {element: 'h3'}},
                        {name: Y.eZ.trans('heading.4', {}, 'onlineeditor'), style: {element: 'h4'}},
                        {name: Y.eZ.trans('heading.5', {}, 'onlineeditor'), style: {element: 'h5'}},
                        {name: Y.eZ.trans('heading.6', {}, 'onlineeditor'), style: {element: 'h6'}},
                        {name: Y.eZ.trans('paragraph', {}, 'onlineeditor'), style: {element: 'p'}},
                    ]
                }
            };
        };


    HeadingConfig = function () {
        this.name = name;
        this.buttons = [
            'ezmoveup',
            'ezmovedown',
            getStyles(),
            'ezblocktextalignleft',
            'ezblocktextaligncenter',
            'ezblocktextalignright',
            'ezblocktextalignjustify',
            'ezblockremove',
        ];

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
        this.test = function (payload) {
            var nativeEditor = payload.editor.get('nativeEditor'),
                path = nativeEditor.elementPath();

            return (
                nativeEditor.isSelectionEmpty() &&
                path.contains(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            );
        };

        this.getArrowBoxClasses = BlockBase.getArrowBoxClasses;

        this.setPosition = BlockBase.setPosition;
    };

    /**
     * `styles` toolbar configuration for heading. The `heading` toolbar is
     * supposed to be shown when the user puts the caret inside an heading
     * element and when the selection is empty.
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class HeadingConfig
     * @constructor
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.HeadingConfig = HeadingConfig;

    /**
     * Deprecated `styles` toolbar configuration, use
     * eZ.AlloyEditorToolbarConfig.HeadingConfig constructor instead.
     * `styles` toolbar configuration for heading. The `heading` toolbar is
     * supposed to be shown when the user puts the caret inside an heading
     * element and when the selection is empty.
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Heading
     * @deprecated
     * @extends BlockBase
     */
    Y.eZ.AlloyEditorToolbarConfig.Heading = {
        name: name,
        buttons: [
            getStyles(),
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
         * @deprecated
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

            console.log('[DEPRECATED] eZ.AlloyEditorToolbarConfig.Heading is deprecated');
            console.log('[DEPRECATED] build a config object with eZ.AlloyEditorToolbarConfig.HeadingConfig instead');
            return (
                nativeEditor.isSelectionEmpty() &&
                path.contains(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            );
        },

        getArrowBoxClasses: BlockBase.getArrowBoxClasses,

        setPosition: BlockBase.setPosition,
    };
});
