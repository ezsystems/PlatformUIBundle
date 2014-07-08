/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-previewactionview-tests', function (Y) {
    var viewTest, buttonTest;

    buttonTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            _should: {
                ignore: {
                    "Should fire an action once the action button is tapped": true,
                }
            },

            setUp: function () {
                this.editPreview = new Y.Mock();
                this.contentMock = new Y.Mock();

                Y.Mock.expect(this.editPreview, {
                    method: 'get',
                    args: ['container'],
                    returns: '<div></div>'
                });
                Y.Mock.expect(this.editPreview, {
                    method: 'addTarget',
                    args: [Y.Mock.Value.Object],
                    returns: true
                });

                this.version = {};

                this.actionId = "preview";
                this.hint = "Test hint";
                this.label = "Test label";
                this.disabled = true;

                this.view = new Y.eZ.PreviewActionView({
                    editPreview: this.editPreview,
                    container: '.container',
                    content: this.contentMock,
                    version: this.version,
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                    buttons: [
                        {option: "desktop"}, {option: "tablet"},
                        {option: "mobile"}, {option: "tv"},
                    ],
                });

                this.templateVariablesCount = 5;
            },

            "Should provide the buttons configuration in the template": function () {
                var that = this,
                    origTpl = this.view.template;

                this.view.template = function (variables) {
                    Y.Assert.areSame(
                        that.view.get('buttons'),
                        variables.buttons,
                        "The preview view buttons are not correctly passed"
                    );

                    return origTpl.apply(this, arguments);
                };
                this.view.render();
                Y.Mock.verify(this.editPreview);
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
                delete this.editPreview;
                delete this.contentMock;
            },
        })
    );

    viewTest = new Y.Test.Case({
        name: "eZ Preview Action View test",

        setUp: function () {
            this.editPreview = new Y.Mock();
            this.contentMock = new Y.Mock();

            Y.Mock.expect(this.editPreview, {
                method: 'get',
                args: ['container'],
                returns: '<div></div>'
            });
            Y.Mock.expect(this.editPreview, {
                method: 'addTarget',
                args: [Y.Mock.Value.Object],
                returns: true
            });

            this.version = {};
            this.view = new Y.eZ.PreviewActionView({
                container: '.container',
                content: this.contentMock,
                version: this.version,
                actionId: "preview",
                hint: "Test hint",
                label: "Test label",
                buttons: [
                    {option: "desktop"}, {option: "tablet"},
                    {option: "mobile"}, {option: "tv"},
                ],
                editPreview: this.editPreview,
            });
        },

        tearDown: function () {
            Y.Mock.expect(this.editPreview, {
                method: 'destroy'
            });
            Y.Mock.expect(this.editPreview, {
                method: 'removeTarget',
                args: [this.view]
            });
            this.view.destroy();
            delete this.view;
            delete this.editPreview;
            delete this.contentMock;
        },

        "Should set the button action view class name on the view container": function () {
            var container = this.view.get('container');

            Y.Mock.expect(this.editPreview, {
                method: 'set',
                args: [Y.Mock.Value.Any, Y.Mock.Value.Any]
            });
            Y.Mock.expect(this.editPreview, {
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

            Y.Mock.expect(this.editPreview, {
                method: 'set',
                callCount: 2,
                args: [Y.Mock.Value.String, Y.Mock.Value.Object],
                run: function (param, value) {
                    previewContent = value;
                }
            });
            Y.Mock.expect(this.editPreview, {
                method: 'get',
                callCount: 0
            });

            this.view.set('content', this.contentMock);
            Y.Assert.areSame(previewContent, this.contentMock, "editPreview should set correct content attribute");
            Y.Mock.verify(this.editPreview);
        },

        "Should set the version to the preview view": function () {
            var version = {};

            // make sure the initial config of the version attribute is taken
            // into account (effect of the lazyAdd: true on the attribute)
            Y.Mock.expect(this.editPreview, {
                method: 'set',
                args: ['version', this.version]
            });
            this.view.get('version');

            Y.Mock.expect(this.editPreview, {
                method: 'set',
                args: ['version', version]
            });

            Y.Mock.expect(this.editPreview, {
                method: 'get',
                callCount: 0
            });

            this.view.set('version', version);
            Y.Mock.verify(this.editPreview);
        },

        _showPreviewMode: function (mode) {
            var previewTrigger,
                previewShown = false,
                currentMode,
                that = this,
                container = this.view.get('container');

            Y.Mock.expect(this.editPreview, {
                method: 'set',
                args: ['currentModeId', Y.Mock.Value.String],
                run: function (option, value) {
                    currentMode = value;
                }
            });
            Y.Mock.expect(this.editPreview, {
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
                    Y.Mock.verify(this.editPreview);
                });
            });
            this.wait();
        },

        "Should show the 'desktop' preview": function () {
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

        "Should destroy editPreview when destroying itself": function () {
            Y.Mock.expect(this.editPreview, {
                method: 'removeTarget',
                args: [this.view]
            });
            Y.Mock.expect(this.editPreview, {
                method: 'destroy'
            });

            this.view.render();
            this.view.destroy();
            Y.Mock.verify(this.editPreview);
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
    Y.Test.Runner.add(buttonTest);
}, '', {requires: ['test', 'ez-previewactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});
