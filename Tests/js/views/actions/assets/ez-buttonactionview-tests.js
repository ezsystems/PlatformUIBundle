/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-buttonactionview-tests', function (Y) {
    var viewTest, disableTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = "test";
                this.hint = "Test hint";
                this.label = "Test label";
                this.disabled = false;
                this.view = new Y.eZ.ButtonActionView({
                    container: '.container',
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                });

                this.templateVariablesCount = 4;
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    disableTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            name: "eZ ButtonActionView disabled tests",

            setUp: function () {
                this.actionId = "test";
                this.hint = "Test hint";
                this.label = "Test label";
                this.disabled = true;
                this.view = new Y.eZ.ButtonActionView({
                    container: '.container',
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                });

                this.templateVariablesCount = 4;
            },

            _should: {
                fail: {
                    // when disabled, the event should not be fired
                    "Should fire an action once the action button is tapped": true,
                },
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );


    Y.Test.Runner.setName("eZ Button Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(disableTest);
}, '', {requires: ['test', 'ez-buttonactionview', 'ez-genericbuttonactionview-tests']});
