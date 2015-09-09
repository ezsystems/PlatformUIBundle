/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-text', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for paragraphs.
     *
     * @module ez-alloyeditor-toolbar-config-paragraph
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var AlloyEditor = Y.eZ.AlloyEditor;

    /**
     * `styles` toolbar configuration for texts
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Text
     */
    Y.eZ.AlloyEditorToolbarConfig.Text = {
        name: 'text',
        buttons: ['bold', 'italic', 'underline', 'link'],
        test: AlloyEditor.SelectionTest.text
    };
});

