/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-capi-tests', function (Y) {
    var importTest, Assert = Y.Assert;

    importTest = new Y.Test.Case({
        name: "eZ CAPI Import tests",

        "Should import the eZ.CAPI object": function () {
            Assert.areSame(
                window.eZ.CAPI,
                Y.eZ.CAPI,
                "The eZ.CAPI object should have been imported in the sandbox"
            );
        },

        "Should import the eZ.SessionAuthAgent object": function () {
            Assert.areSame(
                window.eZ.SessionAuthAgent,
                Y.eZ.SessionAuthAgent,
                "The eZ.SessionAuthAgent object should have been imported in the sandbox"
            );
        },
    });

    Y.Test.Runner.setName("eZ CAPI Import module tests");
    Y.Test.Runner.add(importTest);
}, '', {requires: ['test', 'ez-capi']});
