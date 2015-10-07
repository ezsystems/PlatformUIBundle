/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-removeblock', function (Y) {
    "use strict";

    var removeBlockCommand;

    if (CKEDITOR.plugins.get('ezremoveblock')) {
        return;
    }

    removeBlockCommand = {
        /**
         * Moves the caret to the element
         *
         * @method _moveCaretToElement
         * @protected
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} element
         */
        _moveCaretToElement: function (editor, element) {
            var range = editor.createRange();

            range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
            editor.getSelection().selectRanges([range]);
        },

        /**
         * Fires the editorInteraction event so that AlloyEditor's UI is updated
         * for the newly focused element
         *
         * @method _fireEditorInteraction
         * @protected
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} removedElement
         * @param {CKEDITOR.dom.element} newFocus
         */
        _fireEditorInteraction: function (editor, newFocus) {
            var e = {
                    editor: editor,
                    target: newFocus.$,
                    name: 'eZRemoveBlockDone',
                };

            editor.fire('editorInteraction', {
                nativeEvent: e,
                selectionData: editor.getSelectionData(),
            });

        },

        /**
         * Changes the focused element in the editor to the given newFocus
         * element
         *
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} newFocus
         * @protected
         * @method _changeFocus
         */
        _changeFocus: function (editor, newFocus) {
            this._moveCaretToElement(editor, newFocus);
            this._fireEditorInteraction(editor, newFocus);
       },

        exec: function (editor, data) {
            var toRemove = editor.elementPath().block,
                newFocus;

            if ( !toRemove ) {
                // path.block is null when a widget is focused so the element to
                // remove is the focused widget wrapper.
                toRemove = editor.widgets.focused.wrapper;
            }
            newFocus = toRemove.getNext();
            if ( !newFocus ) {
                newFocus = toRemove.getPrevious();
            }

            toRemove.remove();
            if ( newFocus ) {
                this._changeFocus(editor, newFocus);
            }
        },
    };

    /**
     * CKEditor plugin providing the eZRemoveBlock command. This command
     * allows to remove the block element holding the caret or the focused
     * widget
     *
     * @class CKEDITOR.plugins.ezremoveblock
     * @constructor
     */
    CKEDITOR.plugins.add('ezremoveblock', {
        init: function (editor) {
            editor.addCommand('eZRemoveBlock', removeBlockCommand);
        },
    });
});
