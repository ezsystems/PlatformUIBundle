/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-heading', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for headings.
     *
     * @module ez-alloyeditor-toolbar-config-heading
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var AlloyEditor = Y.eZ.AlloyEditor,
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
         * Tests whether the `heading` should be visible. It is visible when
         * the selection is empty and when the caret is inside a heading.
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

        /**
         * Returns the arrow box classes for the toolbar. The toolbar is
         * always positioned above the heading
         *
         * @method getArrowBoxClasses
         * @return {String}
         */
        getArrowBoxClasses: function () {
            return 'ae-arrow-box ae-arrow-box-bottom';
        },

        /**
         * Sets the position of the toolbar. It overrides the default styles
         * toolbar positioning to take into account the fact that we don't
         * have a selection but only the caret inside the heading.
         *
         * @method setPosition
         * @param {Object} payload
         * @param {AlloyEditor.Core} payload.editor
         * @param {Object} payload.selectionData
         * @param {Object} payload.editorEvent
         * @return {Boolean} true if the method was able to position the
         * toolbar
         */
        setPosition: function (payload) {
            var region = payload.selectionData.region,
                domNode = AlloyEditor.React.findDOMNode(this),
                xy, domElement;

            xy = this.getWidgetXYPoint(
                region.left, region.top, CKEDITOR.SELECTION_BOTTOM_TO_TOP
            );

            domElement = new CKEDITOR.dom.element(domNode);
            domElement.addClass('ae-toolbar-transition');
            domElement.setStyles({
                left: xy[0] + 'px',
                top: xy[1] + 'px'
            });
            return true;
        },
    };
});
