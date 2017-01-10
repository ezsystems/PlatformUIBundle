/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-caret', function (Y) {
    "use strict";

    if (CKEDITOR.plugins.get('ezcaret')) {
        return;
    }

    function moveCaretToElement(editor, element) {
        var range = editor.createRange();

        range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
        editor.getSelection().selectRanges([range]);
    }

    /**
     * CKEDITOR plugin providing an API to handle the caret in the editor.
     *
     * @class ezcaret
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezcaret', {
        init: function (editor) {
            editor.eZ = editor.eZ || {};

            /**
             * Moves the caret in the editor to the given element
             *
             * @method eZ.moveCaretToElement
             * @param {CKEDITOR.editor} editor
             * @param {CKEDITOR.dom.element} element
             */
            editor.eZ.moveCaretToElement = moveCaretToElement;
        },
    });
});
