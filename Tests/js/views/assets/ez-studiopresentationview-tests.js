/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopresentationview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Studio Presentation View test",

        setUp: function () {
            this.view = new Y.eZ.StudioPresentationView();
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
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },
    });

    Y.Test.Runner.setName("eZ Studio Presentation View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-studiopresentationview']});
