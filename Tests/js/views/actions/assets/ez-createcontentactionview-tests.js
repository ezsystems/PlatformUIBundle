/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-createcontentactionview-tests', function (Y) {
    var viewTest, eventTest, renderTest, hideTest, disabledTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = 'createContent';
                this.label = 'Create Content test label';
                this.hint = 'an hint ?';
                this.disabled = false;
                this.templateVariablesCount = 4;
                this.selectorMock = new Mock();
                this.contentTypeMock = new Mock();

                Mock.expect(this.selectorMock, {
                    method: 'addTarget',
                    args: [Mock.Value.Object],
                });
                Mock.expect(this.selectorMock, {
                    method: 'destroy',
                });
                Mock.expect(this.contentTypeMock, {
                    method: 'get',
                    args: ['isContainer'],
                    returns: true
                });

                this.view = new Y.eZ.CreateContentActionView({
                    container: '.container',
                    actionId: this.actionId,
                    label: this.label,
                    hint: this.hint,
                    disabled: this.disabled,
                    contentTypeSelectorView: this.selectorMock,
                    contentType: this.contentTypeMock
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },
        })
    );

    eventTest = new Y.Test.Case({
        setUp: function () {
            this.selectorMock = new Mock();
            this.contentTypeMock = new Mock();

            Mock.expect(this.selectorMock, {
                method: 'addTarget',
                args: [Mock.Value.Object],
            });
            Mock.expect(this.selectorMock, {
                method: 'destroy',
            });
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer']
            });

            this.view = new Y.eZ.CreateContentActionView({
                container: '.container',
                actionId: 'createContent',
                label: "Create",
                disabled: false,
                contentTypeSelectorView: this.selectorMock,
                contentType: this.contentTypeMock
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        'Should expand the view when receiving the contentCreateAction event': function () {
            this.view.render();
            this.view.set('expanded', false);
            this.view.fire('createContentAction');

            Assert.isTrue(this.view.get('expanded'), "The expanded state should be true");
        },

        'Should hide the selector when receiving the contentCreateAction event': function () {
            this.view.render();
            this.view.set('expanded', true);
            this.view.fire('createContentAction');

            Assert.isFalse(this.view.get('expanded'), "The expanded state should be false");
        },
    });

    renderTest = new Y.Test.Case({
        setUp: function () {
            this.selectorMock = new Mock();
            this.contentTypeMock = new Mock();

            Mock.expect(this.selectorMock, {
                method: 'addTarget',
                args: [Mock.Value.Object],
            });
            Mock.expect(this.selectorMock, {
                method: 'destroy',
            });
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer']
            });

            this.view = new Y.eZ.CreateContentActionView({
                container: '.container',
                actionId: 'createContent',
                label: "Create",
                disabled: false,
                contentTypeSelectorView: this.selectorMock,
                contentType: this.contentTypeMock
            });
        },

        tearDown: function () {
            this.view.get('container').setHTML('');
            this.view.destroy();
            delete this.view;
        },

        "Should render the content type selector when setting the groups": function () {
            var c = this.view.get('container'),
                groups = {};

            Mock.expect(this.selectorMock, {
                method: 'render',
                returns: this.selectorMock,
            });
            Mock.expect(this.selectorMock, {
                method: 'get',
                args: ['container'],
                returns: Y.Node.create('<div class="the-rendered-selector"></div>'),
            });
            Mock.expect(this.selectorMock, {
                method: 'set',
                args: ['contentTypeGroups', groups],
            });
            this.view.render();
            this.view.set('contentTypeGroups', groups);

            Assert.isTrue(
                c.hasClass('is-contenttypeselector-loaded'),
                "The view container should get the class 'is-contenttypeselector-loaded'"
            );
            Assert.isObject(
                c.one('.ez-contenttype-selector .the-rendered-selector'),
                "The content type selector should be rendered and added to the DOM"
            );
        },
    });

    hideTest = new Y.Test.Case({
        setUp: function () {
            this.selectorMock = new Mock();
            this.contentTypeMock = new Mock();

            Mock.expect(this.selectorMock, {
                method: 'addTarget',
                args: [Mock.Value.Object],
            });
            Mock.expect(this.selectorMock, {
                method: 'destroy',
            });
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer']
            });

            this.view = new Y.eZ.CreateContentActionView({
                container: '.container',
                actionId: 'createContent',
                label: "Create",
                disabled: false,
                contentTypeSelectorView: this.selectorMock,
                contentType: this.contentTypeMock
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should hide the selector when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);
            Y.one('.click-somewhere').simulate('click');

            Assert.isFalse(this.view.get('expanded'), "The view should be hidden");
        },

        "Should leave the view when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);
            this.view.set('expanded', false);
            Y.one('.click-somewhere').simulate('click');

            Assert.isFalse(this.view.get('expanded'), "The view should be hidden");
        }
    });

    disabledTest = new Y.Test.Case({
        setUp: function () {
            this.selectorMock = new Mock();
            this.contentTypeMock = new Mock();

            Mock.expect(this.selectorMock, {
                method: 'addTarget',
                args: [Mock.Value.Object],
            });
            Mock.expect(this.selectorMock, {
                method: 'destroy',
            });
        },

        tearDown: function () {
            this.view.get('container').setHTML('');
            this.view.destroy();
            delete this.view;
        },

        "Should disable button when content type of content is not container": function () {
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: false
            });

            this.view = new Y.eZ.CreateContentActionView({
                container: '.container',
                actionId: 'createContent',
                label: "Create",
                disabled: false,
                contentTypeSelectorView: this.selectorMock,
                contentType: this.contentTypeMock
            });

            Assert.isTrue(
                this.view.get('disabled'),
                "Create content button should be disabled"
            );
        },

        "Should not disable button when content type of content is container": function () {
            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['isContainer'],
                returns: true
            });

            this.view = new Y.eZ.CreateContentActionView({
                container: '.container',
                actionId: 'createContent',
                label: "Create",
                disabled: false,
                contentTypeSelectorView: this.selectorMock,
                contentType: this.contentTypeMock
            });

            Assert.isFalse(
                this.view.get('disabled'),
                "Create content button should be disabled"
            );
        },
    });

    Y.Test.Runner.setName("eZ Create Content Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(eventTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(hideTest);
    Y.Test.Runner.add(disabledTest);
}, '', {requires: ['test', 'ez-createcontentactionview', 'ez-genericbuttonactionview-tests', 'node-event-simulate']});
