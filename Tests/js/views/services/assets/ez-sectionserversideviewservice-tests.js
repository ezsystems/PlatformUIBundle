/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionserversideviewservice-tests', function (Y) {
    var contentDiscoverEventTest,
        assignSectionTest,
        Mock = Y.Mock, Assert = Y.Assert;

    contentDiscoverEventTest = new Y.Test.Case({
        name: "eZ Section Server Side View Service contentDiscover event handler test",

        setUp: function () {
            this.service = new Y.eZ.SectionServerSideViewService();
        },

        tearDown: function () {
            delete this.service;
        },

        "Should add the contentDiscovered handler": function () {
            var config = {};

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            Assert.isFunction(
                config.contentDiscoveredHandler,
                "The contentDiscovered should have been added"
            );
        },
    });

    assignSectionTest = new Y.Test.Case({
        name: "eZ Section Server Side View Service assign section test",

        setUp: function () {
            this.contentId = 'yellow-moon';
            this.sectionId = 'pearl-jam';
            this.capi = new Mock();
            this.contentService = new Mock();
            this.service = new Y.eZ.SectionServerSideViewService({
                capi: this.capi
            });
            Mock.expect(this.capi, {
                method: 'getContentService',
                returns: this.contentService,
            });
        },

        tearDown: function () {
            delete this.service;
            delete this.capi;
            delete this.contentService;
        },

        "Should assign the discovered content to the section": function () {
            var that = this,
                config = {},
                updateStruct = new Mock(),
                content = new Mock(),
                universalDiscovery = new Mock(),
                selection = {content: content},
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                };

            Mock.expect(content, {
                method: 'get',
                args: ['id'],
                returns: this.contentId
            });
            Mock.expect(universalDiscovery, {
                method: 'get',
                args: ['data'],
                returns: {
                    sectionId: this.sectionId,
                    afterUpdateCallback: callback,
                },
            });
            Mock.expect(this.contentService, {
                method: 'newContentMetadataUpdateStruct',
                returns: updateStruct,
            });
            Mock.expect(updateStruct, {
                method: 'setSection',
                args: [this.sectionId],
            });
            Mock.expect(this.contentService, {
                method: 'updateContentMetadata',
                args: [this.contentId, updateStruct, Mock.Value.Function],
                run: function (id, struct, cb) {
                    cb();
                },
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });
            Assert.isTrue(callbackCalled, "The afterUpdateCallback should have been called");
            Mock.verify(content);
            Mock.verify(universalDiscovery);
            Mock.verify(updateStruct);
        },
    });

    Y.Test.Runner.setName("eZ Section Server Side View Service tests");
    Y.Test.Runner.add(contentDiscoverEventTest);
    Y.Test.Runner.add(assignSectionTest);
}, '', {requires: ['test', 'ez-sectionserversideviewservice']});
