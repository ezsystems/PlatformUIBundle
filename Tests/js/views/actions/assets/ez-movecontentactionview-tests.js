/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-movecontentactionview-tests', function (Y) {
    var viewTest, disabledTest,
        Mock = Y.Mock, Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = 'moveContent';
                this.label = 'Move Content test label';
                this.hint = 'an hint ?';
                this.disabled = false;
                this.templateVariablesCount = 4;
                this.locationMock = new Mock();

                Mock.expect(this.locationMock, {
                    method: 'get',
                    args: ['depth'],
                    returns: 3
                });

                this.view = new Y.eZ.MoveContentActionView({
                    container: '.container',
                    actionId: this.actionId,
                    label: this.label,
                    hint: this.hint,
                    disabled: this.disabled,
                    location: this.locationMock,
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },
        })
    );

    disabledTest = new Y.Test.Case({
        setUp: function () {
            this.actionId = 'moveContent';
            this.label = 'Move Content test label';
            this.hint = 'an hint ?';
            this.disabled = false;
            this.templateVariablesCount = 4;
            this.locationMock = new Mock();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should disable button when location's depth is equal to 1": function () {
            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['depth'],
                returns: 1
            });

            this.view = new Y.eZ.MoveContentActionView({
                container: '.container',
                actionId: this.actionId,
                label: this.label,
                hint: this.hint,
                disabled: this.disabled,
                location: this.locationMock,
            });

            Assert.isTrue(
                this.view.get('disabled'),
                "Move content button should be disabled"
            );
        },

        "Should not disable button when location's depth is not equal to 1": function () {
            Mock.expect(this.locationMock, {
                method: 'get',
                args: ['depth'],
                returns: 2
            });

            this.view = new Y.eZ.MoveContentActionView({
                container: '.container',
                actionId: this.actionId,
                label: this.label,
                hint: this.hint,
                disabled: this.disabled,
                location: this.locationMock,
            });

            Assert.isFalse(
                this.view.get('disabled'),
                "Move content button should be disabled"
            );
        },
    });

    Y.Test.Runner.setName("eZ Move Content Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(disabledTest);
}, '', {requires: ['test', 'ez-movecontentactionview', 'ez-genericbuttonactionview-tests']});
