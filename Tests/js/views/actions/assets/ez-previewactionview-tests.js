YUI.add('ez-previewactionview-tests', function (Y) {

    var container = Y.one('.container'),
        editPreview,
        previewContents = "<div></div>",
        contentMock = new Y.Mock(),
        GESTURE_MAP = Y.Event._GESTURE_MAP;

    // trick to simulate a tap event
    // taken from https://github.com/yui/yui3/blob/master/src/event/tests/unit/assets/event-tap-functional-tests.js
    Y.Node.prototype.tap = function (startOpts, endOpts) {
        Y.Event.simulate(this._node, GESTURE_MAP.start, startOpts);
        Y.Event.simulate(this._node, GESTURE_MAP.end, endOpts);
    };
    Y.NodeList.importMethod(Y.Node.prototype, 'tap');

    viewTest = new Y.Test.Case({
        name: "eZ Preview Action View test",

        _should: {
            ignore: {
                "Should show editPreview once 'desktop mode' button is tapped, and change the preview mode once 'tablet mode' is tapped (and correctly show it in the UI)" : (Y.UA.phantomjs), // tap trick does not work in phantomjs
                "Should show editPreview once 'tablet mode' button is tapped (and correctly show it in the UI)" : (Y.UA.phantomjs), // tap trick does not work in phantomjs
                "Should show editPreview once 'mobile mode' button is tapped (and correctly show it in the UI)" : (Y.UA.phantomjs) // tap trick does not work in phantomjs
            }
        },

        setUp: function () {
            editPreview = new Y.Mock();

            Y.Mock.expect(editPreview, {
                method: 'get',
                args: ['container'],
                returns: previewContents
            });
            Y.Mock.expect(editPreview, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });

            this.view = new Y.eZ.PreviewActionView({
                container: container,
                content: contentMock,
                actionId: "preview",
                hint: "Test hint",
                label: "Test label",
                buttons: [{
                    option : "desktop"
                }, {
                    option : "tablet"
                }, {
                    option : "mobile"
                }],
                editPreview: editPreview
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set Content attribute for the PreviewView, once setting it for itself": function () {
            var previewContent;
            Y.Mock.expect(editPreview, {
                method: 'set',
                callCount: 2,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (param, value) {
                    previewContent = value;
                }
            });
            Y.Mock.expect(editPreview, {
                method: 'get',
                callCount: 0
            });

            this.view.set('content', contentMock);
            Y.Assert.areSame( previewContent, contentMock, "editPreview should set correct content attribute" );
            Y.Mock.verify(editPreview);
        },

        "Should show editPreview once 'desktop mode' button is tapped, and change the preview mode once 'tablet mode' is tapped (and correctly show it in the UI)": function () {
            var desktopPreviewTrigger, tabletPreviewTrigger,
                previewShown = false,
                currentMode,
                container = this.view.get('container');

            Y.Mock.expect(editPreview, {
                method: 'set',
                callCount: 2,
                args: ['currentModeId', Y.Mock.Value.String],
                run: function (option, value) {
                    currentMode = value;
                }
            });
            Y.Mock.expect(editPreview, {
                method: 'show',
                args: [container.getX()],
                callCount: 2,
                run: function () {
                    previewShown = true;
                }
            });

            this.view.render();

            // Checking UI status
            Y.assert(
                container.all('.is-selected[data-action="preview"]').isEmpty(),
                "Each of the preview mode buttons should NOT be highlighted"
            );

            desktopPreviewTrigger = container.one('[data-action-option="desktop"]');
            tabletPreviewTrigger = container.one('[data-action-option="tablet"]');

            // ***
            // DESKTOP trigger

            desktopPreviewTrigger.tap({
                target: desktopPreviewTrigger,
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
                        target: desktopPreviewTrigger
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
                        target: desktopPreviewTrigger
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: desktopPreviewTrigger,
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
                        target: desktopPreviewTrigger
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
                        target: desktopPreviewTrigger
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
                        target: desktopPreviewTrigger
                    }
                ]
            });

            Y.assert(previewShown, "Preview should have been shown");
            Y.assert(currentMode === 'desktop', "Preview mode should have been changed");

            // Checking UI changes as well
            Y.assert(desktopPreviewTrigger.hasClass("is-selected"), "Active preview mode button should be highlighted");
            Y.assert(
                container.all('.is-selected[data-action="preview"]:not([data-action-option="desktop"])').isEmpty(),
                "Each of the other preview mode buttons should NOT be highlighted"
            );

            // ***
            // TABLET trigger

            tabletPreviewTrigger.tap({
                target: tabletPreviewTrigger,
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: tabletPreviewTrigger,
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
                    }
                ]
            });

            Y.assert(currentMode === 'tablet', "Preview mode should have been changed");

            // Checking UI changes as well
            Y.assert(tabletPreviewTrigger.hasClass("is-selected"), "Active preview mode button should be highlighted");
            Y.assert(
                container.all('.is-selected[data-action="preview"]:not([data-action-option="tablet"])').isEmpty(),
                "Each of the other preview mode buttons should NOT be highlighted"
            );

            Y.Mock.verify(editPreview);
        },

        "Should show editPreview once 'tablet mode' button is tapped (and correctly show it in the UI)": function () {
            var tabletPreviewTrigger,
                previewShown = false,
                currentMode,
                container = this.view.get('container');

            Y.Mock.expect(editPreview, {
                method: 'set',
                args: ['currentModeId', Y.Mock.Value.String],
                run: function (option, value) {
                    currentMode = value;
                }
            });
            Y.Mock.expect(editPreview, {
                method: 'show',
                args: [container.getX()],
                run: function () {
                    previewShown = true;
                }
            });

            this.view.render();

            // Checking UI status
            Y.assert(
                container.all('.is-selected[data-action="preview"]').isEmpty(),
                "Each of the preview mode buttons should NOT be highlighted"
            );

            tabletPreviewTrigger = container.one('[data-action-option="tablet"]');

            tabletPreviewTrigger.tap({
                target: tabletPreviewTrigger,
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: tabletPreviewTrigger,
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
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
                        target: tabletPreviewTrigger
                    }
                ]
            });

            Y.assert(previewShown, "Preview should have been shown");
            Y.assert(currentMode === 'tablet', "Preview mode should have been changed");

            // Checking UI changes as well
            Y.assert(tabletPreviewTrigger.hasClass("is-selected"), "Active preview mode button should be highlighted");
            Y.assert(
                container.all('.is-selected[data-action="preview"]:not([data-action-option="tablet"])').isEmpty(),
                "Each of the other preview mode buttons should NOT be highlighted"
            );

            Y.Mock.verify(editPreview);
        },

        "Should show editPreview once 'mobile mode' button is tapped (and correctly show it in the UI)": function () {
            var mobilePreviewTrigger,
                previewShown = false,
                currentMode,
                container = this.view.get('container');

            Y.Mock.expect(editPreview, {
                method: 'set',
                args: ['currentModeId', Y.Mock.Value.String],
                run: function (option, value) {
                    currentMode = value;
                }
            });
            Y.Mock.expect(editPreview, {
                method: 'show',
                args: [container.getX()],
                run: function () {
                    previewShown = true;
                }
            });

            this.view.render();

            // Checking UI status
            Y.assert(
                container.all('.is-selected[data-action="preview"]').isEmpty(),
                "Each of the preview mode buttons should NOT be highlighted"
            );

            mobilePreviewTrigger = container.one('[data-action-option="mobile"]');

            mobilePreviewTrigger.tap({
                target: mobilePreviewTrigger,
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
                        target: mobilePreviewTrigger
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
                        target: mobilePreviewTrigger
                    }
                ],      // TouchList
                changedTouches: []     // TouchList
            }, {
                target: mobilePreviewTrigger,
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
                        target: mobilePreviewTrigger
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
                        target: mobilePreviewTrigger
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
                        target: mobilePreviewTrigger
                    }
                ]
            });

            Y.assert(previewShown, "Preview should have been shown");
            Y.assert(currentMode === 'mobile', "Preview mode should have been changed");

            // Checking UI changes as well
            Y.assert(mobilePreviewTrigger.hasClass("is-selected"), "Active preview mode button should be highlighted");
            Y.assert(
                container.all('.is-selected[data-action="preview"]:not([data-action-option="mobile"])').isEmpty(),
                "Each of the other preview mode buttons should NOT be highlighted"
            );

            Y.Mock.verify(editPreview);
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
            Y.Mock.verify(editPreview);
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Y.Assert.isArray(variables.buttons, "buttons should be available in the template and should be an array");
                Y.Assert.isBoolean(variables.disabled, "disabled should be available in the template and should be boolean");
                Y.Assert.isString(variables.actionId, "actionId should be available in the template and should be a string");
                Y.Assert.isString(variables.label, "label should be available in the template and should be a string");
                Y.Assert.isString(variables.hint, "hint should be available in the template and should be a string");

                return  '<div class="ez-editpreviewview-container"></div>';
            };
            this.view.render();
            Y.Mock.verify(editPreview);
        },

        "Should destroy editPreview when destroying itself": function () {
            Y.Mock.expect(editPreview, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(editPreview);
        },

        "Should change the UI when catching event editPreviewHide is hidden": function () {

            this.view.render();

            this.view.fire('editPreviewView:editPreviewHide');
            this.view.get('container').all('[data-action="preview"]').each(function (trigger) {
                Y.assert(!trigger.hasClass("is-selected"), "Each of the preview mode buttons should NOT be highlighted");
            });
        }

    });

    Y.Test.Runner.setName("eZ Preview Action View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'ez-previewactionview', 'event-tap', 'node-screen']});
