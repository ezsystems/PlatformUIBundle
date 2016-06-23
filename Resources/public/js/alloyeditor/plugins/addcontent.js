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

    /**
     * Appends the element to the editor content. Depending on the editor's
     * state, the element is added at a different place:
     *
     * - if nothing is selected, editor.insertElement is called and the element
     *   is added at the beginning of the editor
     * - if a block element is selected (not a widget), the element is added
     *   after the element or after the first block in the element path (after
     *   the ul element if a li has the focus)
     * - if a widget has the focus, the element is added right after it
     *
     * @method appendElement
     * @param {CKEDITOR.editor} editor
     * @param {CKEDITOR.dom.element} element
     */
    function appendElement(editor, element) {
        var elementPath = editor.elementPath(),
            elements;

        if ( elementPath && elementPath.block ) {
            elements = elementPath.elements;
            element.insertAfter(elements[elements.length - 2]);
        } else if ( editor.widgets && editor.widgets.focused ) {
            element.insertAfter(editor.widgets.focused.wrapper);
        } else {
            editor.insertElement(element);
        }
    }

    addContentCommand = {
        exec: function (editor, data) {
            var element = createElement(
                    editor.document, data.tagName, data.content, data.attributes
                ),
                focusElement = element;

            appendElement(editor, element);
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
            editor.eZ = {};
            editor.eZ.appendElement = Y.bind(appendElement, editor, editor);
            editor.addCommand('eZAddContent', addContentCommand);
        },
    });
});
