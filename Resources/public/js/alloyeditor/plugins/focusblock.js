/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-focusblock', function (Y) {
    "use strict";

    var FOCUSED_CLASS = 'is-block-focused',
        AE_TOOLBAR_SELECTOR = '.ae-toolbars > *';

    if (CKEDITOR.plugins.get('ezfocusblock')) {
        return;
    }

    function findFocusedBlock(editor) {
        return editor.element.findOne('.' + FOCUSED_CLASS);
    }

    function findNewFocusedBlock(elementPath) {
        var block = elementPath.block,
            elements = elementPath.elements;

        if ( !block ) {
            return null;
        }
        return elements[elements.length - 2];
    }

    function updateFocusedBlock(e) {
        var block = findNewFocusedBlock(e.data.path),
            oldBlock = findFocusedBlock(e.editor);

        if ( oldBlock && (!block || block.$ !== oldBlock.$) ) {
            oldBlock.removeClass(FOCUSED_CLASS);
        }
        if ( block ) {
            block.addClass(FOCUSED_CLASS);
        }
    }

    function clearFocusedBlock(e) {
        var oldBlock = findFocusedBlock(e.editor);
        var isToolbarOpen = document.querySelector(AE_TOOLBAR_SELECTOR);

        if ( oldBlock && !isToolbarOpen ) {
            oldBlock.removeClass(FOCUSED_CLASS);
        }
    }

    function clearFocusedBlockFromData(e) {
        var doc = document.createDocumentFragment(),
            root, element, list, i;

        root = document.createElement('div');
        doc.appendChild(root);
        root.innerHTML = e.data.dataValue;
        list = root.querySelectorAll('.' + FOCUSED_CLASS);
        if ( list.length ) {
            for (i = 0; i != list.length; ++i) {
                element = list[i];

                element.classList.remove(FOCUSED_CLASS);
                // Workaround to https://jira.ez.no/browse/EZP-25028
                // RichText xhtml5edit parser does not accept empty class
                // attributes...
                // @TODO remove once fixed.
                if ( !element.getAttribute('class') ) {
                    element.removeAttribute('class');
                }
            }
            e.data.dataValue = root.innerHTML;
        }
    }

    /**
     * CKEditor plugin to add/remove the focused class on the block holding the
     * caret.
     *
     * @class ezfocusblock
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezfocusblock', {
        init: function (editor) {
            editor.on('selectionChange', updateFocusedBlock);
            editor.on('blur', clearFocusedBlock);
            editor.on('getData', clearFocusedBlockFromData);
            editor.on('editorUpdate', clearFocusedBlock);
        },
    });
});
