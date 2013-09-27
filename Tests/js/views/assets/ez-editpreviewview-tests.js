YUI.add('ez-editpreviewview-tests', function (Y) {

    var viewContainer = Y.one('.container'),
        GESTURE_MAP = Y.Event._GESTURE_MAP,
        IS_HIDDEN_CLASS = 'is-hidden',
        IS_LOADING_CLASS = 'is-loading';
    mockContent = new Y.eZ.Content({
        contentId : 59,
        name : "Test name"
    });


    // trick to simulate a tap event
    // taken from https://github.com/yui/yui3/blob/master/src/event/tests/unit/assets/event-tap-functional-tests.js
    Y.Node.prototype.tap = function (startOpts, endOpts) {
        Y.Event.simulate(this._node, GESTURE_MAP.start, startOpts);
        Y.Event.simulate(this._node, GESTURE_MAP.end, endOpts);
    };
    Y.NodeList.importMethod(Y.Node.prototype, 'tap');

    viewTest = new Y.Test.Case({
        name: "eZ Edit Preview View test",

        _should: {
            ignore: {
                "Should hide itself once 'Close preview' link is tapped": (Y.UA.phantomjs) // tap trick does not work in phantomjs
            }
        },

        setUp: function () {

            this.view = new Y.eZ.EditPreviewView({
                container: viewContainer,
                content: mockContent
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

        "Test available variable in template": function () {
            origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                Y.Assert.isObject(variables.mode, "mode should be available in the template and should be an object");
                Y.Assert.isString(variables.legend, "legend should be available in the template and should be a string");
                Y.Assert.isString(variables.source, "source should be available in the template and should be a string");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should show itself when needed": function () {

            var previewNode = this.view.get('container').get('parentNode');

            this.view.show();

            Y.assert(!previewNode.hasClass(IS_HIDDEN_CLASS), "Container's parent node should NOT have certain class" );
        },

        "Should show iframe loader once it begins to load": function () {

            var loader;

            this.view.render();
            loader = this.view.get('container').one('.loader');

            Y.assert(loader.hasClass(IS_LOADING_CLASS), "Right after rendering, iframe loader should have certain class");

        },


        "Should hide iframe loader once it is done loading": function () {

            var loader;

            this.view.render();
            loader = this.view.get('container').one('.loader');

            this.wait(function () {
                Y.assert(!loader.hasClass(IS_LOADING_CLASS), "After iframe is done loading, iframe loader should NOT have certain class");
            }, 800);
        },

        "Should hide itself once 'Close preview' link is tapped": function () {
            var hidePreview, previewNode;

            this.view.render();

            previewNode = this.view.get('container').get('parentNode');
            hidePreview = previewNode.one('.ez-preview-hide');

            hidePreview.tap({
                target: hidePreview,
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
                        target: hidePreview
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
                        target: hidePreview
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: hidePreview,
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
                        target: hidePreview
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
                        target: hidePreview
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
                        target: hidePreview
                    }
                ]
            });

            Y.assert(previewNode.hasClass(IS_HIDDEN_CLASS), "After 'Close preview' tap, certain class should be added to container's parent node");

        }

    });

    Y.Test.Runner.setName("eZ Edit Preview View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'event-tap', 'node-event-simulate', 'ez-editpreviewview', 'ez-contentmodel']});
