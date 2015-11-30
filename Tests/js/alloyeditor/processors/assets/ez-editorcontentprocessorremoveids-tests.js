/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorremoveids-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ Editor Content removeids processor process test",

        setUp: function () {
            this.processor = new Y.eZ.EditorContentProcessorRemoveIds();
        },

        tearDown: function () {
            delete this.processor;
        },

        "Should remove the ids": function () {
            var data = "<div><p id='music'>Foo Fighters - <span id='title'>The Neverending Sigh</span></p></div>",
                result = this.processor.process(data),
                doc = (new DOMParser()).parseFromString(result, 'text/xml');

            Assert.isNull(
                doc.querySelector('#music'),
                "The #music id should be removed"
            );
            Assert.isNull(
                doc.querySelector('#title'),
                "The #title id should be removed"
            );
            Assert.areEqual(
                "<div><p>Foo Fighters - <span>The Neverending Sigh</span></p></div>",
                result,
                "The XML document should be kept"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editor Content removeids processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'ez-editorcontentprocessorremoveids']});
