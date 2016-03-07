/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-translator-tests', function (Y) {
    var importTest, Assert = Y.Assert;

    importTest = new Y.Test.Case({
        name: "eZ Translator Import tests",

        "Should import the global Translator object": function () {
            Assert.areSame(
                window.Translator,
                Y.eZ.Translator,
                "The Translator object should have been imported in the sandbox"
            );
        },
    });

    Y.Test.Runner.setName("eZ Translator Import module tests");
    Y.Test.Runner.add(importTest);
}, '', {requires: ['test', 'ez-translator']});
