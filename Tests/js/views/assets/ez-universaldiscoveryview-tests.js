/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryview-tests', function (Y) {
    var renderTest, domEventTest, eventHandlersTest, eventsTest, visibleMethodTest,
        tabTest, defaultMethodsTest, selectContentTest, confirmButtonStateTest,
        updateTitleTest, confirmSelectedContentTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            this.title = 'Universal discovery view title';
            this.multiple = true;
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                multiple: this.multiple,
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
                    that.multiple, variables.multiple,
                    "The multiple flag should available in the template"
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
            this.method = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method._set('identifier', this.methodIdentifier);
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
            this.method.set('multiple', true);
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
            Assert.isFalse(
                this.method.get('multiple'),
                "The method multiple flag should be resetted to false"
            );
        },

        _testNotReset: function (evt) {
            var customTitle = "A custom title";

            this.view.set('title', "A custom title");
            this.method.set('visible', true);
            this.method.set('multiple', true);
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
            Assert.isTrue(
                this.method.get('multiple'),
                "The method multiple flag should still be true"
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

    visibleMethodTest = new Y.Test.Case({
        name: "eZ Universal Discovery View visible method test",

        setUp: function () {
            this.title = 'Universal discovery view title';
            this.multiple = true;
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method1._set('identifier', 'method1');
            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method2._set('identifier', 'method2');
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                visibleMethod: 'method2',
                multiple: this.multiple,
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

        "Should initialize the visibility flag of the method views": function () {
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
                multiple: true,
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

        "Should update the method when changing the visibleMethod": function () {
            var method2 = this.method2,
                method1 = this.method1;

            this.view.set('active', true);
            this.view.set('visibleMethod', 'method2');

            Assert.isTrue(
                method2.get('visible'),
                "The method2 should be visible"
            );
            Assert.isFalse(
                method1.get('visible'),
                "The method2 should not be visible"
            );
            Assert.isTrue(
                method2.get('multiple'),
                "The method2 mutiple flag should be true"
            );
            Assert.isTrue(
                method1.get('multiple'),
                "The method1 mutiple flag should be true"
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
            this.multiple = true;

            Y.eZ.UniversalDiscoveryBrowseView = Y.Base.create(
                'testView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {}
            );
            this.view = new Y.eZ.UniversalDiscoveryView({
                multiple: this.multiple,
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
            Assert.areSame(
                this.multiple, methods[0].get('multiple'),
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

        "Should reset the selection": function () {
            this.view.fire('selectContent', {selection: null});

            Assert.isNull(
                this.view.get('selection'),
                "The selection should have been resetted"
            );
        },

        "Should ignore the event when multiple is true": function () {
            this.view.set('multiple', true);

            this.view.fire('selectContent', {selection: {}});
            Assert.isNull(
                this.view.get('selection'),
                "The selection should remain empty"
            );
        },
    });

    confirmSelectedContentTest = new Y.Test.Case({
        name: "eZ Universal Discovery View confirm selected content event test",

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryView({
                multiple: true,
                methods: [],
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should add the content to the selection": function () {
            var content = {};

            this.view.fire('confirmSelectedContent', {selection: content});

            Assert.isArray(
                this.view.get('selection'),
                "The selection should an array"
            );
            Assert.areEqual(
                1, this.view.get('selection').length,
                "The selection should contain one entry"
            );
            Assert.areSame(
                content, this.view.get('selection')[0],
                "The selection should contain the content provided in the confirmSelectedContent event"
            );
        },

        "Should add the contents to the selection": function () {
            var content1 = {}, content2 = {};

            this.view.fire('confirmSelectedContent', {selection: content1});
            this.view.fire('confirmSelectedContent', {selection: content2});

            Assert.isArray(
                this.view.get('selection'),
                "The selection should an array"
            );
            Assert.areEqual(
                2, this.view.get('selection').length,
                "The selection should contain one entry"
            );
            Assert.areSame(
                content1, this.view.get('selection')[0],
                "The selection should contain the content provided in the first confirmSelectedContent event"
            );
            Assert.areSame(
                content2, this.view.get('selection')[1],
                "The selection should contain the content provided in the second confirmSelectedContent event"
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

    updateTitleTest= new Y.Test.Case({
        name: "eZ Universal Discovery View update title test",

        setUp: function () {
            this.method = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method._set('identifier', 'browse');
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: "Easier to run",
                methods: [this.method],
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.method.destroy();
            delete this.view;
            delete this.method;
        },

        "Should update the title when the view is getting active": function () {
            var newTitle = 'Breaking the habits';

            this.view.set('title', newTitle);
            this.view.set('active', true);

            Assert.areEqual(
                newTitle,
                this.view.get('container').one('.ez-universaldiscovery-title').getContent(),
                "The title should have been updated"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(eventHandlersTest);
    Y.Test.Runner.add(eventsTest);
    Y.Test.Runner.add(visibleMethodTest);
    Y.Test.Runner.add(tabTest);
    Y.Test.Runner.add(defaultMethodsTest);
    Y.Test.Runner.add(selectContentTest);
    Y.Test.Runner.add(confirmSelectedContentTest);
    Y.Test.Runner.add(confirmButtonStateTest);
    Y.Test.Runner.add(updateTitleTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryview']});
