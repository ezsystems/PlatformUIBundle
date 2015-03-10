/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverybrowseview-tests', function (Y) {
    var resetTest, defaultSubViewTest, treeNavigateTest, renderTest, unselectTest,
        multipleUpdateTest,
        Assert = Y.Assert, Mock = Y.Mock;

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse reset tests',

        setUp: function () {
            this.treeView = new Mock();
            this.selectedView = new Mock();
            Mock.expect(this.selectedView, {
                method: 'reset',
            });
            Mock.expect(this.treeView, {
                method: 'reset',
            });
            this.view = new Y.eZ.UniversalDiscoveryBrowseView({
                treeView: this.treeView,
                selectedView: this.selectedView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.treeView;
            delete this.selectedView;
        },

        "Should keep and reset the treeView and the selectedView": function () {
            this.view.reset();
            Mock.verify(this.treeView);
            Mock.verify(this.selectedView);
            Assert.areSame(
                this.treeView, this.view.get('treeView'),
                "The treeView should be kept"
            );
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
            Mock.verify(this.treeView);
            Mock.verify(this.selectedView);
        },
    });

    defaultSubViewTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse default sub views tests',
                       
        setUp: function () {
            Y.eZ.TreeView = Y.Base.create('treeView', Y.View, [], {});
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {});
            this.view = new Y.eZ.UniversalDiscoveryBrowseView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.TreeView;
            delete Y.eZ.UniversalDiscoverySelectedView;
        },

        "treeView should be an instance of eZ.TreeView": function () {
            Assert.isInstanceOf(
                Y.eZ.TreeView, this.view.get('treeView'),
                "The treeView attribute value should an instance of eZ.TreeView"
            );
        },

        "selectedView should be an instance of eZ.UniversalDiscoverySelectedView": function () {
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoverySelectedView, this.view.get('selectedView'),
                "The selectedView attribute value should an instance of eZ.UniversalDiscoverySelectedView"
            );
        },

        "Should be a bubble target of the treeView": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('treeView').fire('whatever');
            Assert.isTrue(bubble, "The event should bubble to the browse view");
        },

        "Should be a bubble target of the selectedView": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('selectedView').fire('whatever');
            Assert.isTrue(bubble, "The event should bubble to the browse view");
        },

        "Should set the selectedView's addConfirmButton": function () {
            Assert.isFalse(
                this.view.get('selectedView').get('addConfirmButton'),
                "The selectedView's addConfirmButton flag should be false"
            );
        },
    });

    treeNavigateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse treeNavigate event tests',

        setUp: function () {
            this.selectedView = new Mock();
            this.treeView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryBrowseView({
                selectedView: this.selectedView,
                treeView: this.treeView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
            delete this.treeView;
        },

        "Should fire the `selectContent` event and update the selectedView": function () {
            var tree = new Mock(),
                node = new Mock(),
                nodeData = {},
                nodeId = 42,
                selectContent = false;

            node.data = nodeData;
            Mock.expect(node, {
                method: 'select',
            });
            Mock.expect(tree, {
                method: 'getNodeById',
                args: [nodeId],
                returns: node,
            });
            Mock.expect(this.selectedView, {
                method: 'set',
                args: ['contentStruct', nodeData],
            });

            this.view.after('*:treeNavigate', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The treeNavigate event should have been prevented"
                );
            });

            this.view.on('selectContent', function (e) {
                selectContent = true;

                Assert.areSame(
                    nodeData, e.selection,
                    "The node data should be provided in the selectContent event facade"
                );
            });

            this.view.fire('whatever:treeNavigate', {
                nodeId: nodeId,
                tree: tree,
            });

            Assert.isTrue(selectContent, "The selectContent event should have been fired");
            Mock.verify(tree);
            Mock.verify(node);
            Mock.verify(this.selectedView);
        },
    });

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse render tests',
                       
        setUp: function () {
            var that = this;

            this.treeViewRendered = false;
            this.selectedViewRendered = false;
            Y.eZ.TreeView = Y.Base.create('treeView', Y.View, [], {
                render: function () {
                    that.treeViewRendered = true;
                    return this;
                },
            });
            Y.eZ.UniversalDiscoverySelectedView = Y.Base.create('selectedView', Y.View, [], {
                render: function () {
                    that.selectedViewRendered = true;
                    return this;
                },
            });
            this.view = new Y.eZ.UniversalDiscoveryBrowseView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.TreeView;
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

        "Should render the treeView and the selectedView": function () {
            var container = this.view.get('container'),
                treeViewContainer = this.view.get('treeView').get('container'),
                selectedViewContainer = this.view.get('selectedView').get('container');

            this.view.render();

            Assert.isTrue(this.treeViewRendered, "The treeView should have been rendered");
            Assert.isTrue(this.selectedViewRendered, "The selectedView should have been rendered");

            Assert.isTrue(
                container.contains(treeViewContainer),
                "The rendered treeView should be added to the browse view"
            );
            Assert.isTrue(
                container.contains(selectedViewContainer),
                "The rendered selectedView should be added to the browse view"
            );

            Assert.isTrue(
                treeViewContainer.get('parentNode').hasClass('ez-ud-browse-tree'),
                "The treeView should be added in the ez-ud-browse-tree element"
            );
            Assert.isTrue(
                selectedViewContainer.get('parentNode').hasClass('ez-ud-browse-selected'),
                "The selectedView should be added in the ez-ud-browse-selected element"
            );
        },
    });

    unselectTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Browse visibility change unselect tests',

        setUp: function () {
            this.selectedView = new Mock();
            this.treeView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryBrowseView({
                selectedView: this.selectedView,
                treeView: this.treeView,
                visible: true,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.selectedView;
            delete this.treeView;
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
        name: 'eZ Universal Discovery Browse multiple update test',

        setUp: function () {
            this.selectedView = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryBrowseView({
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
                method: 'set',
                args: ['addConfirmButton', multipleValue],
            });
            this.view.set('multiple', multipleValue);
            Mock.verify(this.selectedView);
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Browse View tests");
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(defaultSubViewTest);
    Y.Test.Runner.add(treeNavigateTest);
    Y.Test.Runner.add(unselectTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(multipleUpdateTest);
}, '', {requires: ['test', 'view', 'ez-universaldiscoverybrowseview']});
