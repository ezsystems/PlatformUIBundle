/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-table', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for paragraphs.
     *
     * @module ez-alloyeditor-toolbar-config-paragraph
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    var AlloyEditor = Y.eZ.AlloyEditor;

    /**
     * `styles` toolbar configuration for tables
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Table
     */
    Y.eZ.AlloyEditorToolbarConfig.Table = {
        name: 'table',
        buttons: [
            'ezmoveup',
            'ezmovedown',
            'tableHeading',
            'tableRow',
            'tableColumn',
            'tableCell',
            'tableRemove',
        ],
        getArrowBoxClasses: AlloyEditor.SelectionGetArrowBoxClasses.table,
        setPosition: AlloyEditor.SelectionSetPosition.table,
        test: AlloyEditor.SelectionTest.table
    };
});

