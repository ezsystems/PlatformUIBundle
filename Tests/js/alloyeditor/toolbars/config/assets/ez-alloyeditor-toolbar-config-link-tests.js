/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-link-tests', function (Y) {
    var defineTest,
        Link = Y.eZ.AlloyEditorToolbarConfig.Link;

    defineTest = new Y.Test.Case(Y.merge(Y.eZ.Test.ToolbarConfigDefineTest, {
        name: 'eZ AlloyEditor link config toolbar define test',
        toolbarConfig: Link,
        toolbarConfigName: "link",
        methods: {
            test: Y.eZ.AlloyEditor.SelectionTest.link
        },
    }));

    Y.Test.Runner.setName("eZ AlloyEditor link config toolbar tests");
    Y.Test.Runner.add(defineTest);
}, '', {requires: ['test', 'toolbar-config-define-tests', 'node', 'ez-alloyeditor-toolbar-config-link']});
