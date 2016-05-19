/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-addcontent', function (Y) {
    "use strict";

    var addContentCommand;

    if (CKEDITOR.plugins.get('ezaddcontent')) {
        return;
    }

    function createElement(doc, tagName, content, attributes) {
        var element;

        element = doc.createElement(tagName);
        element.setAttributes(attributes);
        element.setHtml(content ? content : "<br>");

        return element;
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
                name: 'eZAddContentDone',
            };

        editor.fire('editorInteraction', {
            nativeEvent: e,
            selectionData: editor.getSelectionData(),
        });
    }

    addContentCommand = {
        exec: function (editor, data) {
            var element = createElement(
                    editor.document, data.tagName, data.content, data.attributes
                ),
                focusElement = element,
                selection = editor.getSelection();

            if ( selection && selection.getSelectedElement() ) {
                element.insertAfter(selection.getSelectedElement());
            } else {
                editor.insertElement(element);
            }
            if ( data.focusElement ) {
                focusElement = element.findOne(data.focusElement);
            }
            moveCaretToElement(editor, focusElement);
            fireEditorInteractionEvent(editor, focusElement);
        },
    };

    /**
     * CKEditor plugin providing the eZAddContent command. This command
     * allows to add content  to the editor content in the editable region
     * pointed by the selector available under `eZ.editableRegion` in the
     * configuration.
     *
     * @class ezaddcontent
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezaddcontent', {
        init: function (editor) {
            editor.addCommand('eZAddContent', addContentCommand);
        },
    });
});
