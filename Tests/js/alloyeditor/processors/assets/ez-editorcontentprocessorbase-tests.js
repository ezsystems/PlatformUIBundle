/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorbase-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ Editor Content base processor process test",

        setUp: function () {
            this.processor = new Y.eZ.EditorContentProcessorBase();
        },

        tearDown: function () {
            delete this.processor;
        },

        "Should return data without change": function () {
            var data = "whatever";

            Assert.areSame(
                data, this.processor.process(data),
                "process() should return `data` without change"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editor Content base processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'ez-editorcontentprocessorbase']});
