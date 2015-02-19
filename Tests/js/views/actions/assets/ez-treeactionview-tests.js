/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-treeactionview-tests', function (Y) {
    var buttonTest, viewTest, treeTest, treeEventTest,
        Assert = Y.Assert;

    buttonTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = "tree";
                this.hint = "Cherry tree";
                this.label = "Tree";
                this.disabled = false;
                this.treeView = new Y.View();

                this.view = new Y.eZ.TreeActionView({
                    container: '.container',
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                    treeView: this.treeView,
                });

                this.templateVariablesCount = 4;
            },

            tearDown: function () {
                this.view.destroy();
                this.view.get('container').empty();
                this.treeView.destroy();
                delete this.view;
                delete this.treeView;
            },

            "Should not render several times": function () {
                var templateCount = 0,
                    origTpl;

                origTpl = this.view.template;
                this.view.template = function () {
                    templateCount++;
                    return origTpl.apply(this, arguments);
                };
                this.view.render();
                this.view.render();
                Assert.areEqual(
                    1,
                    templateCount,
                    "render should not render a previously rendered view"
                );
            },

            "Should add the buttonactionview class on the container": function () {
                this["Test render"]();

                Assert.isTrue(
                    this.view.get('container').hasClass('ez-view-buttonactionview'),
                    "The container should get the button action view class"
                );
            },
        })
    );

    viewTest = new Y.Test.Case({
        name: "eZ Tree Action View test",

        setUp: function () {
            this.treeView = new Y.View();
            this.view = new Y.eZ.TreeActionView({
                container: '.container',
                actionId: "tree",
                hint: "Fool's Garden",
                label: "Lemon tree",
                treeView: this.treeView,
            });
        },

        "Should toggle the expanded parameters when the treeAction event is fired": function () {
            this.view.render();
            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should be false by default"
            );

            this.view.fire('treeAction');
            Assert.isTrue(
                this.view.get('expanded'),
                "The `expanded` attribute should be true"
            );

            this.view.fire('treeAction');
            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should be false"
            );
        },

        "Should set expanded to false when clicking outside of the view": function () {
            this.view.render();
            this.view.set('expanded', true);

            Y.one('#external-element').simulate('click');

            Assert.isFalse(
                this.view.get('expanded'),
                "The `expanded` attribute should have been set to false"
            );
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').empty();
            this.treeView.destroy();
            delete this.view;
            delete this.treeView;
        },
    });


    treeTest = new Y.Test.Case({
        name: "eZ Tree Action View tree attribute tests",

        setUp: function () {
            this.treeView = new Y.View();
            this.view = new Y.eZ.TreeActionView({
                container: '.container',
                actionId: "tree",
                hint: "Fool's Garden",
                label: "Lemon tree",
                treeView: this.treeView,
            });
        },

        tearDown: function () {
            this.view.destroy();
            this.treeView.destroy();
            delete this.view;
            delete this.treeView;
        },

        "Should pass the tree to the treeView": function () {
            var tree = {};

            this.view.set('tree', tree);
            Assert.areSame(
                tree, this.treeView.get('tree'),
                "The tree object should be stored in the treeView"
            );
        },
    });

    treeEventTest = new Y.Test.Case({
        name: "eZ Tree Action View tree event tests",

        setUp: function () {
            this.treeView = new Y.View();
            this.view = new Y.eZ.TreeActionView({
                container: '.container',
                actionId: "tree",
                hint: "Fool's Garden",
                label: "Lemon tree",
                treeView: this.treeView,
            });
            this.treeView.addTarget(this.view);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            this.treeView.destroy();
            delete this.view;
            delete this.treeView;
        },

        "Should unexpand on treeNavigate event": function () {
            var treeNavigateEvt = false;

            this.view.set('expanded', true);

            this.view.on('*:treeNavigate', function (e) {
                treeNavigateEvt = true;
                Assert.isFalse(
                    !!e.prevented,
                    "The treeNavigate event should not be prevented"
                );
                Assert.isFalse(
                    this.get('expanded'),
                    "The tree should be unexpanded"
                );
            });

            this.treeView.fire('treeNavigate');
            Assert.isTrue(
                treeNavigateEvt,
                "The tree navigate event should bubble to the view"
            );
        },
    });

    Y.Test.Runner.setName("eZ Tree Action View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(treeTest);
    Y.Test.Runner.add(buttonTest);
    Y.Test.Runner.add(treeEventTest);
}, '', {
    requires: [
        'test', 'node-event-simulate', 'ez-treeactionview',
        'ez-genericbuttonactionview-tests', 'tree', 'tree-selectable',
        'tree-openable', 'tree-lazy'
    ]
});
