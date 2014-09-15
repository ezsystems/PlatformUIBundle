/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-templatebasedview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Template based view tests",

        setUp: function () {
            var that = this;

            this.TestView = Y.Base.create('TestView', Y.eZ.TemplateBasedView, [], {}, {
                ATTRS: {
                    notAView: {},
                    subviewSimple: {},
                    subviewCallback: {}
                }
            });
            this.TestViewNoTemplate = Y.Base.create('TestViewNoTemplate', Y.eZ.TemplateBasedView, []);
            this.TestViewTemplateRegistry = Y.Base.create('TestViewTemplateRegistry', Y.eZ.TemplateBasedView, []);
            this.templateRegistryResult = "You've got here in your pocket";
            this.templateRegistry = function () { return that.templateRegistryResult; };
            Y.Template.register('testviewtemplateregistry-ez-template', this.templateRegistry);
        },

        tearDown: function () {
            Y.Template.register('testviewtemplateregistry-ez-template', undefined);
        },

        "Should find the template in the template registry": function () {
            var view = new this.TestViewTemplateRegistry();

            Y.Assert.isFunction(view.template, "The template property should be function");
            Y.Assert.areEqual(
                this.templateRegistryResult, view.template(),
                "The template should generate the content of the template in the registry"
            );
        },

        "Should use the template in the template registry in priority": function () {
            Y.one('body').append(
                '<script type="text/x-handlebars-template" id="testviewtemplateregistry-ez-template">Not used</script>'
            );
            this["Should find the template in the template registry"]();
        },

        "Should find the template in the DOM": function () {
            var view = new this.TestView();

            Y.Assert.isFunction(view.template, "The template property should be function");
            Y.Assert.areEqual(
                Y.one('#testview-ez-template').getHTML(), view.template(),
                "The template should generate the content of the #testview-ez-template element"
            );
        },

        "Should generate a template which returns an empty string is the template element is not found": function () {
            var view = new this.TestViewNoTemplate();

            Y.Assert.isFunction(view.template, "The template property should be function");
            Y.Assert.areEqual(
                "", view.template(),
                "The template should generate the content of the #testview-ez-template element"
            );
        },

        "containerTemplate property should include a class based on the view name": function () {
            var view = new this.TestView();

            Y.Assert.isTrue(
                Y.Node.create(view.containerTemplate).hasClass("ez-view-testview"),
                "A node created with containerTemplate property should have the class ez-view-testview"
            );
        },
    });

    Y.Test.Runner.setName("eZ Template Based view tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-templatebasedview']});
