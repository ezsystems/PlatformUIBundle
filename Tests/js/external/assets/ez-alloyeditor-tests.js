/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-tests', function (Y) {
    var importTest, Assert = Y.Assert;

    importTest = new Y.Test.Case({
        name: "eZ AlloyEditor Import tests",

        "Should import the AlloyEditor object": function () {
            Assert.areSame(
                window.AlloyEditor,
                Y.eZ.AlloyEditor,
                "The AlloyEditor object should have been imported in the sandbox"
            );
        },

        "Should import the React object": function () {
            Assert.areSame(
                window.AlloyEditor.React,
                Y.eZ.React,
                "The React object should have been imported in the sandbox"
            );
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor Import module tests");
    Y.Test.Runner.add(importTest);
}, '', {requires: ['test', 'ez-alloyeditor']});
