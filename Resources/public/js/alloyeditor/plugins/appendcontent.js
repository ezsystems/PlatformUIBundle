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

    appendContentCommand = {
        _createElement: function (tagName, content, attributes) {
            var element;

            element = new CKEDITOR.dom.element(
                document.createElement(tagName) // TODO other ref to document
            );

            element.setText(content ? content : "");
            element.setAttributes(attributes);

            return element;
        },

        _moveCaretToEnd: function (editor) {
            var range = editor.createRange(),
                staticToobar = editor.editable().findOne(editor.config.ez.editableRegion);

            range.moveToPosition(staticToobar, CKEDITOR.POSITION_BEFORE_END);
            editor.getSelection().selectRanges([range]);
        },

        _moveCaretToElement: function (editor, element) {
            var range = editor.createRange();

            range.moveToPosition(element, CKEDITOR.POSITION_AFTER_START);
            editor.getSelection().selectRanges([range]);
        },

        exec: function (editor, data) {
            var element = this._createElement(
                    data.tagName, data.content, data.attributes
                );
            this._moveCaretToEnd(editor);
            editor.insertElement(element);
            this._moveCaretToElement(editor, element);
        },
    };
    
    CKEDITOR.plugins.add('ezappendcontent', {
        init: function (editor) {
            editor.addCommand('eZAppendContent', appendContentCommand);
        },
    });
});
