/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionserversideviewservice-tests', function (Y) {
    var contentDiscoverEventTest,
        assignSectionTest,
        refreshViewTest,
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
                contentInfo = new Mock(),
                universalDiscovery = new Mock(),
                selection = [{contentInfo: contentInfo}],
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                };

            Mock.expect(contentInfo, {
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
            Mock.verify(universalDiscovery);
            Mock.verify(updateStruct);
        },

        "Should notify about the start of assigning the section to contents process": function () {
            var that = this,
                config = {},
                updateStruct = new Mock(),
                contentId = this.contentId,
                sectionId = this.sectionId,
                contentInfo = new Mock(),
                universalDiscovery = new Mock(),
                selection = [{contentInfo: contentInfo}],
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                },
                notified = false;

            Mock.expect(contentInfo, {
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

            this.service.on('notify', function (e) {
                notified = true;

                Assert.areEqual(
                    "started", e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a String"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(contentId) !== -1,
                    "The notification identifier should contain the content id"
                );
                Assert.isTrue(
                    e.notification.identifier.indexOf(sectionId) !== -1,
                    "The notification identifier should contain the section id"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
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
            });

            this.service.fire('whatever:contentDiscover', {
                config: config,
            });

            config.contentDiscoveredHandler.call(this, {
                target: universalDiscovery,
                selection: selection
            });

            Assert.isTrue(notified, "The notify event should have been fired");
        },

        "Should notify about the success of assigning the section to contents": function () {
            var that = this,
                config = {},
                updateStruct = new Mock(),
                contentId = this.contentId,
                sectionId = this.sectionId,
                contentInfo = new Mock(),
                universalDiscovery = new Mock(),
                selection = [{contentInfo: contentInfo}],
                callbackCalled = false,
                callback = function () {
                    callbackCalled = true;
                    Assert.areSame(
                        that.service, this,
                        "The callback should be executed in the service context"
                    );
                },
                notificationId,
                notified = false;

            Mock.expect(contentInfo, {
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

            this.service.on('notify', function (e) {
                notificationId = e.notification.identifier;
                this.once('notify', function (e) {
                    notified = true;

                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a String"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(contentId) !== -1,
                        "The notification identifier should contain the content id"
                    );
                    Assert.isTrue(
                        e.notification.identifier.indexOf(sectionId) !== -1,
                        "The notification identifier should contain the section id"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 5"
                    );
                });
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

            Assert.isTrue(notified, "The notify event should have been fired");
        },
    });

    refreshViewTest = new Y.Test.Case({
        name: "eZ Section Server Side View Service refresh view test",

        setUp: function () {
            this.apiRoot = '/Tests/js/views/services/';
            this.title = 'Right Thoughts, Right Words, Right Actions';
            this.html = '<p>Right action</p>';

            this.pjaxResponse = '<div data-name="title">' + this.title + '</div>' +
            '<div data-name="html">' + this.html + '</div>';

            this.app = new Y.Mock();
            Y.Mock.expect(this.app, {
                method: 'get',
                args: ['apiRoot'],
                returns: this.apiRoot,
            });

            this.request = {'params': {'uri': ''}};

            Mock.expect(this.app, {
                method: 'set',
                args: ['loading', Mock.Value.Boolean],
            });

            this.view = new Y.Base();

            this.request.params.uri = 'echo/get/html/?response='+ this.pjaxResponse;
            this.service = new Y.eZ.SectionServerSideViewService({
                request: this.request,
                app: this.app,
            });

            this.view.addTarget(this.service);
        },

        tearDown: function () {
            delete this.service;
            delete this.view;
        },

        "Should update the html attribute": function () {
            this.view.after('htmlChange', this.next(function () {
                Assert.areSame(
                    this.html,
                    this.view.get('html'),
                    "`html` attribute should have been updated"
                );
            }), this);

            this.view.fire('whatever:refreshView');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Section Server Side View Service tests");
    Y.Test.Runner.add(contentDiscoverEventTest);
    Y.Test.Runner.add(assignSectionTest);
    Y.Test.Runner.add(refreshViewTest);
}, '', {requires: ['test', 'ez-sectionserversideviewservice']});
