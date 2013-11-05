YUI.add('ez-buttonactionview-tests', function (Y) {
    var container = Y.one('.container'),
        GESTURE_MAP = Y.Event._GESTURE_MAP,
        viewTest;

    // trick to simulate a tap event
    // taken from https://github.com/yui/yui3/blob/master/src/event/tests/unit/assets/event-tap-functional-tests.js
    Y.Node.prototype.tap = function (startOpts, endOpts) {
        Y.Event.simulate(this._node, GESTURE_MAP.start, startOpts);
        Y.Event.simulate(this._node, GESTURE_MAP.end, endOpts);
    };
    Y.NodeList.importMethod(Y.Node.prototype, 'tap');

    viewTest = new Y.Test.Case({
        name: "eZ Button Action View test",

        _should: {
            ignore: {
                "Should fire an action once the action button is tapped": (Y.UA.phantomjs) // tap trick does not work in phantomjs
            }
        },

        setUp: function () {
            this.view = new Y.eZ.ButtonActionView({
                container: container,
                actionId: "test",
                hint: "Test hint",
                label: "Test label"
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
            Y.Assert.areNotEqual("", container.getHTML(), "View container should contain the result of the this.view");
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(4, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Y.Assert.isBoolean(variables.disabled, "disabled should be available in the template and should be boolean");
                Y.Assert.isString(variables.actionId, "actionId should be available in the template and should be a string");
                Y.Assert.isString(variables.label, "label should be available in the template and should be a string");
                Y.Assert.isString(variables.hint, "hint should be available in the template and should be a string");

                return  '<button></button>';
            };
            this.view.render();
        },

        "Should fire an action once the action button is tapped": function () {
            var testActionTrigger,
                actionFired = false;

            // 'testAction' is composed of actionId + 'Action'
            this.view.on('testAction', function () {
                actionFired = true;
            });

            this.view.render();

            testActionTrigger = this.view.get('container').one('[data-action="test"]');

            testActionTrigger.tap({
                target: testActionTrigger,
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
                        target: testActionTrigger
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
                        target: testActionTrigger
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: testActionTrigger,
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
                        target: testActionTrigger
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
                        target: testActionTrigger
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
                        target: testActionTrigger
                    }
                ]
            });

            Y.assert(actionFired, "Action event should have been fired");
        }

    });

    Y.Test.Runner.setName("eZ Button Action View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'ez-buttonactionview', 'event-tap']});
