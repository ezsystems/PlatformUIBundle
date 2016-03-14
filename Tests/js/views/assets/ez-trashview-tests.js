/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashview-tests', function (Y) {
    var test, minimizeTest, attributesTest, restoreTest, updateDisableTest,
        Mock = Y.Mock, Assert = Y.Assert;

    test = new Y.Test.Case({
        name: "eZ Trash view tests",

        setUp: function () {
            var RenderedView = Y.Base.create('renderedView', Y.View, [], {
                    render: function () {
                        this.set('rendered', true);
                        return this;
                    },
                });

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

    minimizeTest = new Y.Test.Case({
        name: "eZ Trash view minimize tests",

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

    updateDisableTest = new Y.Test.Case({
        name: "eZ Trash view update disable tests",

        setUp: function () {
            var Action = Y.Base.create('disableTestaction', Y.View, [], {
                },{
                    ATTRS: {
                        disabled: {
                            value: "couscous",
                        },
                    }
                }),
                action = new Action(),

                BarView = Y.Base.create('disableTestBarView', Y.View, [], {
                    getAction: function (actionId) {
                        return action;
                    },
                });

            this.trashItems = [
                this._createItem("/id/1"),
                this._createItem("/id/2"),
            ];

            this.action = action;

            this.barView = new BarView();

            this.view = new Y.eZ.TrashView({
                container: ".container",
                trashItems: this.trashItems,
                trashBar: this.barView,
            });
        },

        _createItem: function (id) {
            return {
                item: {
                    toJSON: function () {
                        return {id: id};
                    }
                },
                parentLocation: { toJSON: function () {} },
                contentType: { toJSON: function () {} }
            };
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testDisable: function (isChecked, isDisabled) {
            this.view.render();

            this.item2 = this.view.get('container').one(".ez-trashitem-box[value='/id/2']");

            if(isChecked) {
                this.item2.setAttribute('checked', 'checked');
            } else {
                this.item2.removeAttribute('checked');
            }

            this.item2.simulate('change');

            Assert.areSame(
                isDisabled,
                this.action.get('disabled'),
                "Disabled should be modified accordingly if an item is checked"
            );

        },

        "Should enable the restore button when an item is checked": function () {
            this._testDisable(true, false);
        },

        "Unchecking an item disables the restore button": function () {
            this._testDisable(false, true);
        },
    });

    restoreTest = new Y.Test.Case({
        name: "eZ Trash view restore tests",

        setUp: function () {

            this.trashItems = [
                this._createItem("/id/1"),
                this._createItem("/id/2"),
                this._createItem("/id/3"),
            ];

            this.view = new Y.eZ.TrashView({
                trashBar: new Y.View(),
                trashItems: this.trashItems,
            });
        },

        _createItem: function (id) {
            return {
                item: {
                    toJSON: function () {
                        return {id: id};
                    },
                    get: function(value) {
                        return id;
                    }
                },
                parentLocation: { toJSON: function () {} },
                contentType: { toJSON: function () {} }
            };
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire `restoreItems` with selected items": function () {
            this.view.on('*:restoreItems', Y.bind(function (e) {
                Assert.areSame(
                    2,
                    e.trashItems.length,
                    "2 Items should be selected"
                );

                Assert.areSame(
                    this.item1.get('value'),
                    e.trashItems[0].get('id'),
                    "Item 1 should be the same"
                );

                Assert.areSame(
                    this.item3.get('value'),
                    e.trashItems[1].get('id'),
                    "Item 3 should be the same"
                );
            }, this));

            this.view.render();

            this.item1 = this.view.get('container').one(".ez-trashitem-box[value='/id/1']");
            this.item1.setAttribute('checked', 'checked');
            this.item3 = this.view.get('container').one(".ez-trashitem-box[value='/id/3']");
            this.item3.setAttribute('checked', 'checked');

            this.view.fire('whatever:restoreTrashItemsAction');
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
    Y.Test.Runner.add(minimizeTest);
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(restoreTest);
    Y.Test.Runner.add(updateDisableTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-trashview', 'ez-trashbarview']});
