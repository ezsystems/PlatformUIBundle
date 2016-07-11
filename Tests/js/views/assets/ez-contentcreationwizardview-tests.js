/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardview-tests', function (Y) {
    var renderTest, closeTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View render test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },
    });

    closeTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View close button test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the `contentCreationWizardClose` event": function () {
            var container = this.view.get('container');

            this.view.on('contentCreationWizardClose', this.next(function () {}, this));
            container.one('.ez-contentcreationwizard-close').simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Content Creation Wizard View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(closeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contentcreationwizardview']});
