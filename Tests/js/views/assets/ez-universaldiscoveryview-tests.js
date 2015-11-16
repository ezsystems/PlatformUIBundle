/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryview-tests', function (Y) {
    var renderTest, domEventTest, eventHandlersTest, eventsTest, visibleMethodTest,
        tabTest, defaultMethodsTest, selectContentTest, confirmButtonStateTest,
        updateTitleTest, confirmSelectedContentTest, resetTest, selectionUpdateConfirmViewTest,
        defaultConfirmedListTest, multipleClassTest, animatedSelectionTest, unselectContentTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: "eZ Universal Discovery View render test",

        setUp: function () {
            var that = this,
                ConfirmedList;

            this.confirmedListRendered = false;
            ConfirmedList = Y.Base.create('confirmedList', Y.View, [], {
                render: function () {
                    that.confirmedListRendered = true;
                    return this;
                }
            });

            this.title = 'Universal discovery view title';
            this.multiple = true;
            this.method1 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.method2 = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.confirmedList = new ConfirmedList();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                multiple: this.multiple,
                methods: [this.method1, this.method2],
                confirmedListView: this.confirmedList,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.method1.destroy();
            this.method2.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.method1;
            delete this.method2;
            delete this.confirmedList;
        },

        "Should render the confirmed list": function () {
            var container = this.view.get('container');

            this.view.render();

            Assert.isTrue(
                this.confirmedListRendered,
                "The confirmed list should have been rendered"
            );
            Assert.isTrue(
                container.one('.ez-universaldiscovery-confirmed-list-container').contains(
                    this.confirmedList.get('container')
                ),
                "The confirmed list should have been added to confirmed list container"
            );
        },

        "Should add the multiple selection mode class": function () {
            this.view.render();
            Assert.isTrue(
                this.view.get('container').hasClass('is-multiple-selection-mode'),
                "The container should add the multiple selection mode class"
            );
        },

        "Should not add the multiple selection mode class": function () {
            this.view.set('multiple', false);
            this.view.render();
            Assert.isFalse(
                this.view.get('container').hasClass('is-multiple-selection-mode'),
                "The container should not add the multiple selection mode class"
            );
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                visibleMethod: this.methodIdentifier,
                container: '.container',
                methods: [this.method],
                confirmedListView: this.confirmedList,
            });
            this.handler1 = false;
            this.handler2 = false;
        },

        tearDown: function () {
            this.view.destroy();
            this.method.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.method;
            delete this.confirmedList;
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: this.title,
                visibleMethod: 'method2',
                multiple: this.multiple,
                methods: [this.method1, this.method2],
                confirmedListView: this.confirmedList,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.method1.destroy();
            this.method2.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.method1;
            delete this.method2;
            delete this.confirmedList;
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

        "Should initialize the isSelected function of the method views": function () {
            var isSelectableResult = false,
                isSelectable = function (contentStruct) {return isSelectableResult;},
                contentStruct = {},
                isSelectableInMethod1, isSelectableInMethod2;

            this.view.set('isSelectable', isSelectable);
            this.view.render();
            this.view.set('active', true);

            isSelectableInMethod1 = this.method1.get('isSelectable');
            isSelectableInMethod2 = this.method2.get('isSelectable');

            Assert.areSame(
                isSelectableInMethod1(contentStruct),
                isSelectable(contentStruct),
                "The method1 should contain current isSelectable function"
            );
            Assert.areSame(
                isSelectableInMethod2(contentStruct),
                isSelectable(contentStruct),
                "The method2 should contain current isSelectable function"
            );
        },

        "Should change the isSelected function of method views": function () {
            var isSelectableResult1 = false,
                isSelectableResult2 = true,
                isSelectable1 = function (contentStruct) {return isSelectableResult1;},
                isSelectable2 = function (contentStruct) {return isSelectableResult2;},
                contentStruct = {},
                isSelectableInMethod1, isSelectableInMethod2;

            this.view.set('isSelectable', isSelectable1);
            this.view.set('isSelectable', isSelectable2);

            isSelectableInMethod1 = this.method1.get('isSelectable');
            isSelectableInMethod2 = this.method2.get('isSelectable');

            Assert.areSame(
                isSelectableInMethod1(contentStruct),
                isSelectable2(contentStruct),
                "The method1 should contain updated isSelectable function"
            );
            Assert.areSame(
                isSelectableInMethod2(contentStruct),
                isSelectable2(contentStruct),
                "The method2 should contain updated isSelectable function"
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

            this.confirmedList = new Y.View();

            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [this.method1, this.method2],
                visibleMethod: "method1",
                multiple: true,
                confirmedListView: this.confirmedList,
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
            this.confirmedList = new Y.View();
            this.config = {};
            this.multiple = true;

            Y.eZ.UniversalDiscoveryBrowseView = Y.Base.create(
                'testBrowseView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {}
            );
            Y.eZ.UniversalDiscoverySearchView = Y.Base.create(
                'testSearchView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {}
            );
            this.view = new Y.eZ.UniversalDiscoveryView({
                multiple: this.multiple,
                confirmedListView: this.confirmedList,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
            delete Y.eZ.UniversalDiscoveryBrowseView;
        },

        "Should instantiate the browse method": function () {
            var methods = this.view.get('methods');

            Assert.isArray(
                methods,
                "The method list should be an array"
            );
            Assert.areEqual(
                2, methods.length,
                "The default method list should contain 2 elements"
            );
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoveryBrowseView, methods[0],
                "The first element should be an instance of the browse method"
            );
            Assert.areSame(
                this.multiple, methods[0].get('multiple'),
                "The selection mode should be passed to the method views"
            );
            Assert.isFunction(
                methods[0].get('isAlreadySelected'),
                "The isAlreadySelected function should be passed to the method views"
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
                confirmedListView: this.confirmedList,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
        },

        "Should store the selection": function () {
            var selection = {};

            this.view.fire('selectContent', {selection: selection});

            Assert.areSame(
                selection, this.view.get('selection'),
                "The selection from the selectContent event facade should be stored"
            );
        },

        "Should reset the selection if selection is null": function () {
            this.view.fire('selectContent', {selection: null});

            Assert.isNull(
                this.view.get('selection'),
                "The selection should have been resetted"
            );
        },

        "Should reset the selection if selection is not selectable": function () {
            var selection = {};
            this.view.set('isSelectable', function (contentStruct) {return false;});

            this.view.fire('selectContent', {selection: selection});

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
            var SelectedView = Y.Base.create('selectedView', Y.View, [], {
                    startAnimation: function () {
                        return false;
                    },
                });
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                multiple: true,
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.selectedView = new SelectedView({
                bubbleTargets: this.view,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            this.selectedView.destroy();
            delete this.view;
            delete this.confirmedList;
            delete this.selectedView;
        },

        _getMockStruct: function (contentId) {
            var contentInfo = new Mock();

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: contentId,
            });

            return {
                contentInfo: contentInfo,
            };
        },

        "Should add the content to the selection": function () {
            var content = this._getMockStruct(1);

            this.selectedView.fire('confirmSelectedContent', {selection: content});

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
            var content1 = this._getMockStruct(1),
                content2 = this._getMockStruct(2);

            this.selectedView.fire('confirmSelectedContent', {selection: content1});
            this.selectedView.fire('confirmSelectedContent', {selection: content2});

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

        "Should not add the same content twice": function () {
            var content = this._getMockStruct(1);

            this.selectedView.fire('confirmSelectedContent', {selection: content});
            this.selectedView.fire('confirmSelectedContent', {selection: content});

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
    });

    selectionUpdateConfirmViewTest = new Y.Test.Case({
        name: "eZ Universal Discovery View confirm view test",

        setUp: function () {
            var SelectedView = Y.Base.create('selectedView', Y.View, [], {
                    startAnimation: function () {
                        return false;
                    }
                });
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                multiple: true,
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.selectedView = new SelectedView({
                bubbleTargets: this.view
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            this.selectedView.destroy();
            delete this.view;
            delete this.confirmedList;
            delete this.selectedView;
        },

        "Should set the selection to the confirmed list": function () {
            var content = {};

            this.selectedView.fire('confirmSelectedContent', {selection: content});

            Assert.areSame(
                this.view.get('selection'), this.confirmedList.get('confirmedList'),
                "The selection should be set on the confirmed list view"
            );
        },

        "Should NOT set the selection to the confirmed list": function () {
            var content = {};

            this.view.set('multiple', false);
            this.view.fire('selectContent', {selection: content});

            Assert.isUndefined(
                this.confirmedList.get('confirmedList'),
                "The selection should not be set on the confirmed list view"
            );
        },
    });

    confirmButtonStateTest = new Y.Test.Case({
        name: "eZ Universal Discovery View confirm button state test",

        setUp: function () {
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
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
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                container: '.container',
                title: "Easier to run",
                methods: [this.method],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.method.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.method;
            delete this.confirmedList;
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

    resetTest= new Y.Test.Case({
        name: "eZ Universal Discovery View reset test",

        setUp: function () {
            this.initialTitle = 'Therapy?';
            this.confirmedList = new Mock();
            this.view = new Y.eZ.UniversalDiscoveryView({
                title: this.initialTitle,
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete this.confirmedList;
        },

        "Should reset the confirmed list": function () {
            Mock.expect(this.confirmedList, {
                method: 'reset',
            });
            this.view.set('title', 'new title');
            this.view.reset();

            Assert.areEqual(
                this.initialTitle, this.view.get('title'),
                "The view title should have been resetted to the initial title"
            );
            Mock.verify(this.confirmedList);
        },
    });

    defaultConfirmedListTest = new Y.Test.Case({
        name: "eZ Universal Discovery View default confirmed list value test",

        setUp: function () {
            Y.eZ.UniversalDiscoveryConfirmedListView = Y.Base.create(
                'testView', Y.View, [], {}
            );
            this.view = new Y.eZ.UniversalDiscoveryView({
                methods: [],
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.UniversalDiscoveryConfirmedListView;
        },


        "Should instantiate the confirmed list view": function () {
            Assert.isInstanceOf(
                Y.eZ.UniversalDiscoveryConfirmedListView,
                this.view.get('confirmedListView'),
                "The confirmed list view should be an instance of eZ.UniversalDiscoveryConfirmedListView"
            );
        },

        "Should add the confirmed list view as a bubble target": function () {
            var list = this.view.get('confirmedListView'),
                bubble = false;

            this.view.on('*:whatever', function () {
                bubble = true;
            });
            list.fire('whatever');

            Assert.isTrue(
                bubble,
                "The confirmed list view's event should bubble to the universal discovery view"
            );
        },
    });

    multipleClassTest= new Y.Test.Case({
        name: "eZ Universal Discovery View multiple class test",

        setUp: function () {
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
        },

        "Should add the multiple class": function () {
            this.view.set('multiple', true);
            Assert.isTrue(
                this.view.get('container').hasClass('is-multiple-selection-mode'),
                "The multiple class should be added to the view container"
            );
        },

        "Should remove the multiple class": function () {
            this["Should add the multiple class"]();
            this.view.set('multiple', false);
            Assert.isFalse(
                this.view.get('container').hasClass('is-multiple-selection-mode'),
                "The multiple class should be removed from the view container"
            );
        },
    });

    animatedSelectionTest = new Y.Test.Case({
        name: "eZ Universal Discovery View animated selection test",

        setUp: function () {
            var SelectedView = Y.Base.create('selectedView', Y.View, [], {
                    startAnimation: function () {
                        return this.get('container').one('.animation');
                    }
                });
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                methods: [],
                confirmedListView: this.confirmedList,
            });
            this.selectedView = new SelectedView({
                bubbleTargets: this.view,
                container: '.selected-container',
            });
            this.view.render();
            this.selectedView.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            this.selectedView.destroy();
            delete this.view;
            delete this.confirmedList;
            delete this.selectedView;
        },

        _getMockStruct: function (contentId) {
            var contentInfo = new Mock();

            Mock.expect(contentInfo, {
                method: 'get',
                args: ['id'],
                returns: contentId,
            });

            return {
                contentInfo: contentInfo,
            };
        },

        "Should move the selectedView animate element": function () {
            var animatedElt;

            this.selectedView.fire('confirmSelectedContent', {selection: this._getMockStruct(1)});
            animatedElt = this.selectedView.startAnimation();

            Assert.areEqual(
                this.confirmedList.get('container').getX(),
                animatedElt.getX(),
                "The animated element x coordinate should be the confirmed list container x coordinate"
            );
        },
    });

    unselectContentTest = new Y.Test.Case({
        name: "eZ Universal Discovery View confirm unselectContent event test",

        setUp: function () {
            var that = this,
                TestMethod = Y.Base.create('testMethod', Y.eZ.UniversalDiscoveryMethodBaseView, [], {
                    onUnselectContent: function (contentId) {
                        Assert.areEqual(
                            that.removeContentId, contentId,
                            "The method should be notified for the removal of the content"
                        );
                        that.onUnselectContentCalled = true;
                    },
                });
            this.removeContentId = 42;
            this.onUnselectContentCalled = false;
            this.confirmedList = new Y.View();
            this.view = new Y.eZ.UniversalDiscoveryView({
                methods: [new TestMethod()],
                confirmedListView: this.confirmedList,
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.confirmedList.destroy();
            delete this.view;
            delete this.confirmedList;
        },

        "Should remove the content from the selection (multiple)": function () {
            var selection = [],
                remainingContent = new Mock(),
                removeContentId = 42;

            selection.push({
                contentInfo: new Mock(),
            });
            selection.push({
                contentInfo: remainingContent,
            });
            Mock.expect(selection[0].contentInfo, {
                method: 'get',
                args: ['id'],
                returns: removeContentId,
            });
            Mock.expect(remainingContent, {
                method: 'get',
                args: ['id'],
                returns: "",
            });
            this.view.set('multiple', true);
            this.view._set('selection', selection);
            this.view.fire('whatever:unselectContent', {
                contentId: removeContentId,
            });

            Assert.areEqual(
                1, this.view.get('selection').length,
                "The selection should contain only one content"
            );
            Assert.areSame(
                remainingContent, this.view.get('selection')[0].contentInfo,
                "The 42 content should have been removed"
            );
            Assert.isTrue(
                this.onUnselectContentCalled, "onUnselectContent should have been called"
            );
        },

        "Should reset the selection after removing the last content": function () {
            var selection = [],
                removeContentId = 42;

            selection.push({
                contentInfo: new Mock(),
            });
            Mock.expect(selection[0].contentInfo, {
                method: 'get',
                args: ['id'],
                returns: removeContentId,
            });
            this.view.set('multiple', true);
            this.view._set('selection', selection);
            this.view.fire('whatever:unselectContent', {
                contentId: removeContentId,
            });

            Assert.isNull(
                this.view.get('selection'),
                "The selection should be null"
            );
            Assert.isTrue(
                this.onUnselectContentCalled, "onUnselectContent should have been called"
            );
        },

        "Should remove the content from the selection": function () {
            var selection,
                removeContentId = 42;

            selection = {
                contentInfo: new Mock(),
            };
            Mock.expect(selection.contentInfo, {
                method: 'get',
                args: ['id'],
                returns: removeContentId,
            });
            this.view._set('selection', selection);
            this.view.fire('whatever:unselectContent', {
                contentId: removeContentId,
            });

            Assert.isNull(
                this.view.get('selection'),
                "The selection should be null"
            );
            Assert.isTrue(
                this.onUnselectContentCalled, "onUnselectContent should have been called"
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
    Y.Test.Runner.add(selectionUpdateConfirmViewTest);
    Y.Test.Runner.add(confirmButtonStateTest);
    Y.Test.Runner.add(updateTitleTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(defaultConfirmedListTest);
    Y.Test.Runner.add(multipleClassTest);
    Y.Test.Runner.add(animatedSelectionTest);
    Y.Test.Runner.add(unselectContentTest);
}, '', {requires: ['test', 'base', 'view', 'node-event-simulate', 'ez-universaldiscoveryview']});
