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
        exec: function (editor, data) {
            editor.elementPath().block.remove();
        },
    };

    /**
     * CKEditor plugin providing the eZRemoveBlock command. This command
     * allows to remove the block element holding the caret.
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
