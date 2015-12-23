/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashview-tests', function (Y) {
    var test,
        Mock = Y.Mock, Assert = Y.Assert;

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

            this.view = new Y.eZ.TrashView({
                trashItems: this.trashItems
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render the view": function () {
            var templateCalled = false,
                origTpl;

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

            Assert.areNotEqual(
                "", this.view.get('container').getHTML(),
                "View container should contain the result of the view"
            );

            Mock.verify(this.itemMock);
            Mock.verify(this.parentLocationMock);
            Mock.verify(this.contentTypeMock);
        },
    });

    Y.Test.Runner.setName("eZ Trash view tests");
    Y.Test.Runner.add(test);
}, '', {requires: ['test', 'node-event-simulate', 'ez-trashview']});
