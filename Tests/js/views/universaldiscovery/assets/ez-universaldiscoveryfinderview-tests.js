/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryfinderview-tests', function (Y) {
    var resetTest, defaultSubViewTest, renderTest, unselectTest,
        multipleUpdateTest, onUnselectContentTest, selectContentTest,
        Assert = Y.Assert, Mock = Y.Mock;

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder reset tests',

        setUp: function () {
            this.selectedView = new Mock();
            Mock.expect(this.selectedView, {
                method: 'reset',
            });
            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object]
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderView({
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should keep and reset the selectedView": function () {
            this.view.reset();
            Mock.verify(this.selectedView);
            Assert.areSame(
                this.selectedView, this.view.get('selectedView'),
                "The selectedView should be kept"
            );
        },

        "Should keep the title and identifier": function () {
            var title = this.view.get('title'),
                identifier = this.view.get('identifier');

            this.view.reset();
            Assert.areEqual(
                title, this.view.get('title'),
                "The title should be kept intact"
            );
            Assert.areEqual(
                identifier, this.view.get('identifier'),
                "The identifier should be kept intact"
            );
            Mock.verify(this.selectedView);
        },
    });

    defaultSubViewTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder default sub views tests',

        setUp: function () {
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});
            this.view = new Y.eZ.UniversalDiscoveryFinderView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoverySelectedView;
        },

        "selectedView should be an instance of eZ.UniversalDiscoverySelectedView": function () {
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoverySelectedView, this.view.get('selectedView'),
                "The selectedView attribute value should an instance of eZ.UniversalDiscoverySelectedView"
            );
        },

        "Should be a bubble target of the selectedView": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('selectedView').fire('whatever');
            Assert.isTrue(bubble, "The event should bubble to the finder view");
        },

        "Should set the selectedView's addConfirmButton": function () {
            Assert.isFalse(
                this.view.get('selectedView').get('addConfirmButton'),
                "The selectedView's addConfirmButton flag should be false"
            );
        },
    });

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder render tests',

        setUp: function () {
            var that = this;

            this.selectedViewRendered = false;
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {
                render: function () {
                    that.selectedViewRendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.UniversalDiscoveryFinderView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoverySelectedView;
        },

        "Should use the template": function () {
            var origTpl = this.view.template,
                templateCalled = false;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();

            Assert.isTrue(
                templateCalled, "The template should have been used to render the view"
            );
        },

        "Should render the selectedView": function () {
            var container = this.view.get('container'),
                selectedViewContainer = this.view.get('selectedView').get('container');

            this.view.render();

            Assert.isTrue(this.selectedViewRendered, "The selectedView should have been rendered");

            Assert.isTrue(
                container.contains(selectedViewContainer),
                "The rendered selectedView should be added to the finder view"
            );
            Assert.isTrue(
                selectedViewContainer.get('parentNode').hasClass('ez-ud-finder-selected'),
                "The selectedView should be added in the ez-ud-finder-selected element"
            );
        },
    });

    unselectTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder visibility change unselect tests',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryFinderView({
                selectedView: this.selectedView,
                visible: true,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should fire the selectContent with a null selection": function () {
            var selectContent = false;

            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['contentStruct', null],
            });
            this.view.on('selectContent', function (e) {
                selectContent = true;
                Assert.isNull(
                    e.selection,
                    "The selectContent event facade should contain a null selection"
                );
            });

            this.view.set('visible', false);
            Assert.isTrue(
                selectContent,
                "The selectContent event should have been fired"
            );
            Mock.verify(this.selectedView);
        },
    });

    multipleUpdateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Finder multiple update test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryFinderView({
                selectedView: this.selectedView,
                treeView: {},
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should forward the multiple value to the selectedView": function () {
            var multipleValue = true;

            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object],
                run: function (atrrs) {
                    Assert.areSame(
                        atrrs.addConfirmButton,
                        multipleValue,
                        "addConfirmButton attribute should be the same as `multiple` flag"
                    );
                }
            });
            this.view.set('multiple', multipleValue);
            Mock.verify(this.selectedView);
        },

        "Should forward the isSelectable function to the selectedView": function () {
            var isSelectable = function (contentStruct) {return true;};

            Mock.expect(this.selectedView, {
                method: 'setAttrs',
                args: [Mock.Value.Object],
                run: function (atrrs) {
                    Assert.areSame(
                        atrrs.isSelectable,
                        isSelectable,
                        "isSelectable function should be passed to the view"
                    );
                }
            });
            this.view.set('isSelectable', isSelectable);
            Mock.verify(this.selectedView);
        },
    });

    selectContentTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse select content test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryFinderView({
                selectedView: this.selectedView,
                visible: true,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should fire the selectContent event": function () {
            var selectContent = false,
                struct = {id: 'struct'};

            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['contentStruct', struct],
            });
            this.view.on('selectContent', function (e) {
                selectContent = true;
                Assert.areSame(
                    struct,
                    e.selection,
                    "The selectContent event facade should contain the struct"
                );
            });

            this.view.selectContent(struct);
            Assert.isTrue(
                selectContent,
                "The selectContent event should have been fired"
            );
            Mock.verify(this.selectedView);
        },

    });

    onUnselectContentTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse onUnselectContentTest test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryFinderView({
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
        },

        "Should ignore an empty selectedView": function () {
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: null
            });
            this.view.onUnselectContent(42);
            Mock.verify(this.selectedView);
        },

        "Should ignore when the selectedView displays a different content": function () {
            var contentInfo = new Mock(),
                contentId = 42;

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: (contentId + 1),
            });
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: {contentInfo: contentInfo},
            });
            this.view.onUnselectContent(contentId);
            Mock.verify(contentInfo);
            Mock.verify(this.selectedView);
        },

        "Should enable the button and reset the animated element": function () {
            var contentInfo = new Mock(),
                contentId = 42;

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: contentId,
            });
            Mock.expect(this.selectedView, {
                method: 'get',
                args: ['contentStruct'],
                returns: {contentInfo: contentInfo},
            });
            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['confirmButtonEnabled', true],
            });
            this.view.onUnselectContent(contentId);
            Mock.verify(contentInfo);
            Mock.verify(this.selectedView);
        },
    });


    Y.Test.Runner.setName("eZ Universal Discovery Finder View tests");
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(defaultSubViewTest);
    Y.Test.Runner.add(unselectTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(multipleUpdateTest);
    Y.Test.Runner.add(selectContentTest);
    Y.Test.Runner.add(onUnselectContentTest);
}, '', {requires: ['test', 'view', 'ez-universaldiscoveryfinderview']});
