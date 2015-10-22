/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-focusblock', function (Y) {
    "use strict";

    var FOCUSED_CLASS = 'is-block-focused';

    if (CKEDITOR.plugins.get('ezfocusblock')) {
        return;
    }

    function findFocusedBlock(editor) {
        return editor.element.findOne('.' + FOCUSED_CLASS);
    }
    
    function updateFocusedBlock(e) {
        var block = e.data.path.block,
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

        if ( oldBlock ) {
            oldBlock.removeClass(FOCUSED_CLASS);
        }
    }

    /**
     * CKEditor plugin to add/remove the focused class on the block holding the
     * caret.
     *
     * @class CKEDITOR.plugins.ezfocusblock
     * @constructor
     */
    CKEDITOR.plugins.add('ezfocusblock', {
        init: function (editor) {
            editor.on('selectionChange', updateFocusedBlock);
            editor.on('blur', clearFocusedBlock);
        },
    });
});
