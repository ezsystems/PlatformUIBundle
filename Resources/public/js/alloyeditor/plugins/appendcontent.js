/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-appendcontent', function (Y) {
    "use strict";

    var appendContentCommand;

    if (CKEDITOR.plugins.get('ezappendcontent')) {
        return;
    }

    function createElement(doc, tagName, content, attributes) {
        var element;

        element = doc.createElement(tagName);
        element.setAttributes(attributes);
        element.setText(content ? content : "");

        return element;
    }

    function moveCaretToEnd(editor) {
        var range = editor.createRange(),
            staticToobar = editor.editable().findOne(editor.config.eZ.editableRegion);

        range.moveToPosition(staticToobar, CKEDITOR.POSITION_BEFORE_END);
        editor.getSelection().selectRanges([range]);
    }

    function moveCaretToElement(editor, element) {
        var range = editor.createRange();

        range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
        editor.getSelection().selectRanges([range]);
    }

    /**
     * Fires the `editorInteraction` event this is done to make sure the
     * AlloyEditor's UI remains visible
     *
     * @method fireEditorInteractionEvent
     * @private
     */
    function fireEditorInteractionEvent(editor, element) {
        var e = {
                editor: editor,
                target: element.$,
                name: 'eZAppendContentDone',
            };

        editor.fire('editorInteraction', {
            nativeEvent: e,
            selectionData: editor.getSelectionData(),
        });
    }

    appendContentCommand = {
        exec: function (editor, data) {
            var element = createElement(
                    editor.document, data.tagName, data.content, data.attributes
                );

            moveCaretToEnd(editor);
            editor.insertElement(element);
            moveCaretToElement(editor, element);
            fireEditorInteractionEvent(editor, element);
        },
    };

    /**
     * CKEditor plugin providing the eZAppendContent command. This command
     * allows to append content  to the editor content in the editable region
     * pointed by the selector available under `eZ.editableRegion` in the
     * configuration.
     *
     * @class CKEDITOR.plugins.ezappendcontent
     * @constructor
     */
    CKEDITOR.plugins.add('ezappendcontent', {
        init: function (editor) {
            editor.addCommand('eZAppendContent', appendContentCommand);
        },
    });
});
