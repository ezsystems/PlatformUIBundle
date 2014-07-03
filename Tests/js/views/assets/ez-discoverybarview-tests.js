/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarview-tests', function (Y) {
    var viewContainer = Y.one('.container'),
        viewTest;

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
    });

    Y.Test.Runner.setName("eZ Discovery Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-discoverybarview']});
