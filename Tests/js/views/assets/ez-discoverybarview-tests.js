/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarview-tests', function (Y) {
    var viewContainer = Y.one('.container'),
        viewTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Discovery Bar View test",

        setUp: function () {
            this.view = new Y.eZ.DiscoveryBarView({
                container: viewContainer,
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
            Y.Assert.areNotEqual(
                "", viewContainer.getHTML(),
                "View container should contain the result of the this.view"
            );
        },

        "Should add the discovery bar view class on the container": function () {
            var container = this.view.get('container');

            this.view.render();
            Y.Assert.isTrue(
                container.hasClass('ez-view-discoverybarview'),
                "The view container should have the class 'ez-view-discoverybarview'"
            );
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

        "Should contain the action Views in the actionsList attribute": function () {
            var actionsList = this.view.get('actionsList');

            Assert.areSame(
                3,
                actionsList.length,
                "Action list should contain 3 items"
            );

            Y.Array.each(actionsList, Y.bind(function (buttonActionView) {
                Assert.isInstanceOf(
                    Y.eZ.ButtonActionView,
                    buttonActionView,
                    "Buttons should be instances of Y.eZ.ButtonActionView"
                );

                if (buttonActionView.get('actionId') === "minimizeDiscoveryBar") {
                    this._testButtonAction(buttonActionView, false, "Minimize", 1000);
                } else if (buttonActionView.get('actionId') === "tree") {
                    this._testButtonAction(buttonActionView, false, "Content tree", 800);
                } else if (buttonActionView.get('actionId') === "viewTrash") {
                    this._testButtonAction(buttonActionView, false, "Trash", 600);
                } else {
                    Assert.fail("Unknown action id: " + buttonActionView.get('actionId'));
                }
            }, this));
        },
    });

    Y.Test.Runner.setName("eZ Discovery Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-discoverybarview']});
