/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-text-tests', function (Y) {
    var defineTest,
        Text = Y.eZ.AlloyEditorToolbarConfig.Text;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor text config toolbar define test',
        toolbarConfig: Text,
        toolbarConfigName: "text",
        methods: {
            test: Y.eZ.AlloyEditor.SelectionTest.text
        },
    }));

    Y.Test.Runner.setName("eZ AlloyEditor text config toolbar tests");
    Y.Test.Runner.add(defineTest);
}, '', {requires: ['test', 'toolbar-config-define-tests', 'node', 'ez-alloyeditor-toolbar-config-text']});
