/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-templatebasedview-tests', function (Y) {
    var viewTest, partialTest;

    viewTest = new Y.Test.Case({
        name: "eZ Template based view tests",

        setUp: function () {
            var that = this;

            this.TestView = Y.Base.create('TestView', Y.eZ.TemplateBasedView, []);
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

    partialTest = new Y.Test.Case({
        name: "eZ Template based view registerPartial tests",

        init: function () {
            this.partialName = 'oneWayTicket';
            this.templateId = 'oneWayTicket-ez-template';
            this.templateId2 = 'back-ez-template';
            Y.Template.register(this.templateId, "One way ticket to hell");
            Y.Template.register(this.templateId2, "and back!");
        },

        destroy: function () {
            Y.Template.register(this.templateId, undefined);
            Y.Handlebars.registerPartial(this.partialId, undefined);
        },

        "Should register partial template": function () {
            Y.eZ.TemplateBasedView.registerPartial(this.partialId, this.templateId);

            Y.Assert.isNotUndefined(
                Y.Handlebars.partials[this.partialId],
                "The partial should have been registered"
            );
        },

        "Should not overwrite existing partial": function () {
            var partial;

            this["Should register partial template"]();
            partial = Y.Handlebars.partials[this.partialId];

            Y.eZ.TemplateBasedView.registerPartial(this.partialId, this.templateId2);

            Y.Assert.areSame(
                partial, Y.Handlebars.partials[this.partialId],
                "The partial should not be overwritten"
            );
        },

        "Should ignore non existent template": function () {
            var partial;

            this["Should register partial template"]();
            partial = Y.Handlebars.partials[this.partialId];

            Y.eZ.TemplateBasedView.registerPartial(this.partialId, "DoesNotExist");

            Y.Assert.areSame(
                partial, Y.Handlebars.partials[this.partialId],
                "The partial should not be overwritten"
            );
        }
    });


    Y.Test.Runner.setName("eZ Template Based view tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(partialTest);
}, '', {requires: ['test', 'ez-templatebasedview']});
