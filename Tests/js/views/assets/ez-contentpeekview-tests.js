/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentpeekview-tests', function (Y) {
    var renderTest, closeContentPeekTest, resetTest, rawContentViewTest,
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
            Y.eZ.RawContentView = Y.Base.create('rawContentView', Y.View, [], {
                render: function () {
                    renderTest.rawContentViewRendered = true;
                    return this;
                },
            });
            this.rawContentView = new Y.eZ.RawContentView();
            this.contentJSON = {};
            this.contentTypeJSON = {};
            this.view = new Y.eZ.ContentPeekView({
                content: _getModelMock(this.contentJSON),
                contentType: _getModelMock(this.contentTypeJSON),
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.rawContentView.destroy();
            delete this.view;
            delete this.rawContentView;
            delete Y.eZ.RawContentView;
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
                    this.view.get('rawContentView').get('container')
                ),
                "The raw content view container should have been added"
            );
        },
    });

    closeContentPeekTest = new Y.Test.Case({
        name: "eZ Content Peek View close content peek test",

        setUp: function () {
            Y.eZ.RawContentView = Y.View;
            this.contentJSON = {};
            this.contentTypeJSON = {};
            this.view = new Y.eZ.ContentPeekView({
                container: '.container',
                content: _getModelMock(this.contentJSON),
                contentType: _getModelMock(this.contentTypeJSON),
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.RawContentView;
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

    resetTest = new Y.Test.Case({
        name: "eZ Content Peek View reset test",

        setUp: function () {
            var RawContentView = Y.Base.create('rawContentView', Y.View, [], {
                    destructor: Y.bind(function () {
                        this.destroyed = true;
                    }, this),
                });
            this.rawContentView = new RawContentView();
            this.view = new Y.eZ.ContentPeekView({
                content: {},
                location: {},
                contentType: {},
                languageCode: 'fre-FR',
            });
            this.view._set('rawContentView', new RawContentView());
        },

        tearDown: function () {
            this.view.destroy();
            delete this.destroyed;
            delete this.view;
        },

        "Should destroy the raw content view": function () {
            this.view.reset();

            Assert.isTrue(
                this.destroyed,
                "The raw content view should have been destroyed"
            );
            Assert.isNull(
                this.view.get('rawContentView'),
                "The rawContentView attribute should have been set to null"
            );
        },

        "Should be called on getting inactive": function () {
            this.view.set('active', true);
            this.view.set('active', false);

            Assert.isTrue(
                this.destroyed,
                "The raw content view should have been destroyed"
            );
            Assert.isNull(
                this.view.get('rawContentView'),
                "The rawContentView attribute should have been set to null"
            );
        },
    });

    rawContentViewTest = new Y.Test.Case({
        name: "eZ Content Peek View rawContentView parameter test",

        setUp: function () {
            Y.eZ.RawContentView = Y.View;
            this.view = new Y.eZ.ContentPeekView({
                content: _getModelMock(),
                location: {},
                contentType: _getModelMock(),
                languageCode: 'fre-FR',
                config: {},
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.RawContentView;
        },

        "Should receive the parameters": function () {
            var assertAttribute = Y.bind(function (attr) {
                    Assert.areSame(
                        this.view.get(attr),
                        this.view.get('rawContentView').get(attr),
                        "The rawContentView attribute " + attr + " should have been set"
                    );
                }, this);

            assertAttribute('content');
            assertAttribute('contentType');
            assertAttribute('config');
            assertAttribute('languageCode');
            Assert.areEqual(
                'event', this.view.get('rawContentView').get('languageSwitchMode'),
                "The languageSwitchMode attribute should be set to event"
            );
        },

        "Should set the peek view as a bubble target": function () {
            var bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            this.view.get('rawContentView').fire('whatever');

            Assert.isTrue(
                bubble,
                "The event should have bubbled to the peek view"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Peek View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(closeContentPeekTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(rawContentViewTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contentpeekview']});
