YUI.add('ez-previewactionview-tests', function (Y) {
    var container = Y.one('.container'),
        editPreview,
        previewContents = "<div></div>",
        contentMock = new Y.Mock(),
        viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Preview Action View test",

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
                    option: "desktop"
                }, {
                    option: "tablet"
                }, {
                    option: "mobile"
                }, {
                    option: "tv"
                }],
                editPreview: editPreview
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the button action view class name on the view container": function () {
            var container = this.view.get('container');

            Y.Mock.expect(editPreview, {
                method: 'set',
                args: [Y.Mock.Value.Any, Y.Mock.Value.Any]
            });
            Y.Mock.expect(editPreview, {
                method: 'show',
                args: [Y.Mock.Value.Any]
            });

            this.view.render();
            Y.Assert.isTrue(
                container.hasClass('ez-view-buttonactionview'),
                "The container should have the view class name from the button action view"
            );
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

        _showPreviewMode: function (mode) {
            var previewTrigger,
                previewShown = false,
                currentMode,
                that = this,
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
                "The preview buttons should NOT be highlighted"
            );

            previewTrigger = container.one('[data-action-option="' + mode + '"]');

            previewTrigger.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(previewShown, "Preview should have been shown");
                    Y.assert(currentMode === mode, "Preview mode should have been changed to '" + mode + "'");

                    // Checking UI changes as well
                    Y.assert(
                        previewTrigger.hasClass("is-selected"),
                        "Active preview mode button should be highlighted"
                    );
                    Y.assert(
                        container.all(
                            '.is-selected[data-action="preview"]:not([data-action-option="' + mode + '"])'
                        ).isEmpty(),
                        "Each of the other preview mode buttons should NOT be highlighted"
                    );
                });
            });
            this.wait();

            Y.Mock.verify(editPreview);
        },

        "Should show the 'desktop'preview": function () {
            this._showPreviewMode('desktop');
        },

        "Should show the 'tablet' preview": function () {
            this._showPreviewMode('tablet');
        },

        "Should show the 'mobile' preview": function () {
            this._showPreviewMode('mobile');
        },

        "Should switch from one preview mode to another": function () {
            this._showPreviewMode('desktop');
            this._showPreviewMode('mobile');
            this._showPreviewMode('tablet');
            this._showPreviewMode('desktop');
            this._showPreviewMode('tv');
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

}, '0.0.1', {requires: ['test', 'ez-previewactionview', 'node-event-simulate']});
