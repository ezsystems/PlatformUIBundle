YUI.add('ez-editactionbarview-tests', function (Y) {

    var viewContainer = Y.one('.container'),
        GESTURE_MAP = Y.Event._GESTURE_MAP;

    // trick to simulate a tap event
    // taken from https://github.com/yui/yui3/blob/master/src/event/tests/unit/assets/event-tap-functional-tests.js
    Y.Node.prototype.tap = function (startOpts, endOpts) {
        Y.Event.simulate(this._node, GESTURE_MAP.start, startOpts);
        Y.Event.simulate(this._node, GESTURE_MAP.end, endOpts);
    };
    Y.NodeList.importMethod(Y.Node.prototype, 'tap');

    viewTest = new Y.Test.Case({
        name: "eZ Action Bar test",

        _should: {
            ignore: {
                "Should fire an action once any of the action labels are tapped": (Y.UA.phantomjs), // tap trick does not work in phantomjs
                "Should open additional menu when tapping 'View more' button": (Y.UA.phantomjs) // tap trick does not work in phantomjs
            }
        },

        setUp: function () {

            this.view = new Y.eZ.EditActionBarView({
                container: viewContainer,
                actionsList: [
                    new Y.eZ.ButtonActionView({
                        actionId : "publish",
                        label : "Publish",
                        priority : 0
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "save",
                        label : "Save",
                        priority : 100,
                        hint : "the test hint"
                    }),
                    new Y.eZ.ButtonActionView({
                        actionId : "discard",
                        label : "Discard changes",
                        priority : 200
                    })
                ]
            });

        },

        tearDown: function () {
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
            Y.Assert.areNotEqual("", viewContainer.getHTML(), "View container should contain the result of the this.view");
        },

        "Test available variable in template while render() call": function () {
            origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 2 variables");
                Y.Assert.isString(variables.viewMoreText, "View more text label should be available in the template and should be a string");
                Y.Assert.isString(variables.actions, "actions List should be available in the template and should be a string");
                Y.Assert.isString(variables.viewMoreActions, "viewMoreActions List should be available in the template and should be a string");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Test available variable in template while _renderFull() call": function () {
            origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");
                Y.Assert.isString(variables.actions, "actions List should be available in the template and should be a string");
                Y.Assert.isString(variables.viewMoreText, "View more text label should be available in the template and should be a string");
                return origTpl.apply(this, arguments);
            };
            this.view._renderFull();
        },

        "Should sort actions by priority in descending order": function () {
            this.view._sortActions();

            Y.assert( this.view.get('actionsList')[0].get('actionId') == "discard", "Discard action should become first according to it's priority after sorting");
        },

        "Should add actions to actions list": function () {
            this.view.addAction(new Y.eZ.ButtonActionView({
                actionId : "test",
                label : "Test",
                priority : 150,
                hint : "the test hint"
            }));

            Y.assert( this.view.get('actionsList').length == 4, "New action should have been added to list" );
        },

        "Should remove actions from actions list": function () {
            this.view.removeAction("save");

            Y.assert( this.view.get('actionsList').length == 2, "New action should have been added to list" );
        },

        "Should not show 'View more' button, when all the actions fit on the screen": function () {
            Y.assert( Y.one('.view-more-button') === null, "Button should not be present in DOM" );
        },

        "Should show 'View more' button, when all the actions don't fit on the screen": function () {
            var counter;

            for (counter = 0; counter < 30; counter++) {
                this.view.addAction(new Y.eZ.ButtonActionView({
                    actionId : "test" + counter,
                    label : "Test",
                    priority : 100,
                    hint : "the test hint"
                }));
            }

            this.view.handleWindowResize();
            Y.assert( Y.one('.view-more-button') !== null, "Button should be present in DOM" );
        },

        "Should open additional menu when tapping 'View more' button": function () {
            var viewMoreButton, viewMoreMenu, counter;

            for (counter = 0; counter < 30; counter++) {
                this.view.addAction(new Y.eZ.ButtonActionView({
                    actionId : "test" + counter,
                    label : "Test",
                    priority : 100,
                    hint : "the test hint"
                }));
            }
            this.view.handleWindowResize();

            viewMoreButton = Y.one('.view-more-button');
            viewMoreMenu = Y.one('.view-more-actions');

            Y.assert( !viewMoreMenu.hasClass('is-shown'), "Additional menu should NOT be visible before the tap" );

            viewMoreButton.tap({
                target: viewMoreButton,
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
                        target: viewMoreButton
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
                        target: viewMoreButton
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: viewMoreButton,
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
                        target: viewMoreButton
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
                        target: viewMoreButton
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
                        target: viewMoreButton
                    }
                ]
            });

            Y.assert( viewMoreMenu.hasClass('is-shown'), "Additional menu should be visible after the tap" );
        },


        "Should fire an action once any of the action labels are tapped": function () {
            var publishActionLabel,
                actionFired = false;

            this.view.on('action', function () {
                actionFired = true;
            });

            this.view.render();

            publishActionLabel = this.view.get('container').one('[data-action="publish"]');

            publishActionLabel.tap({
                target: publishActionLabel,
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
                        target: publishActionLabel
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
                        target: publishActionLabel
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: publishActionLabel,
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
                        target: publishActionLabel
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
                        target: publishActionLabel
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
                        target: publishActionLabel
                    }
                ]
            });

            Y.assert(actionFired, "Action event should have been fired");
        }

    });

    Y.Test.Runner.setName("eZ Action Bar tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'event-tap', 'node-event-simulate', 'ez-editactionbarview', 'ez-buttonactionview', 'ez-previewactionview']});
