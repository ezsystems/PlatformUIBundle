/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorxhtml5edit-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ Editor Content xhtml5edit processor process test",

        setUp: function () {
            this.processor = new Y.eZ.EditorContentProcessorXHTML5Edit();
        },

        tearDown: function () {
            delete this.processor;
        },

        "Should create a XHTML5Edit document": function () {
            var data = "<div><p>Foo Fighters - <span id='title'>The Neverending Sigh</span></p></div>",
                result = this.processor.process(data),
                doc = (new DOMParser()).parseFromString(result, 'text/xml');

            Assert.areEqual(
                'http://ez.no/namespaces/ezpublish5/xhtml5/edit',
                doc.documentElement.namespaceURI,
                "The document should be in the xhtml5edit namespace"
            );
            Assert.areEqual(
                'section', doc.documentElement.tagName,
                "The root element should be a <section>"
            );
            Assert.isNotNull(
                doc.querySelector('#title'),
                "The document content should be kept"
            );
        },

        "Should convert the HTML to XHTML": function () {
            var src = 'http://www.reactiongifs.com/r/ihy.gif',
                text = 'XHTML5Edit, I hate you',
                data = '<p>' + text + '</p><img src="' + src + '">',
                result = this.processor.process(data),
                doc = (new DOMParser()).parseFromString(result, 'text/xml');

            Assert.areEqual(
                'http://ez.no/namespaces/ezpublish5/xhtml5/edit',
                doc.documentElement.namespaceURI,
                "The document should be in the xhtml5edit namespace"
            );
            Assert.areEqual(
                'section', doc.documentElement.tagName,
                "The root element should be a <section>"
            );
            Assert.areEqual(
                text, doc.querySelector('p').textContent,
                "The document content should be kept"
            );
            Assert.areEqual(
                src, doc.querySelector('img').getAttribute('src'),
                "The document content should be kept"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editor Content xhtml5edit processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'ez-editorcontentprocessorxhtml5edit']});
