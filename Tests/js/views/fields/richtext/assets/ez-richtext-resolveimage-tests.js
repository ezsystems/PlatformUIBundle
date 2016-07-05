/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-resolveimage-tests', function (Y) {
    var processTest, noProcessTest, useSelectionTest,
        Assert = Y.Assert, Mock = Y.Mock;

    processTest = new Y.Test.Case({
        name: "eZ RichText resolve image process test",

        setUp: function () {
            this.containerContent = Y.one('.container').getContent();
            this.processor = new Y.eZ.RichTextResolveImage();
            this.view = new Y.View({
                container: Y.one('.container'),
                field: {id: 42},
            });
            this.fields = {};
            this.fields["41"] = {'image': {}};
            this.fields["42"] = {'image': {}};
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        "Should render the images as loading": function () {
            var image1 = this.view.get('container').one('#image1'),
                image2 = this.view.get('container').one('#image2');

            this.processor.process(this.view);

            Assert.isTrue(
                image1.hasClass('is-embed-loading'),
                "The image should get the loading class"
            );
            Assert.isTrue(
                image2.hasClass('is-embed-loading'),
                "The image should get the loading class"
            );
            Assert.areEqual(
                'p', image1.one('.ez-embed-content').get('localName'),
                "The image content element should have been added"
            );
            Assert.areEqual(
                'p', image2.one('.ez-embed-content').get('localName'),
                "The image content element should have been added"
            );
        },

        "Should ignore already rendered image": function () {
            var image = this.view.get('container').one('#image-loaded');

            this.processor.process(this.view);
            Assert.isFalse(
                image.hasClass('is-embed-loading'),
                "The already loaded image should be ignored"
            );
        },

        "Should ignore embed not representing images": function () {
            var notImage = this.view.get('container').one('#not-image');

            this.processor.process(this.view);
            Assert.isFalse(
                notImage.hasClass('is-embed-loading'),
                "embed not representing an image should be ignored"
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
                Assert.isTrue(
                    e.loadContent,
                    "The search should be configured to load the content"
                );
                Assert.isTrue(
                    e.loadContentType,
                    "The search should be configured to load the content type"
                );
            });
            this.processor.process(this.view);

            Assert.isTrue(search, "A search should be triggered");
        },

        _getContentMock: function (contentId) {
            var content = new Mock(),
                attrs = {contentId: contentId, name: "name-" + contentId, fields: this.fields[contentId]};

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

        _getContentTypeMock: function () {
            var type = new Mock();

            Mock.expect(type, {
                method: 'getFieldDefinitionIdentifiers',
                args: ['ezimage'],
                returns: ['image'],
            });
            return type;
        },

        "Should load the variations": function () {
            var content1 = this._getContentMock("41"),
                content2 = this._getContentMock("42"),
                type = this._getContentTypeMock(),
                loadImageVariation = 0;

            this.view.once('contentSearch', function (e) {
                e.callback.call(this, false, [{content: content1, contentType: type}, {content: content2, contentType: type}]);
            });
            this.view.on('loadImageVariation', Y.bind(function (e) {
                loadImageVariation++;
                if ( this.fields["41"].image === e.field ) {
                    Assert.areEqual(
                        "large", e.variation,
                        "The 'large' variation should be requested"
                    );
                } else if ( this.fields["42"].image === e.field ) {
                    Assert.areEqual(
                        "medium", e.variation,
                        "The 'medium' variation should be requested"
                    );
                } else {
                    Assert.fail("Unexpected field in loadImageVariation parameter");
                }
            }, this));
            this.processor.process(this.view);

            Assert.areEqual(
                2, loadImageVariation,
                "The loadImageVariation event should have been fired 2 times"
            );
        },

        "Should render images": function () {
            var image1 = this.view.get('container').one('#image1'),
                image2 = this.view.get('container').one('#image2'),
                content1 = this._getContentMock("41"),
                content2 = this._getContentMock("42"),
                type = this._getContentTypeMock(),
                uri = "http://www.reactiongifs.com/r/The-Hills.gif";

            this.view.once('contentSearch', function (e) {
                e.callback.call(this, false, [{content: content1, contentType: type}, {content: content2, contentType: type}]);
            });
            this.view.on('loadImageVariation', Y.bind(function (e) {
                e.callback.call(this, false, {uri: uri});
            }));
            this.processor.process(this.view);

            Assert.isFalse(
                image1.hasClass('is-embed-loading'),
                "The loading class should have been removed"
            );
            Assert.areEqual(
                "img", image1.one('.ez-embed-content').get('localName'),
                "The image should be rendered"
            );
            Assert.areEqual(
                uri, image1.one('.ez-embed-content').getAttribute('src'),
                "The image should be rendered"
            );
            Assert.areEqual(
                "name-41", image1.one('.ez-embed-content').getAttribute('alt'),
                "The image should be rendered"
            );
            Assert.isFalse(
                image2.hasClass('is-embed-loading'),
                "The loading class should have been removed"
            );
            Assert.areEqual(
                "img", image2.one('.ez-embed-content').get('localName'),
                "The image should be rendered"
            );
            Assert.areEqual(
                uri, image2.one('.ez-embed-content').getAttribute('src'),
                "The image should be rendered"
            );
            Assert.areEqual(
                "name-42", image2.one('.ez-embed-content').getAttribute('alt'),
                "The image should be rendered"
            );
        },
    });

    noProcessTest = new Y.Test.Case({
        // regression test for EZP-25941
        name: "eZ RichText resolve image process without image test",

        setUp: function () {
            this.containerContent = Y.one('.container-noimage').getContent();
            this.processor = new Y.eZ.RichTextResolveImage();
            this.view = new Y.View({
                container: Y.one('.container-noimage'),
                field: {id: 42},
            });
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        "Should not search for non existing image content": function () {
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
        name: "eZ RichText resolve image process using the selection test",

        setUp: function () {
            var container = Y.one('.container-useselection'),
                fields = {};

            this.containerContent = container.getContent();
            this.processor = new Y.eZ.RichTextResolveImage();
            this.view = new Y.View({
                container: container,
                field: {id: 42},
            });

            this.imageFieldIdentifier = 'image';
            this.contentType = new Mock();
            Mock.expect(this.contentType, {
                method: 'getFieldDefinitionIdentifiers',
                args: ['ezimage'],
                returns: [this.imageFieldIdentifier],
            });
            this.content = new Y.Base();
            this.contentInfo = new Y.Base();
            fields[this.imageFieldIdentifier] = {};
            this.content.set('contentId', 41);
            this.contentInfo.set('contentId', this.content.get('contentId'));
            this.content.set('name', 'name-' + this.content.get('contentId'));
            this.content.set('fields', fields);
        },

        tearDown: function () {
            this.view.get('container').setContent(this.containerContent);
            this.view.destroy();
            delete this.view;
            delete this.processor;
        },

        _process: function () {
            this.processor.process(this.view, {
                embedStruct: {
                    content: this.content,
                    contentInfo: this.contentInfo,
                    contentType: this.contentType,
                }
            });
        },

        _getEmbedNode: function () {
            return this.view.get('container').one('#image-useselection');
        },

        "Should set the embed image as loading": function () {
            var embed = this._getEmbedNode();

            this._process();

            Assert.isTrue(
                embed.hasClass('is-embed-loading'),
                "The embed should be in loading mode"
            );
        },

        "Should load the variation": function () {
            var loadImageVariationFired = false;

            this.view.on('loadImageVariation', Y.bind(function (e) {
                loadImageVariationFired = true;

                Assert.areSame(
                    this.content.get('fields')[this.imageFieldIdentifier],
                    e.field,
                    "The image field should be provided"
                );
                Assert.areEqual(
                    'medium', e.variation,
                    "The medium variation should be loaded"
                );
            }, this));
            this._process();

            Assert.isTrue(
                loadImageVariationFired,
                "The loadImageVariation event should have been fired"
            );
        },

        "Should use the selection to render the embed": function () {
            var embed = this._getEmbedNode(),
                imgNode,
                variation = {
                    uri: "http://www.reactiongifs.com/r/clk.gif",
                };

            this.view.on('loadImageVariation', Y.bind(function (e) {
                e.callback(false, variation);
            }, this));
            this._process();

            Assert.isFalse(
                embed.hasClass('is-embed-loading'),
                "The embed should not be in loading mode"
            );
            imgNode = embed.one('.ez-embed-content');

            Assert.areEqual(
                variation.uri,
                imgNode.getAttribute('src'),
                "An img should be filled with the variation uri"
            );
            Assert.areEqual(
                this.content.get('name'),
                imgNode.getAttribute('alt'),
                "The alt attribute should be the content name"
            );
        },
    });

    Y.Test.Runner.setName("eZ RichText resolve image processor tests");
    Y.Test.Runner.add(processTest);
    Y.Test.Runner.add(noProcessTest);
    Y.Test.Runner.add(useSelectionTest);
}, '', {requires: ['test', 'base', 'view', 'ez-richtext-resolveimage']});
