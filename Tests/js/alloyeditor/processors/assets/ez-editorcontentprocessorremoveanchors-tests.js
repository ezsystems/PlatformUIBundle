/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorremoveanchors-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ Editor Content removeanchors processor process test",

        setUp: function () {
            this.processor = new Y.eZ.EditorContentProcessorRemoveAnchors();
        },

        tearDown: function () {
            delete this.processor;
        },

        "Should remove anchors": function () {
            var data, result;

            data = '<p><a name="track1"></a>The Fratelis - Henrietta</p>';
            data += '<p><a name="track2"></a>The Fratelis - Flathead</p>';
			result = this.processor.process(data);

            Assert.areEqual(
                '<p>The Fratelis - Henrietta</p><p>The Fratelis - Flathead</p>',
                result,
                "The anchor should have been removed"
            );
        },

        "Should keep links": function () {
            var data, result;

            data = '<p><a href="http://ez.no">eZ</a></p>';
            data += '<p><a href="http://ezplatform.com/">eZ Platform</a></p>';
			result = this.processor.process(data);

            Assert.areEqual(
                data, result,
                "The HTML code should be unchanged"
            );
        },
    });

    Y.Test.Runner.setName("eZ Editor Content removeanchors processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'ez-editorcontentprocessorremoveanchors']});
