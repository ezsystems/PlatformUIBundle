/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenteditview-tests', function (Y) {
    var viewTest, titleTest, eventTest;

    viewTest = new Y.Test.Case({
        name: "eZ Content Edit View test",

        setUp: function () {
            var that = this,
                mockConf = {
                    method: 'toJSON',
                    returns: {}
                };

            Y.Array.each(['content', 'contentType', 'owner', 'mainLocation', 'version'], function (mock) {
                this[mock] = new Y.Mock();
                Y.Mock.expect(this[mock], mockConf);
            }, this);

            this.formView = new Y.Mock();
            this.formViewContents = '<form></form>';
            this.actionBar = new Y.Mock();
            this.actionBarContents = '<menu></menu>';

            Y.Mock.expect(this.formView, {
                method: 'get',
                args: ['container'],
                returns: this.formViewContents
            });
            Y.Mock.expect(this.formView, {
                method: 'set',
                callCount: 3,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (attribute, value) {
                    // fails if attribute and value are not consistent
                    // or if we set something else than content or contentType
                    if (
                        ( attribute === 'content' && value !== that.content ) ||
                        ( attribute === 'contentType' && value !== that.contentType ) ||
                        ( attribute === 'version' && value !== that.version ) ||
                        ( attribute !== 'content' && attribute !== 'contentType' && attribute !== 'version' )
                    ) {
                        Y.Assert.fail('Expecting to set either the content, the contentType or the version on the this.formView');
                    }
                }
            });
            Y.Mock.expect(this.formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.formView, {
                method: 'render',
                returns: this.formView
            });
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });

            Y.Mock.expect(this.actionBar, {
                method: 'get',
                args: ['container'],
                returns: this.actionBarContents
            });
            Y.Mock.expect(this.actionBar, {
                method: 'set',
                callCount: 2,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (attr, value) {
                    if ( attr === 'content' ) {
                        Y.Assert.areSame(value, that.content, "Expecting the content");
                    } else if ( attr === 'version' ) {
                        Y.Assert.areSame(value, that.version, "Expected the version");
                    } else {
                        Y.Assert.fail("Expecting to set either the version or content");
                    }
                }
            });
            Y.Mock.expect(this.actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(this.actionBar, {
                method: 'render',
                returns: this.actionBar
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view = new Y.eZ.ContentEditView({
                container: '.container',
                content: this.content,
                contentType: this.contentType,
                mainLocation: this.mainLocation,
                version: this.version,
                owner: this.owner,
                formView: this.formView,
                actionBar: this.actionBar
            });
            Y.Mock.expect(this.actionBar, {
                method: 'removeTarget',
                args: [this.view]
            });
            Y.Mock.expect(this.formView, {
                method: 'removeTarget',
                args: [this.view]
            });

        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl,
                container = this.view.get('container');

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
            Y.Assert.areNotEqual("", container.getHTML(), "View container should contain the result of the this.view");

            Y.Assert.areEqual(
                container.one('.ez-main-content').getStyle('min-height'),
                container.get('winHeight') + 'px'
            );

            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(6, Y.Object.keys(variables).length, "The template should receive 5 variables");
                Y.Assert.isBoolean(variables.isTouch, "isTouch should be available in the template and should be boolean");
                Y.Assert.isObject(variables.content, "content should be available in the template and should be an object");
                Y.Assert.isObject(variables.contentType, "contentType should be available in the template and should be an object");
                Y.Assert.isObject(variables.mainLocation, "mainLocation should be available in the template and should be an object");
                Y.Assert.isObject(variables.owner, "owner should be available in the template and should be an object");
                Y.Assert.isObject(variables.version, "version should be available in the template and should be an object");

                return  origTpl.call(this, variables);
            };
            this.view.render();
            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should render formView and actionBar in designated containers": function () {
            var container = this.view.get('container');

            this.view.render();

            Y.Assert.areEqual(
                this.formViewContents,
                container.one('.ez-contenteditformview-container').getHTML(),
                "mock formContents is not rendered in its container"
            );
            Y.Assert.areEqual(
                this.actionBarContents,
                container.one('.ez-editactionbar-container').getHTML(),
                "mock actionBarContents is not rendered in its container"
            );

            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should destroy formView and ActionBar when destroying itself": function () {
            Y.Mock.expect(this.formView, {
                method: 'destroy'
            });
            Y.Mock.expect(this.actionBar, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(this.formView);
            Y.Mock.verify(this.actionBar);
        },

        "Should receive events fired on it's child formView": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var testEventReceived = false,
                view = new Y.eZ.ContentEditView({
                    container: '.container',
                    content: this.content,
                    contentType: this.contentType,
                    mainLocation: this.mainLocation,
                    owner: this.owner,
                    actionBar: this.actionBar
                });

            view.on('contentEditFormView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('formView').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child contentEditFormView");
        },

        "Should receive events fired on it's child actionBar": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var view = new Y.eZ.ContentEditView({
                    container: '.container',
                    content: this.content,
                    contentType: this.contentType,
                    mainLocation: this.mainLocation,
                    owner: this.owner,
                    formView: this.formView
                }),
                testEventReceived = false;

            view.on('editActionBarView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('actionBar').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child editActionBarView");
        },

        "Should fire a closeView event when tapping 'close' link": function () {
            var closeFired = false, that = this;

            this.view.render();

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            Y.one('.ez-view-close').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(closeFired, "The close event should have been fired");
                });
            });
            this.wait();
        },

        "Should fire a closeView event when 'escape' hotkey is pressed": function () {
            var closeFired = false, container = this.view.get('container');

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 27 }); // Sending "escape" key code
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should NOT fire a closeView event when any hotkey other than 'escape' is pressed": function () {
            var closeFired = false, container = this.view.get('container');

            this.view.on('closeView', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 28 }); // Sending some other key code
            Y.assert(!closeFired, "The close event should NOT have been fired");
        },

        "Should focus on the content element when the view becomes active": function () {
            var container = this.view.get('container');
            this.view.render().set('active', true);
            Y.Assert.areSame(
                Y.config.doc.activeElement,
                container.one('.ez-main-content').getDOMNode(),
                "The main content should get the focus"
            );
        },

        "opacity of technical infos should vary if the device is not a touch device": function () {
            var header;

            this.view._isTouch = function () { return false; };
            this.view.render();

            header = this.view.get('container').one('header');
            header.simulate('mouseover');

            this.wait(function () {
                Y.Assert.areEqual(
                    1, header.one('.ez-technical-infos').getStyle('opacity'),
                    "Opacity should be 1"
                );
                header.simulate('mouseout');
                this.wait(function () {
                    Y.Assert.areEqual(
                        0, header.one('.ez-technical-infos').getStyle('opacity'),
                        "Opacity should be 0"
                    );
                }, 300);
            }, 300);
        },

        "opacity of technical infos should stay at 1 if the device is a touch device": function () {
            var header;

            this.view._isTouch = function () { return true; };
            this.view.render();

            header = this.view.get('container').one('header');
            header.simulate('mouseover');

            Y.assert(
                header.one('.ez-technical-infos').getStyle('opacity') == 1,
                "Opacity should be 1"
            );

            this.wait(function () {
                Y.Assert.areEqual(
                    1, header.one('.ez-technical-infos').getStyle('opacity'),
                    "Opacity should be 1"
                );
                header.simulate('mouseout');
                this.wait(function () {
                    Y.Assert.areEqual(
                        1, header.one('.ez-technical-infos').getStyle('opacity'),
                        "Opacity should be 1"
                    );
                }, 300);
            }, 300);
        },
    });

    titleTest = new Y.Test.Case({
        name: "View title test",

        setUp: function () {
            this.view = new Y.eZ.ContentEditView();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should build the title with the content name": function () {
            var content = new Y.Mock(),
                contentName = 'Ryan Gosling';

            Y.Mock.expect(content, {
                method: 'get',
                args: ['name'],
                returns: contentName
            });
            this.view.set('content', content);
            Y.Assert.isTrue(
                this.view.getTitle().indexOf(contentName) != -1,
                "The title of the view should contain the content name"
            );
        },
    });

    eventTest = new Y.Test.Case({
        name: "eZ Content Edit View event tests",

        setUp: function () {
            this.formView = new Y.Mock();
            this.actionBar = new Y.Mock();

            this._configureSubViewMock(this.formView);
            this._configureSubViewMock(this.actionBar);

            this.view = new Y.eZ.ContentEditView({
                actionBar: this.actionBar,
                formView: this.formView
            });
        },

        _configureSubViewMock: function (view) {
            Y.Mock.expect(view, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object]
            });
            Y.Mock.expect(view, {
                method: 'set',
                args: [Y.Mock.Value.String, Y.Mock.Value.Any]
            });
        },

        tearDown: function () {
            delete this.view;
        },

        _testAddDataActionEvent: function (evt) {
            var fields = [], valid = true;

            Y.Mock.expect(this.formView, {
                method: 'getFields',
                args: [Y.Mock.Value.Any],
                returns: fields
            });
            Y.Mock.expect(this.formView, {
                method: 'isValid',
                returns: valid
            });

            this.view.on('*:' + evt, function (e) {
                Y.Assert.areSame(
                    fields,
                    e.fields,
                    "The fields should be availabled in the event facade"
                );
                Y.Assert.areSame(
                    valid,
                    e.formIsValid,
                    "The form validity should be available in the event facade"
                );
            });
            this.view.fire('whatever:' + evt);
        },

        "Should add data to the saveAction event facade": function () {
            this._testAddDataActionEvent('saveAction');
        },

        "Should add data to the publishAction event facade": function () {
            this._testAddDataActionEvent('publishAction');
        }
    });

    Y.Test.Runner.setName("eZ Content Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(titleTest);
    Y.Test.Runner.add(eventTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-contenteditview']});
