/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashbarview-tests', function (Y) {
    var Assert = Y.Assert,
        viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Trash Bar View test",

        setUp: function () {
            this.view = new Y.eZ.TrashBarView({});
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testButtonAction: function (buttonActionView, disabled, label, priority) {
            Assert.areSame(
                disabled,
                buttonActionView.get('disabled'),
                "Disabled of the button is not valid"
            );

            Assert.areSame(
                label,
                buttonActionView.get('label'),
                "Label of button is not valid"
            );

            Assert.areSame(
                priority,
                buttonActionView.get('priority'),
                "Label of button is not valid"
            );
        },

        "Should provide action view buttons": function () {
            var actionsList = this.view.get('actionsList');

            Assert.areSame(
                3,
                actionsList.length,
                "The action list should contains two buttons"
            );

            Y.Array.each(actionsList, Y.bind(function (buttonActionView) {
                Assert.isInstanceOf(
                    Y.eZ.ButtonActionView,
                    buttonActionView,
                    "Buttons should be instances of Y.eZ.ButtonActionView"
                );

                if (buttonActionView.get('actionId') === "minimizeTrashBar") {
                    this._testButtonAction(buttonActionView, false, "Minimize", 1000);
                } else if (buttonActionView.get('actionId') === "restoreTrashItems") {
                    this._testButtonAction(buttonActionView, true, "Restore Selected", 800);
                } else if (buttonActionView.get('actionId') === "emptyTrash") {
                    this._testButtonAction(buttonActionView, false, "Empty the Trash", 10);
                } else {
                    Assert.fail("Unknown action id: " + buttonActionView.get('actionId'));
                }
            }, this));
        },
    });

    Y.Test.Runner.setName("eZ Trash Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-trashbarview']});
