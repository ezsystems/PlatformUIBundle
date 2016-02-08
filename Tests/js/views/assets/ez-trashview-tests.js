/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashview-tests', function (Y) {
    var test, eventsTest, attributesTest,
        Mock = Y.Mock, Assert = Y.Assert,

    RenderedView = Y.Base.create('renderedView', Y.View, [], {
        render: function () {
            this.set('rendered', true);
            return this;
        },
    });

    test = new Y.Test.Case({
        name: "eZ Trash view tests",

        setUp: function () {
            this.itemMock = new Mock();
            Mock.expect(this.itemMock, {
                method: "toJSON",
                args: []
            });

            this.parentLocationMock = new Mock();
            Mock.expect(this.parentLocationMock, {
                method: "toJSON",
                args: []
            });

            this.contentTypeMock = new Mock();
            Mock.expect(this.contentTypeMock, {
                method: "toJSON",
                args: []
            });

            this.trashItems = [{
                item: this.itemMock,
                parentLocation: this.parentLocationMock,
                contentType: this.contentTypeMock
            }];

            this.barView = new RenderedView();

            this.view = new Y.eZ.TrashView({
                trashItems: this.trashItems,
                trashBar: this.barView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render the view": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(
                templateCalled,
                "The template should have used to render the view"
            );

            Assert.isTrue(
                this.view.get('trashBar').get('rendered'),
                "The bar view should have been rendered"
            );

            Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the view"
            );

            Assert.areEqual(
                container.one('.ez-trashview-content').getStyle('min-height'),
                container.get('winHeight') + 'px'
            );

            Mock.verify(this.itemMock);
            Mock.verify(this.parentLocationMock);
            Mock.verify(this.contentTypeMock);
        },
    });

    eventsTest = new Y.Test.Case({
        name: "eZ Trash view events handling tests",

        setUp: function () {
            this.view = new Y.eZ.TrashView({
                trashBar: new Y.View(),
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "The trash bar minimized class should be toggled by the minimizeTrashBarAction event": function () {
            var container = this.view.get('container');

            this.view.fire('whatever:minimizeTrashBarAction');
            Assert.isTrue(
                container.hasClass('is-trashbar-minimized'),
                "The trash view container should get the trash bar minimized class"
            );
            this.view.fire('whatever:minimizeTrashBarAction');
            Assert.isFalse(
                container.hasClass('is-trashbar-minimized'),
                "The trash view container should NOT get the trash bar minimized class"
            );
        },
    });

    attributesTest = new Y.Test.Case({
        name: "eZ Trash view attribute tests",

        setUp: function () {
            this.view = new Y.eZ.TrashView({});
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should provide the TrashBarView as an attribute": function () {
            var trashBar = this.view.get('trashBar');

            Assert.isInstanceOf(
                Y.eZ.TrashBarView,
                trashBar,
                "The trashbar should be an instance of Y.eZ.TrashBarView"
            );
        },
    });

    Y.Test.Runner.setName("eZ Trash view tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(attributesTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-trashview', 'ez-trashbarview']});
