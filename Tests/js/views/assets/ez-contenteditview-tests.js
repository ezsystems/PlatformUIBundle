YUI.add('ez-contenteditview-tests', function (Y) {
    var container = Y.one('.container'),
        formContents = "<form></form>",
        content, contentType, owner, mainLocation, formView,
        actionBar,
        actionBarContents = "<menu></menu>",
        mockConf = {
            method: 'toJSON',
            returns: {}
        },
        GESTURE_MAP = Y.Event._GESTURE_MAP,
        viewTest;

    content = new Y.Mock();
    contentType = new Y.Mock();
    owner = new Y.Mock();
    mainLocation = new Y.Mock();

    Y.Mock.expect(content, mockConf);
    Y.Mock.expect(contentType, mockConf);
    Y.Mock.expect(owner, mockConf);
    Y.Mock.expect(mainLocation, mockConf);

    // trick to simulate a tap event
    // taken from https://github.com/yui/yui3/blob/master/src/event/tests/unit/assets/event-tap-functional-tests.js
    Y.Node.prototype.tap = function (startOpts, endOpts) {
        Y.Event.simulate(this._node, GESTURE_MAP.start, startOpts);
        Y.Event.simulate(this._node, GESTURE_MAP.end, endOpts);
    };
    Y.NodeList.importMethod(Y.Node.prototype, 'tap');


    viewTest = new Y.Test.Case({
        name: "eZ Content Edit View test",

        _should: {
            ignore: {
                "Should fire a close event when tapping 'close' link": (Y.UA.phantomjs), // tap trick does not work in phantomjs
                "Should focus on the content element using special method": (Y.UA.phantomjs) // not changing document.activeElement property in phantomjs
            }
        },

        setUp: function () {

            formView = new Y.Mock();
            actionBar = new Y.Mock();

            Y.Mock.expect(formView, {
                method: 'get',
                args: ['container'],
                returns: formContents
            });
            Y.Mock.expect(formView, {
                method: 'set',
                callCount: 2,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (attribute, value) {
                    // fails if attribute and value are not consistent
                    // or if we set something else than content or contentType
                    if (
                        ( attribute === 'content' && value !== content ) ||
                        ( attribute === 'contentType' && value !== contentType ) ||
                        ( attribute !== 'content' && attribute !== 'contentType' )
                    ) {
                        Y.Asset.fail('Expecting to set either the content or contentType on the formView');
                    }
                }
            });
            Y.Mock.expect(formView, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(formView, {
                method: 'render',
                returns: formView
            });

            Y.Mock.expect(actionBar, {
                method: 'get',
                args: ['container'],
                returns: actionBarContents
            });
            Y.Mock.expect(actionBar, {
                method: 'set',
                args: ['content', content]
            });
            Y.Mock.expect(actionBar, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });
            Y.Mock.expect(actionBar, {
                method: 'render',
                returns: actionBar
            });

            this.view = new Y.eZ.ContentEditView({
                container: container,
                content: content,
                contentType: contentType,
                mainLocation: mainLocation,
                owner: owner,
                formView: formView,
                actionBar: actionBar
            });

        },

        tearDown: function () {
            Y.Mock.expect(formView, {
                method: 'destroy'
            });
            Y.Mock.expect(actionBar, {
                method: 'destroy'
            });
            this.view.destroy();
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
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
            Y.Assert.areNotEqual("", container.getHTML(), "View container should contain the result of the this.view");
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 5 variables");
                Y.Assert.isBoolean(variables.isTouch, "isTouch should be available in the template and should be boolean");
                Y.Assert.isObject(variables.content, "content should be available in the template and should be an object");
                Y.Assert.isObject(variables.contentType, "contentType should be available in the template and should be an object");
                Y.Assert.isObject(variables.mainLocation, "mainLocation should be available in the template and should be an object");
                Y.Assert.isObject(variables.owner, "owner should be available in the template and should be an object");

                return  '<div class="ez-contenteditformview-container"></div>' +
                        '<div class="ez-editactionbar-container"></div>';
            };
            this.view.render();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should render formView and actionBar in designated containers": function () {
            this.view.render();

            Y.Assert.areEqual(formContents, container.one('.ez-contenteditformview-container').getHTML(), "mock formContents is rendered in container");
            Y.Assert.areEqual(actionBarContents, container.one('.ez-editactionbar-container').getHTML(), "mock formContents is rendered in container");
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should destroy formView and ActionBar when destroying itself": function () {
            Y.Mock.expect(formView, {
                method: 'destroy'
            });
            Y.Mock.expect(actionBar, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(formView);
            Y.Mock.verify(actionBar);
        },

        "Should recieve events fired on it's child formView": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var view = new Y.eZ.ContentEditView({
                container: container,
                content: content,
                contentType: contentType,
                mainLocation: mainLocation,
                owner: owner,
                actionBar: actionBar
                }),
                testEventReceived = false;

            view.on('contentEditFormView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('formView').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child contentEditFormView");
        },

        "Should recieve events fired on it's child actionBar": function () {
            // We need another (not as in "setUp") view initialization sequence to test that
            var view = new Y.eZ.ContentEditView({
                    container: container,
                    content: content,
                    contentType: contentType,
                    mainLocation: mainLocation,
                    owner: owner,
                    formView: formView
                }),
                testEventReceived = false;

            view.on('editActionBarView:testEvent', function () {
                testEventReceived = true;
            });

            view.get('actionBar').fire('testEvent');

            Y.assert(testEventReceived, "Should have recieved the 'testEvent' from child editActionBarView");
        },


        "Should fire a close event when tapping 'close' link": function () {
            var closeFired = false,
                close;

            this.view.render();

            this.view.on('close', function (e) {
                closeFired = true;
            });

            close = Y.one('.ez-view-close');
            close.tap({
                target: close,
                type: GESTURE_MAP.start,
                bubbles: true,            // boolean
                cancelable: true,         // boolean
                view: window,               // DOMWindow
                detail: 0,
                pageX: 5,
                pageY:5,            // long
                screenX: 5,
                screenY: 5,  // long
                clientX: 5,
                clientY: 5,   // long
                ctrlKey: false,
                altKey: false,
                shiftKey:false,
                metaKey: false, // boolean
                touches: [
                    {
                        identifier: 'foo',
                        screenX: 5,
                        screenY: 5,
                        clientX: 5,
                        clientY: 5,
                        pageX: 5,
                        pageY: 5,
                        radiusX: 15,
                        radiusY: 15,
                        rotationAngle: 0,
                        force: 0.5,
                        target: close
                    }
                ],            // TouchList
                targetTouches: [
                    {
                        identifier: 'foo',
                        screenX: 5,
                        screenY: 5,
                        clientX: 5,
                        clientY: 5,
                        pageX: 5,
                        pageY: 5,
                        radiusX: 15,
                        radiusY: 15,
                        rotationAngle: 0,
                        force: 0.5,
                        target: close
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: close,
                type: GESTURE_MAP.end,
                bubbles: true,            // boolean
                cancelable: true,         // boolean
                view: window,               // DOMWindow
                detail: 0,
                pageX: 5,
                pageY:5,            // long
                screenX: 5,
                screenY: 5,  // long
                clientX: 5,
                clientY: 5,   // long
                ctrlKey: false,
                altKey: false,
                shiftKey:false,
                metaKey: false, // boolean
                touches: [
                    {
                        identifier: 'foo',
                        screenX: 5,
                        screenY: 5,
                        clientX: 5,
                        clientY: 5,
                        pageX: 5,
                        pageY: 5,
                        radiusX: 15,
                        radiusY: 15,
                        rotationAngle: 0,
                        force: 0.5,
                        target: close
                    }
                ],            // TouchList
                targetTouches: [
                    {
                        identifier: 'foo',
                        screenX: 5,
                        screenY: 5,
                        clientX: 5,
                        clientY: 5,
                        pageX: 5,
                        pageY: 5,
                        radiusX: 15,
                        radiusY: 15,
                        rotationAngle: 0,
                        force: 0.5,
                        target: close
                    }
                ],      // TouchList
                changedTouches: [
                    {
                        identifier: 'foo',
                        screenX: 5,
                        screenY: 5,
                        clientX: 5,
                        clientY: 5,
                        pageX: 5,
                        pageY: 5,
                        radiusX: 15,
                        radiusY: 15,
                        rotationAngle: 0,
                        force: 0.5,
                        target: close
                    }
                ]
            });
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should fire a close event when 'escape' hotkey is pressed": function () {
            var closeFired = false;

            this.view.on('close', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 27 }); // Sending "escape" key code
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should NOT fire a close event when any hotkey other than 'escape' is pressed": function () {
            var closeFired = false;

            this.view.on('close', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-main-content').simulate("keyup", { charCode: 28 }); // Sending some other key code
            Y.assert(!closeFired, "The close event should NOT have been fired");
        },

        "Should focus on the content element using special method": function () {
            var focused = false;
            this.view.render();

            container.one('.ez-main-content').on('focus', function () {
                focused = true;
            });

            this.view.setFocus();

            Y.assert(focused, "Main content node of the view should get the focus");
        },


        "opacity of technical infos should vary if the device is not a touch device": function () {
            var header;

            this.view._isTouch = function () { return false };
            this.view.render();

            header = this.view.get('container').one('header');
            header.simulate('mouseover');

            this.wait(function () {
                Y.assert(
                    header.one('.ez-technical-infos').getStyle('opacity') == 1,
                    "Opacity should be 1"
                );
            }, 300);


            header.simulate('mouseout');
            this.wait(function () {
                Y.assert(
                    header.one('.ez-technical-infos').getStyle('opacity') === 0,
                    "Opacity should be 0"
                );
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
                Y.assert(
                    header.one('.ez-technical-infos').getStyle('opacity') == 1,
                    "Opacity should be 1"
                );
            }, 300);


            header.simulate('mouseout');
            Y.assert(
                header.one('.ez-technical-infos').getStyle('opacity') == 1,
                "Opacity should be 1"
            );
            this.wait(function () {
                Y.assert(
                    header.one('.ez-technical-infos').getStyle('opacity') == 1,
                    "Opacity should be 1"
                );
            }, 300);
        }

    });

    Y.Test.Runner.setName("eZ Content Edit View tests");
    Y.Test.Runner.add(viewTest);


}, '0.0.1', {requires: ['test', 'event-tap', 'node-event-simulate', 'ez-contenteditview']});
