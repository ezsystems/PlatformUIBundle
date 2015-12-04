/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-previewactionview-tests', function (Y) {
    var devicePreviewTest, buttonTest, attributeSettersTest, destructorTest,
        defaultEditPreviewTest,
        Assert = Y.Assert;

    buttonTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            _should: {
                ignore: {
                    "Should fire an action once the action button is tapped": true,
                }
            },

            setUp: function () {
                this.editPreview = new Y.View();
                this.contentMock = new Y.Mock();

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

            "Should set the button action view class name on the view container": function () {
                var container = this.view.get('container');

                this.view.render();
                Assert.isTrue(
                    container.hasClass('ez-view-buttonactionview'),
                    "The container should have the view class name from the button action view"
                );
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
                delete this.editPreview;
                delete this.contentMock;
            },
        })
    );

    attributeSettersTest = new Y.Test.Case({
        name: "eZ Preview Action View attribute setters test",

        setUp: function () {
            this.editPreview = new Y.View();
            this.view = new Y.eZ.PreviewActionView({
                actionId: "preview",
                hint: "Test hint",
                label: "Test label",
                editPreview: this.editPreview,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.editPreview.destroy();
        },

        "Should set the content attribute on the preview view": function () {
            var content = {};

            this.view.set('content', content);
            Assert.areSame(
                content, this.editPreview.get('content'),
                "The editPreview should have received the content"
            );
        },

        "Should set languageCode attribute for the PreviewView": function () {
            var languageCode = 'fre-FR';

            this.view.set('languageCode', languageCode);
            Assert.areSame(
                languageCode, this.editPreview.get('languageCode'),
                "The editPreview should have received the languageCode"
            );
        },

        "Should set the version to the preview view": function () {
            var version = {};

            this.view.set('version', version);
            Assert.areSame(
                version, this.editPreview.get('version'),
                "The editPreview should have received the version"
            );
        },
    });

    devicePreviewTest = new Y.Test.Case({
        name: "eZ Preview Action View device preview test",

        setUp: function () {
            var Preview = Y.Base.create('previewView', Y.View, [], {
                    show: Y.bind(function (x) {
                        this.isHidden = false;
                    }, this),

                    isHidden: Y.bind(function () {
                        return this.isHidden;
                    }, this),
                });
            this.editPreview = new Preview();
            this.isHidden = true;

            this.version = {};
            this.view = new Y.eZ.PreviewActionView({
                container: '.container',
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
            this.view.destroy();
            this.editPreview.destroy();
        },

        _assertIsVisibleInMode: function (mode) {
            var container = this.view.get('container');

            Assert.isFalse(
                this.isHidden,
                "The preview should not be hidden"
            );
            Assert.areEqual(
                mode, this.editPreview.get('currentModeId'),
                "The preview should be in the correct mode"
            );
            Assert.areEqual(
                mode, container.one('.is-selected[data-action="preview"]').getAttribute('data-action-option'),
                "The corresponding button should be selected"
            );
            Assert.areEqual(
                1, container.all('.is-selected[data-action="preview"]').size(),
                "Only one button should be selected"
            );
        },

        _showPreviewMode: function (mode, mode2) {
            var previewTrigger,
                container = this.view.get('container');

            this.view.render();

            Assert.isTrue(
                container.all('.is-selected[data-action="preview"]').isEmpty(),
                "The preview buttons should NOT be highlighted"
            );

            previewTrigger = container.one('[data-action-option="' + mode + '"]');

            this.view.once('previewAction', this.next(function (e) {
                e.callback();
                this._assertIsVisibleInMode(mode);
                if ( mode2 ) {
                    this._showPreviewMode(mode2);
                }
            }, this));

            previewTrigger.simulateGesture('tap');
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

        "Should not show the preview in case of error": function () {
            var previewTrigger;

            this.view.render();

            previewTrigger = this.view.get('container').one('[data-action-option="mobile"]');

            this.view.once('previewAction', this.next(function (e) {
                e.callback(new Error());

                Assert.isTrue(this.isHidden, "The preview should stay hidden");
            }, this));

            previewTrigger.simulateGesture('tap');
            this.wait();
        },

        "Should update the preview if it's already visible": function () {
            var previewTrigger;

            this.isHidden = false;
            previewTrigger = this.view.get('container').one('[data-action-option="tablet"]');

            this.view.once('previewAction', function (e) {
                Assert.fail("The previewAction event should not be triggered");
            });

            previewTrigger.simulateGesture('tap', this.next(function () {
                this._assertIsVisibleInMode('tablet');
            }, this));
            this.wait();
        },

        "Should unselect the device button when the preview is hidden": function () {
            this.view.render();

            this.view.fire('editPreviewView:editPreviewHide');
            Assert.areEqual(
                0,
                this.view.get('container').all('.is-selected[data-action="preview"]').size(),
                "No device button should be selected"
            );
        }
    });

    destructorTest = new Y.Test.Case({
        name: "eZ Preview Action View destroy test",

        setUp: function () {
            this.editPreview = new Y.View();
            this.view = new Y.eZ.PreviewActionView({
                actionId: "preview",
                hint: "Test hint",
                label: "Test label",
                editPreview: this.editPreview,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.editPreview.destroy();
        },

        "Should destroy editPreview when destroying itself": function () {
            this.view.destroy();

            Assert.isTrue(
                this.editPreview.get('destroyed'),
                "The editPreview should be destructed"
            );
        },
    });

    defaultEditPreviewTest = new Y.Test.Case({
        name: "eZ Preview Action View default editPreview test",

        setUp: function () {
            Y.eZ.EditPreviewView = Y.Base.create('editPreview', Y.View, [], {});
            this.view = new Y.eZ.PreviewActionView();
        },

        tearDown: function () {
            this.view.destroy();
            delete Y.eZ.EditPreviewView;
        },

        "Should instantiate an eZ.EditPreviewView": function () {
            Assert.isInstanceOf(
                Y.eZ.EditPreviewView,
                this.view.get('editPreview')
            );
        },
    });

    Y.Test.Runner.setName("eZ Preview Action View tests");
    Y.Test.Runner.add(buttonTest);
    Y.Test.Runner.add(attributeSettersTest);
    Y.Test.Runner.add(devicePreviewTest);
    Y.Test.Runner.add(destructorTest);
    Y.Test.Runner.add(defaultEditPreviewTest);
}, '', {requires: ['test', 'view', 'ez-previewactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});
