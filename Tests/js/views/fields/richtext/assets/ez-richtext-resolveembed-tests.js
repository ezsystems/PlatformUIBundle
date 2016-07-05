/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-resolveembed-tests', function (Y) {
    var processTest, noProcessTest, useSelectionTest,
        Assert = Y.Assert, Mock = Y.Mock;

    processTest = new Y.Test.Case({
        name: "eZ RichText resolve embed process test",

        setUp: function () {
            this.containerContent = Y.one('.container').getContent();
            this.processor = new Y.eZ.RichTextResolveEmbed();
            this.view = new Y.View({
                container: Y.one('.container'),
                field: {id: 42},
            });
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        "Should render the embeds as loading": function () {
            var embed1 = this.view.get('container').one('#embed1'),
                embed2 = this.view.get('container').one('#embed2');

            this.processor.process(this.view);

            Assert.isTrue(
                embed1.hasClass('is-embed-loading'),
                "The embed should get the loading class"
            );
            Assert.isTrue(
                embed2.hasClass('is-embed-loading'),
                "The embed should get the loading class"
            );
            Assert.isTrue(
                !!embed1.one('.ez-embed-content'),
                "The embed content element should have been added"
            );
            Assert.isTrue(
                !!embed1.one('.ez-embed-content'),
                "The embed content element should have been added"
            );
        },

        "Should ignore already rendered embed": function () {
            var embed = this.view.get('container').one('#embed-loaded');

            this.processor.process(this.view);
            Assert.isFalse(
                embed.hasClass('is-embed-loading'),
                "The already loaded embed should be ignored"
            );
        },

        "Should search for the corresponding content": function () {
            var search = false;

            this.view.once('contentSearch', function (e) {
                search = true;

                Assert.areEqual(
                    "41,42",
                    e.search.criteria.ContentIdCriterion,
                    "The content should be loaded by id"
                );
            });
            this.processor.process(this.view);

            Assert.isTrue(search, "A search should be triggered");
        },

        _getContentMock: function (contentId) {
            var content = new Mock(),
                attrs = {contentId: contentId, name: "name-" + contentId};

            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attrs[attr] ) {
                        return attrs[attr];
                    }
                    Assert.fail("Unexpected call to get('" + attr + "')");
                },
            });
            return content;
        },

        "Should render embeds": function () {
            var embed1 = this.view.get('container').one('#embed1'),
                embed2 = this.view.get('container').one('#embed2'),
                content1 = this._getContentMock(41),
                content2 = this._getContentMock(42);

            this.view.once('contentSearch', function (e) {
                e.callback.call(this, false, [{content: content1}, {content: content2}]);
            });
            this.processor.process(this.view);

            Assert.isFalse(
                embed1.hasClass('is-embed-loading'),
                "The loading class should have been removed"
            );
            Assert.areEqual(
                "name-41", embed1.one('.ez-embed-content').getContent(),
                "The embed should be rendered"
            );
            Assert.isFalse(
                embed2.hasClass('is-embed-loading'),
                "The loading class should have been removed"
            );
            Assert.areEqual(
                "name-42", embed2.one('.ez-embed-content').getContent(),
                "The embed should be rendered"
            );
        },
    });

    noProcessTest = new Y.Test.Case({
        // regression test for EZP-25941
        name: "eZ RichText resolve embed process without embed test",

        setUp: function () {
            this.containerContent = Y.one('.container-noembed').getContent();
            this.processor = new Y.eZ.RichTextResolveEmbed();
            this.view = new Y.View({
                container: Y.one('.container-noembed'),
                field: {id: 42},
            });
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        "Should not search for non existing embed": function () {
            this.view.on('contentSearch', function () {
                Assert.fail('No search should have been triggered');
            });
            this.processor.process(this.view);
        },

        "Should handle non existing embed node": function () {
            var contentInfo = new Y.Base();

            contentInfo.set('contentId', 'whatever');
            this.view.on('contentSearch', function () {
                Assert.fail('No search should have been triggered');
            });
            this.processor.process(this.view, {
                embedStruct: {
                    contentInfo: contentInfo,
                }
            });
            Assert.areEqual(
                this.containerContent,
                this.view.get('container').getContent(),
                "The view container content should remain unchanged"
            );
        },
    });

    useSelectionTest = new Y.Test.Case({
        name: "eZ RichText resolve embed process using the selection test",

        setUp: function () {
            var container = Y.one('.container-useselection'),
                contentInfo = new Y.Base();

            this.containerContent = container.getContent();
            this.processor = new Y.eZ.RichTextResolveEmbed();
            this.view = new Y.View({
                container: container,
                field: {id: 42},
            });

            contentInfo.set('contentId', 41);
            contentInfo.set('name', 'name-' + contentInfo.get('contentId'));
            this.contentInfo = contentInfo;
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        "Should use the selection to render the embed": function () {
            var embed = this.view.get('container').one('#embed-selection');

            this.processor.process(this.view, {
                embedStruct: {
                    contentInfo: this.contentInfo,
                }
            });

            Assert.areEqual(
                this.contentInfo.get('name'),
                embed.one('.ez-embed-content').getContent(),
                "The embed should be rendered"
            );
        },
    });

    Y.Test.Runner.setName("eZ RichText resolve embed processor tests");
    Y.Test.Runner.add(processTest);
    Y.Test.Runner.add(noProcessTest);
    Y.Test.Runner.add(useSelectionTest);
}, '', {requires: ['test', 'base', 'view', 'ez-richtext-resolveembed']});
