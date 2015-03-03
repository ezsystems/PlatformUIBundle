/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryconfirmedlistview-tests', function (Y) {
    var renderTest, confirmedListChangeTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List render tests',

        setUp: function () {
            this.structs = [];
            this.structsJson = [];
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
        },

        "Should use the template": function () {
            var templateCalled = false,
                origTpl = this.view.template;
            
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };

            this.view.render();
            Assert.isTrue(templateCalled, "render should use the template");
        },

        "Test render no list": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Assert.isFalse(
                    variables.hasConfirmedList,
                    "The hasConfirmedList variable value should be false"
                );
                Assert.isFalse(
                    variables.miniDisplayList,
                    "The hasConfirmedList variable value should be false"
                );
                Assert.areEqual(
                    0, variables.remainingCount,
                    "The remainingCount variable value should be zero"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        _getStructMocks: function () {
            var content = new Mock(),
                location = new Mock(),
                contentType = new Mock(),
                contentJson = {},
                locationJson = {},
                contentTypeJson = {},
                struct, structJson;

            Mock.expect(content, {
                method: 'toJSON',
                returns: contentJson,
            });
            Mock.expect(location, {
                method: 'toJSON',
                returns: locationJson,
            });
            Mock.expect(contentType, {
                method: 'toJSON',
                returns: contentTypeJson,
            });

            struct = {
                content: content,
                location: location,
                contentType: contentType,
            };
            structJson = {
                content: contentJson,
                location: locationJson,
                contentType: contentTypeJson,
            };
            this.structs.push(struct);
            this.structsJson.push(structJson);
            return struct;
        },

        _getContentList: function (size) {
            var list = [], i;

            for (i = 0; i != size; i++) {
                list.push(this._getStructMocks());
            }
            return list;
        },

        _testWithList: function (size, expectedContentCount, expectedRemainingCount) {
            var that = this,
                origTpl = this.view.template;

            this.view.set('confirmedList', this._getContentList(size));
            this.view.template = function (variables) {
                Assert.isTrue(
                    variables.hasConfirmedList,
                    "The hasConfirmedList variable value should be true"
                );
                Assert.areEqual(
                    expectedRemainingCount, variables.remainingCount,
                    "The remainingCount variable value should be zero"
                );
                Assert.isArray(
                    variables.miniDisplayList,
                    "The miniDisplayList variable value should be an array"
                );
                Assert.areEqual(
                    expectedContentCount, variables.miniDisplayList.length,
                    "The miniDisplayList variable value should have one entry"
                );
                Y.Array.each(variables.miniDisplayList, function (struct, i) {
                    Assert.areSame(
                        struct.content, that.structsJson[size - i - 1].content,
                        "The content toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.location, that.structsJson[size - i - 1].location,
                        "The location toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.contentType, that.structsJson[size - i - 1].contentType,
                        "The contentType toJSON result should be provided"
                    );
                });
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Test render below length limit list": function () {
            this._testWithList(2, 2, 0);
        },

        "Test render above length limit list": function () {
            this._testWithList(5, 3, 2);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.mocks;
            delete this.view;
        },
    });

    confirmedListChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List confirm list change tests',

        setUp: function () {
            this.structs = [];
            this.structsJson = [];
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getModelMock: function () {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
            });
            return mock;
        },

        "Should render the view": function () {
            var rendered = false,
                origTpl = this.view.template;
            
            this.view.template = function () {
                rendered = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('confirmedList', [{
                content: this._getModelMock(),
                location: this._getModelMock(),
                contentType: this._getModelMock(),
            }]);

            Assert.isTrue(rendered, "render should use the template");
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Confirmed List View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(confirmedListChangeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryconfirmedlistview']});
