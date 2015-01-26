/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryview-tests', function (Y) {
    var renderTest, domEventTest, eventHandlersTest, eventsTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            this.title = 'Universal discovery view title';
            this.selectionMode = 'multiple';
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                selectionMode: this.selectionMode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the this.view");
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");
                Assert.areSame(
                    that.title, variables.title,
                    "The title should be available in the template"
                );
                Assert.areSame(
                    that.selectionMode, variables.selectionMode,
                    "The selectionMode should available in the template"
                );
                
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    domEventTest = new Y.Test.Case({
        name: "eZ Universal Discovery View dom event tests",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the cancelDiscover event": function () {
            var cancel = this.view.get('container').one('.ez-universaldiscovery-cancel'),
                that = this,
                cancelDiscoverFired = false;

            this.view.on('cancelDiscover', function (e) {
                cancelDiscoverFired = true;
            });
            cancel.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        cancelDiscoverFired,
                        "The cancelDiscover event should have been fired"
                    );
                });
            });
            this.wait();
        },

        "Should fire the contentDiscovered event": function () {
            var conf = this.view.get('container').one('.ez-universaldiscovery-confirm'),
                that = this,
                contentDiscoveredFired = false;

            this.view.on('contentDiscovered', function (e) {
                contentDiscoveredFired = true;
            });
            conf.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        contentDiscoveredFired,
                        "The contentDiscovered event should have been fired"
                    );
                });
            });
            this.wait();
        },
    });

    eventHandlersTest = new Y.Test.Case({
        name: "eZ Universal Discovery View event handlers tests",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.handler1;
            delete this.handler2;
        },

        _eventHandler1: function () {
            this.handler1 = true;
        },

        _eventHandler2: function () {
            this.handler2 = true;
        },

        "Should set the contentDiscovered event handler": function () {
            this.view.set('contentDiscoveredHandler', Y.bind(this._eventHandler1, this));
            this.view.fire('contentDiscovered');

            Assert.isTrue(
                this.handler1,
                "The contentDiscoveredHandler should have been called"
            );
        },

        "Should set the cancelDiscover event handler": function () {
            this.view.set('cancelDiscoverHandler', Y.bind(this._eventHandler1, this));
            this.view.fire('cancelDiscover');

            Assert.isTrue(
                this.handler1,
                "The cancelDiscoverHandler should have been called"
            );
        },

        "Should update the contentDiscovered event handler": function () {
            this.view.set('contentDiscoveredHandler', Y.bind(this._eventHandler1, this));
            this.view.set('contentDiscoveredHandler', Y.bind(this._eventHandler2, this));
            this.view.fire('contentDiscovered');

            Assert.isFalse(
                this.handler1,
                "The first contentDiscoveredHandler should not have been called"
            );
            Assert.isTrue(
                this.handler2,
                "The second contentDiscoveredHandler should have been called"
            );
        },

        "Should update the cancelDiscover event handler": function () {
            this.view.set('cancelDiscoverHandler', Y.bind(this._eventHandler1, this));
            this.view.set('cancelDiscoverHandler', Y.bind(this._eventHandler2, this));
            this.view.fire('cancelDiscover');

            Assert.isFalse(
                this.handler1,
                "The first cancelDiscoverHandler should not have been called"
            );
            Assert.isTrue(
                this.handler2,
                "The second cancelDiscoverHandler should have been called"
            );
        },
    });

    eventsTest = new Y.Test.Case({
        name: "eZ Universal Discovery View events tests",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.handler1;
            delete this.handler2;
        },

        _testReset: function (evt) {
            var customTitle = "A custom title";

            this.view.set('title', "A custom title");
            this.view.fire(evt);
            Assert.areNotEqual(
                customTitle,
                this.view.get('title'),
                "The title should resetted to its default value"
            );
        },

        _testNotReset: function (evt) {
            var customTitle = "A custom title";

            this.view.set('title', "A custom title");
            this.view.on(evt, function (e) {
                e.halt();
            });
            this.view.fire(evt);
            Assert.areEqual(
                customTitle,
                this.view.get('title'),
                "The title should be kept"
            );
        },

        "Should reset the view attributes (contentDiscovered)": function () {
            this._testReset('contentDiscovered');
        },

        "Should reset the view attributes (cancelDiscover)": function () {
            this._testReset('cancelDiscover');
        },

        "Should not reset the view attributes (contentDiscovered)": function () {
            this._testNotReset('contentDiscovered');
        },

        "Should not reset the view attributes (cancelDiscover)": function () {
            this._testNotReset('cancelDiscover');
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(eventHandlersTest);
    Y.Test.Runner.add(eventsTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryview']});
