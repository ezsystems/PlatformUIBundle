/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekview-tests', function (Y) {
    var renderTest, closeContentPeekTest, forwardAttributeToRawContentView,
        Assert = Y.Assert, Mock = Y.Mock,
        _getModelMock = function (toJSON) {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
                returns: toJSON,
            });
            return mock;
        };

    renderTest = new Y.Test.Case({
        name: "eZ Content Peek View render test",

        setUp: function () {
            var RawContentView;

            RawContentView = Y.Base.create('rawContentView', Y.View, [], {
                render: function () {
                    renderTest.rawContentViewRendered = true;
                    return this;
                },
            });
            this.rawContentView = new RawContentView();
            this.contentJSON = {};
            this.contentTypeJSON = {};
            this.view = new Y.eZ.ContentPeekView({
                content: _getModelMock(this.contentJSON),
                contentType: _getModelMock(this.contentTypeJSON),
                rawContentView: this.rawContentView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.rawContentView.destroy();
            delete this.view;
            delete this.rawContentView;
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template;

            this.view.template = Y.bind(function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");

                Assert.areSame(
                    this.contentJSON, variables.content,
                    "The content should be available in the template"
                );
                Assert.areSame(
                    this.contentTypeJSON, variables.contentType,
                    "The contentType should be available in the template"
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should render the RawContentView in its container": function () {
            this.view.render();

            Assert.isTrue(
                this.rawContentViewRendered,
                "The raw content view should have been rendered"
            );
            Assert.isTrue(
                this.view.get('container').one('.ez-rawcontentview-container').contains(
                    this.rawContentView.get('container')
                ),
                "The raw content view container should have been added"
            );
        },
    });

    closeContentPeekTest = new Y.Test.Case({
        name: "eZ Content Peek View close content peek test",

        setUp: function () {
            this.contentJSON = {};
            this.contentTypeJSON = {};
            this.view = new Y.eZ.ContentPeekView({
                container: '.container',
                content: _getModelMock(this.contentJSON),
                contentType: _getModelMock(this.contentTypeJSON),
                rawContentView: new Y.View(),
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the `contentPeekClose` event": function () {
            var container = this.view.get('container'),
                close = container.one('a');

            container.once('tap', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });
            this.view.on('contentPeekClose', this.next(function () {}));
            close.simulateGesture('tap');
            this.wait();
        },
    });

    forwardAttributeToRawContentView = new Y.Test.Case({
        name: "eZ Content Peek View forward attribute test",

        setUp: function () {
            this.view = new Y.eZ.ContentPeekView({
                rawContentView: new Y.View(),
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testForwardAttribute: function (attrName, value) {
            this.view.set(attrName, value);

            Assert.areSame(
                value, this.view.get('rawContentView').get(attrName),
                "The attribute " + attrName + " should be set on the raw content view"
            );
        },

        "Should forward the content attribute value": function () {
            this._testForwardAttribute('content', {});
        },

        "Should forward the contentType attribute value": function () {
            this._testForwardAttribute('contentType', {});
        },

        "Should forward the location attribute value": function () {
            this._testForwardAttribute('location', {});
        },

        "Should forward the languageCode attribute value": function () {
            this._testForwardAttribute('languageCode', 'fre-FR');
        },
    });

    Y.Test.Runner.setName("eZ Content Peek View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(closeContentPeekTest);
    Y.Test.Runner.add(forwardAttributeToRawContentView);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contentpeekview']});
