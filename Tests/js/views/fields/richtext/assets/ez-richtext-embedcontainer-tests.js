/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-embedcontainer-tests', function (Y) {
    var processTest,
        Assert = Y.Assert;

    processTest = new Y.Test.Case({
        name: "eZ RichText embed container process test",

        setUp: function () {
            this.containerContent = Y.one('.container').getContent();
            this.processor = new Y.eZ.RichTextEmbedContainer();
            this.view = new Y.View({container: Y.one('.container')});
            this.processor.process(this.view);
        },

        tearDown: function () {
            delete this.processor;
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
        },

        "Should add a container": function () {
            var embed = this.view.get('container').one('[data-ezelement="ezembed"]');

            Assert.isTrue(
                embed.get('parentNode').hasClass('ez-richtext-embedcontainer'),
                "A container div should have been added to the embed"
            );
        },

        "Should add the alignment on the container": function () {
            var embed = this.view.get('container').one('[data-ezelement="ezembed"]');

            Assert.areEqual(
                embed.getAttribute('data-ezalign'),
                embed.get('parentNode').getAttribute('data-ezalign'),
                "The alignment should be set on the container"
            );
        },
    });

    Y.Test.Runner.setName("eZ RichText embed container processor tests");
    Y.Test.Runner.add(processTest);
}, '', {requires: ['test', 'view', 'ez-richtext-embedcontainer']});
