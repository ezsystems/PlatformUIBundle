/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-moveelement', function (Y) {
    "use strict";

    var moveUpCommand, moveDownCommand;

    if (CKEDITOR.plugins.get('ezmoveelement')) {
        return;
    }

    function fireEditorInteraction(editor, evt, target) {
        var e = {
                editor: editor,
                target: target.$,
                name: evt,
            };

        editor.fire('editorInteraction', {
            nativeEvent: e,
            selectionData: editor.getSelectionData(),
        });
    }

    moveUpCommand = {
        exec: function (editor, data) {
            var focused = editor.elementPath().block,
                widget,
                previous;

            if ( !focused ) {
                widget = editor.widgets.focused;
                focused = widget.wrapper;
            }
            previous = focused.getPrevious();
            if ( previous ) {
                if ( widget ) {
                    widget.moveBefore(previous);
                } else {
                    focused.insertBefore(previous);
                    editor.eZ.moveCaretToElement(editor, editor.eZ.findCaretElement(focused));
                    fireEditorInteraction(editor, 'eZMoveUpDone', focused);
                }
            }
        },
    };

    moveDownCommand = {
        exec: function (editor, data) {
            var focused = editor.elementPath().block,
                widget,
                next;

            if ( !focused ) {
                widget = editor.widgets.focused;
                focused = widget.wrapper;
            }
            next = focused.getNext();
            if ( next ) {
                if ( widget ) {
                    widget.moveAfter(next);
                } else {
                    focused.insertAfter(next);
                    editor.eZ.moveCaretToElement(editor, editor.eZ.findCaretElement(focused));
                    fireEditorInteraction(editor, 'eZMoveUpDone', focused);
                }
            }
        },
    };

    /**
     * CKEditor plugin providing the eZMoveUp and eZMoveDown commands. These
     * commands allow to move the element having the focus in the editor.
     *
     * @class ezmoveelement
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezmoveelement', {
        requires: ['ezcaret'],

        init: function (editor) {
            editor.addCommand('eZMoveUp', moveUpCommand);
            editor.addCommand('eZMoveDown', moveDownCommand);
        },
    });
});
