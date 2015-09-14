/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-table-tests', function (Y) {
    var defineTest,
        AlloyEditor = Y.eZ.AlloyEditor,
        Table = Y.eZ.AlloyEditorToolbarConfig.Table;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor table config toolbar define test',
        toolbarConfig: Table,
        toolbarConfigName: "table",
        methods: {
            test: AlloyEditor.SelectionTest.table,
            getArrowBoxClasses: AlloyEditor.SelectionGetArrowBoxClasses.table,
            setPosition: AlloyEditor.SelectionSetPosition.table,
        },
    }));

    Y.Test.Runner.setName("eZ AlloyEditor table config toolbar tests");
    Y.Test.Runner.add(defineTest);
}, '', {requires: ['test', 'toolbar-config-define-tests', 'node', 'ez-alloyeditor-toolbar-config-table']});
