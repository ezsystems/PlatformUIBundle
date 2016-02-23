/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessoremptyembed-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ Editor Content emptyembed processor process test",

        setUp: function () {
            this.processor = new Y.eZ.EditorContentProcessorEmptyEmbed();
        },

        tearDown: function () {
            delete this.processor;
        },

        "Should empty the embeds": function () {
            var data, result;

			data  = "<div data-href='42' data-ezelement='ezembed'>not empty</div>";
			data += "<div data-href='43' data-ezelement='ezembed'><p>Saez - J'Veux M'En Aller</p></div>";
			result = this.processor.process(data);

            Assert.areEqual(
				'<div data-href="42" data-ezelement="ezembed"></div><div data-href="43" data-ezelement="ezembed"></div>',
				result,
                "The embed should be empty"
            );
        },

        "Should keep the embed config": function () {
            var data = "<div data-ezelement='ezembed'><span data-ezelement='ezconfig'></span>not empty</div>",
                result = this.processor.process(data);

			Assert.areEqual(
				'<div data-ezelement="ezembed"><span data-ezelement="ezconfig"></span></div>',
				result,
				"The embed config should have been kept"
			);
        },
    });

    Y.Test.Runner.setName("eZ Editor Content emptyembed processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'ez-editorcontentprocessoremptyembed']});
