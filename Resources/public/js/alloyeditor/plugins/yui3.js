/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-yui3', function (Y) {
    "use strict";

    if (CKEDITOR.plugins.get('yui3')) {
        return;
    }

    function cleanUpIds(editor) {
        Array.prototype.forEach.call(
            editor.element.$.querySelectorAll('[id]'),
            function (element) {
                element.removeAttribute('id');
            }
        );
    }

    /**
     * CKEditor plugin to help the integration of CKEditor in a YUI3
     * application. It makes sure we remove the auto-generated YUI3 id on DOM
     * nodes inside the editor before executing an editor command.
     * See https://jira.ez.no/browse/EZP-25718
     *
     * @class yui3
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('yui3', {
        init: function (editor) {
            editor.on('beforeCommandExec', Y.bind(cleanUpIds, this, editor));
        },
    });
});
