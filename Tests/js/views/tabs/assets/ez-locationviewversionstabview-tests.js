/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewversionstabview-tests', function (Y) {
    var attributesTest,
        renderTest,
        changeEventTest,
        fireLoadVersionsEventTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    attributesTest = new Y.Test.Case({
        name: "eZ LocationViewVersionsTabView attributes test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewVersionsTabView({
                content: {},
                locations: {},
                config: {},
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _readOnlyString: function (attr) {
            var value = this.view.get(attr);

            Assert.isString(
                this.view.get(attr),
                "The view should have a "+  attr
            );
            this.view.set(attr, value + 'somethingelse');
            Assert.areEqual(
                value, this.view.get(attr),
                "The " + attr + " should be readonly"
            );
        },

        "Should have a title": function () {
            this._readOnlyString('title');
        },

        "Should have a identifier": function () {
            this._readOnlyString('identifier');
        },

        "Should have a published versions object": function () {
            Assert.isObject(
                this.view.get('versions'),
                "versions should be an object"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ LocationViewVersionsTabView render test",
        setUp: function () {
            this.contentMock = new Mock();
            this.versions = {
                ARCHIVED: [],
                PUBLISHED: [],
                DRAFT: []
            };

            this.view = new Y.eZ.LocationViewVersionsTabView({
                content: this.contentMock,
                loadingError: false,
                config: {}
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Render should call the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },

        _createVersionMock: function () {
            var versionMock = new Mock();

            Mock.expect(versionMock, {
                'method': 'toJSON',
                returns: {}
            });

            return versionMock;
        },

        _addArchivedVersionMock: function() {
            this.versions.ARCHIVED.push(this._createVersionMock());
        },

        _addDraftVersionMock: function() {
            this.versions.DRAFT.push(this._createVersionMock());
        },

        _testVariables: function (archivedSize, publishedSize, draftSize, hasArchived, hasPublished, hasDraft) {
            this.view.template = Y.bind(function (args) {
                Assert.areEqual(
                    archivedSize,
                    args.archivedVersions.length,
                    "archivedVersions should be available in the template"
                );
                Assert.areEqual(
                    publishedSize,
                    args.publishedVersions.length,
                    "expectedArchivedSize should be available in the template"
                );
                Assert.areEqual(
                    draftSize,
                    args.draftVersions.length,
                    "draftVersions should be available in the template"
                );
                Assert.areEqual(
                    hasArchived,
                    args.hasArchived,
                    "hasArchived should be available in the template"
                );
                Assert.areEqual(
                    hasPublished,
                    args.hasPublished,
                    "hasPublished should be available in the template"
                );
                Assert.areEqual(
                    hasDraft,
                    args.hasDraft,
                    "hasDraft should be available in the template"
                );
                Assert.isFalse(
                    args.loadingError,
                    "loadingError should be available in the template"
                );
            }, this);

            this.view.render();
        },

        "Variables should be available in the template all status": function () {
            this._addArchivedVersionMock();
            this._addDraftVersionMock();
            this._addDraftVersionMock();
            this._addDraftVersionMock();

            this.view.set('versions', this.versions);

            this._testVariables(1, 0, 3, true, false, true);
        },
    });

    changeEventTest = new Y.Test.Case({
        name: "eZ LocationViewVersionsTabView change event test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewVersionsTabView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Test that versions change event calls render": function () {
            var renderCalled = false;

            this.view.render = function () {
                renderCalled = true;
            };

            this.view.set('versions', "truc");

            Assert.isTrue(
                renderCalled,
                "Render should have been called when versions attribute changes"
            );

        },
    });

    fireLoadVersionsEventTest = new Y.Test.Case({
        name: "eZ LocationViewVersionsTabView fire load versions event test",
        setUp: function () {
            this.contentMock = new Mock();

            this.view = new Y.eZ.LocationViewVersionsTabView({
                content: this.contentMock,
                container: '.container'
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadVersions event": function () {
            var loadVersionsCalled = false;

            this.view.once('loadVersions', Y.bind(function (e) {
                loadVersionsCalled = true;
                Assert.areSame(
                    this.contentMock,
                    e.content,
                    "The event facade should contain the content"
                );
            }, this));

            this.view.set('active', true);

            Assert.isTrue(loadVersionsCalled, "loadVersions should have been called");
        },

        "Should try to reload the versions when tapping on the retry button": function () {
            var that = this,
                loadVersionsFired = false;

            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);

            this.view.on('loadVersions', function () {
                loadVersionsFired = true;
            });

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isNull(
                        that.view.get('versions'),
                        "The `versions` attribute should not be defined"
                    );
                    Y.Assert.isTrue(
                        loadVersionsFired,
                        "The loadLocations event should have been fired"
                    );
                });
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Location View Versions Tab View tests");
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(changeEventTest);
    Y.Test.Runner.add(fireLoadVersionsEventTest);
}, '', {requires: ['test', 'ez-locationviewversionstabview', 'node-event-simulate']});
