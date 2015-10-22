/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-toolbar-config-block-base', function (Y) {
    "use strict";
     /**
     * Provides base methods to toolbar dedicated to block element (heading,
     * paragraph, ...).
     *
     * @module ez-alloyeditor-toolbar-config-block-base
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var AlloyEditor = Y.eZ.AlloyEditor;

    function outlineTotalWidth(block) {
        return (
            parseInt(block.getComputedStyle('outline-offset'), 10) +
            parseInt(block.getComputedStyle('outline-width'), 10)
        );
    }

    function setPositionFor(block) {
        /* jshint validthis: true */
        var blockRect = block.getClientRect(),
            outlineWidth = outlineTotalWidth(block),
            domNode = AlloyEditor.React.findDOMNode(this),
            xy, domElement;

        xy = this.getWidgetXYPoint(
            blockRect.left - outlineWidth,
            blockRect.top + block.getWindow().getScrollPosition().y - outlineWidth,
            CKEDITOR.SELECTION_BOTTOM_TO_TOP
        );

        domElement = new CKEDITOR.dom.element(domNode);
        domElement.addClass('ae-toolbar-transition');
        domElement.setStyles({
            left: (blockRect.left - outlineWidth) + 'px',
            top: xy[1] + 'px'
        });
        return true;
    }

    Y.eZ.AlloyEditorToolbarConfig.BlockBase = {
        /**
         * Returns the arrow box classes for the toolbar. The toolbar is
         * always positioned above its related block and has a special class to
         * move its tail on the left.
         *
         * @method getArrowBoxClasses
         * @return {String}
         */
        getArrowBoxClasses: function () {
            return 'ae-arrow-box ae-arrow-box-bottom ez-ae-arrow-box-left';
        },

        /**
         * Sets the position of the toolbar. It overrides the default styles
         * toolbar positioning to position the toolbar just above its related
         * block element. The related block element is the block indicated in
         * CKEditor's path or the target of the editorEvent event.
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
            var block = payload.editor.get('nativeEditor').elementPath().block;

            if ( !block ) {
                block = new CKEDITOR.dom.element(payload.editorEvent.data.nativeEvent.target);
            }
            return setPositionFor.call(this, block);
        },
    };
});
