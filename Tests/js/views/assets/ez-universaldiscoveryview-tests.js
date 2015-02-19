/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryview-tests', function (Y) {
    var renderTest, domEventTest, eventHandlersTest, eventsTest,
        tabTest, defaultMethodsTest, selectContentTest, confirmButtonStateTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            this.title = 'Universal discovery view title';
            this.selectionMode = 'multiple';
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                selectionMode: this.selectionMode,
                methods: [this.method1, this.method2],
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.method1.destroy();
            this.method2.destroy();
            delete this.view;
            delete this.method1;
            delete this.method2;
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
                Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                Assert.areSame(
                    that.title, variables.title,
                    "The title should be available in the template"
                );
                Assert.areSame(
                    that.selectionMode, variables.selectionMode,
                    "The selectionMode should available in the template"
                );
                Assert.isArray(
                    variables.methods, "The method list should be available in the template"
                );
                Assert.areEqual(
                    2, variables.methods.length,
                    "The 2 method should available"
                );
                Y.Array.each(this.get('methods'), function (method, i) {
                    var localMethod = variables.methods[i];

                    Assert.areEqual(
                        localMethod.title, method.get('title'),
                        "The method title should be available"
                    );
                    Assert.areEqual(
                        localMethod.identifier, method.getHTMLIdentifier(),
                        "The method html identifier should be available"
                    );
                    Assert.areSame(
                        localMethod.visible, method.get('visible'),
                        "The method visible flag should be available"
                    );
                });
                
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
                methods: [],
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
                selection = {},
                that = this,
                contentDiscoveredFired = false;

            this.view._set('selection', selection);
            this.view.on('contentDiscovered', function (e) {
                Assert.areSame(
                    selection, e.selection,
                    "The selection should be available in the contentDiscovered event facade"
                );
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
                methods: [],
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
            this.methodIdentifier = 'default';
            this.method = new Y.eZ.UniversalDiscoveryMethodBaseView({
                identifier: this.methodIdentifier,
            });
            this.view = new Y.eZ.UniversalDiscoveryView({
                visibleMethod: this.methodIdentifier,
                container: '.container',
                methods: [this.method],
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            this.method.destroy();
            delete this.view;
            delete this.method;
            delete this.handler1;
            delete this.handler2;
        },

        _testReset: function (evt) {
            var customTitle = "A custom title";

            this.view.set('title', "A custom title");
            this.view._set('selection', {});
            this.method.set('visible', true);
            this.method.set('selectionMode', 'multiple');
            this.view.fire(evt);
            Assert.areNotEqual(
                customTitle,
                this.view.get('title'),
                "The title should resetted to its default value"
            );
            Assert.isNull(
                this.view.get('selection'),
                "The selection should resetted to null"
            );
            Assert.isFalse(
                this.method.get('visible'),
                "The method should have the visible flag to false"
            );
            Assert.areEqual(
                'single', this.method.get('selectionMode'),
                "The method selectionMode should be resetted to 'single'"
            );
        },

        _testNotReset: function (evt) {
            var customTitle = "A custom title";

            this.view.set('title', "A custom title");
            this.method.set('visible', true);
            this.method.set('selectionMode', 'multiple');
            this.view.on(evt, function (e) {
                e.preventDefault();
            });
            this.view.fire(evt);
            Assert.areEqual(
                customTitle,
                this.view.get('title'),
                "The title should be kept"
            );
            Assert.isTrue(
                this.method.get('visible'),
                "The method visible flag should still be true"
            );
            Assert.areEqual(
                'multiple', this.method.get('selectionMode'),
                "The method selectionMode should still be 'multiple'"
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

    renderTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            this.title = 'Universal discovery view title';
            this.selectionMode = 'multiple';
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView({
                identifier: 'method1',
            });
            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView({
                identifier: 'method2',
            });
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                visibleMethod: 'method2',
                selectionMode: this.selectionMode,
                methods: [this.method1, this.method2],
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.method1.destroy();
            this.method2.destroy();
            delete this.view;
            delete this.method1;
            delete this.method2;
        },

        "Should initialize function visibility of the method views": function () {
            this.view.render();
            this.view.set('active', true);
            Assert.isTrue(
                this.method2.get('visible'),
                "The method2 should be visible"
            );
            Assert.isFalse(
                this.method1.get('visible'),
                "The method1 should not be visible"
            );
        },

        "Should change the visible flag depending on visibleMethod": function () {
            this.view.set('visibleMethod', 'method1');
            Assert.isTrue(
                this.method1.get('visible'),
                "The method1 should be visible"
            );
            Assert.isFalse(
                this.method2.get('visible'),
                "The method2 should not be visible"
            );
        },
    });

    tabTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method1._set("title", "Method 1");
            this.method1._set("identifier", "method1");

            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method2._set("title", "Method 2");
            this.method2._set("identifier", "method2");

            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [this.method1, this.method2],
                visibleMethod: "method1",
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.method1.destroy();
            this.method2.destroy();
            delete this.view;
            delete this.method1;
            delete this.method2;
        },

        "Should initialize the tabs when getting active": function () {
            var container = this.view.get('container'),
                method1 = this.method1;

            this.view.set('active', true);

            Assert.isTrue(
                method1.get('visible'),
                "The method1 visible flag should be true"
            );
            Assert.isFalse(
                this.method2.get('visible'),
                "The method2 visible flag should be false"
            );

            Assert.isTrue(
                container.one('#' + method1.getHTMLIdentifier()).hasClass('is-tab-selected'),
                "The method1 tab panel should be selected"
            );
            Assert.isTrue(
                container.one('[href="#' + method1.getHTMLIdentifier() + '"]').ancestor('.ez-tabs-label').hasClass('is-tab-selected'),
                "The method1 tab label should be selected"
            );
        },

        "Should update the method visible flag when changing the visibleMethod": function () {
            var method2 = this.method2;

            this.view.set('active', true);
            this.view.set('visibleMethod', 'method2');

            Assert.isTrue(
                method2.get('visible'),
                "The method2 should be visible"
            );
            Assert.isFalse(
                this.method1.get('visible'),
                "The method2 should not be visible"
            );
        },

        "Should change the visibleMethod when tapping a tab": function () {
            var container = this.view.get('container'),
                method2 = this.method2,
                that = this;

            this.view.set('active', true);

            container.one('[href="#' + method2.getHTMLIdentifier() + '"]').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.areEqual(
                        method2.get('identifier'), this.view.get('visibleMethod'),
                        "The method2 should be visible"
                    );
                    Assert.isTrue(
                        method2.get('visible'),
                        "The method2 visible flag should be true"
                    );
                    Assert.isFalse(
                        this.method1.get('visible'),
                        "The method1 visible flag should be false"
                    );
                });
            });
            this.wait();
        },
    });

    defaultMethodsTest = new Y.Test.Case({
        name: "eZ Universal Discovery View default methods value test",

        setUp: function () {
            this.config = {};
            this.selectionMode = 'multiple';

            Y.eZ.UniversalDiscoveryBrowseView = Y.Base.create(
                'testView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {}
            );
            this.view = new Y.eZ.UniversalDiscoveryView({
                selectionMode: this.selectionMode,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryBrowseView;
        },

        "Should instantiate the browse method": function () {
            var methods = this.view.get('methods');

            Assert.isArray(
                methods,
                "The method list should be an array"
            );
            Assert.areEqual(
                1, methods.length,
                "The default method list should contain 1 element"
            );
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoveryBrowseView, methods[0],
                "The first element should be an instance of the browse method"
            );
            Assert.areEqual(
                this.selectionMode, methods[0].get('selectionMode'),
                "The selection mode should be passed to the method views"
            );
        },

        "Should add the universal discovery view as a bubble target": function () {
            var methods = this.view.get('methods'),
                bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            methods[0].fire('whatever');

            Assert.isTrue(
                bubble,
                "The method's event should bubble to the universal discovery view"
            );
        },
    });

    selectContentTest = new Y.Test.Case({
        name: "eZ Universal Discovery View select content event test",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should store the selection": function () {
            var selection = {};

            this.view.fire('selectContent', {selection: selection});

            Assert.areSame(
                selection, this.view.get('selection'),
                "The selection from the selectContent event facade should be stored"
            );
        },
    });

    confirmButtonStateTest = new Y.Test.Case({
        name: "eZ Universal Discovery View confirm button state test",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should enable the confirm button": function () {
            this.view._set('selection', {});

            Assert.isFalse(
                this.view.get('container').one('.ez-universaldiscovery-confirm').get('disabled'),
                "The confirm button should be enabled"
            );
        },

        "Should disabled the confirm button": function () {
            this["Should enable the confirm button"]();
            this.view._set('selection', null);

            Assert.isTrue(
                this.view.get('container').one('.ez-universaldiscovery-confirm').get('disabled'),
                "The confirm button should be disabled"
            );
        }
    });


    Y.Test.Runner.setName("eZ Universal Discovery View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(eventHandlersTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(tabTest);
    Y.Test.Runner.add(defaultMethodsTest);
    Y.Test.Runner.add(selectContentTest);
    Y.Test.Runner.add(confirmButtonStateTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryview']});
