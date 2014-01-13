YUI.add('ez-templatebasedview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Template based view tests",

        setUp: function () {
            this.TestView = Y.Base.create('TestView', Y.eZ.TemplateBasedView, [], {}, {
                ATTRS: {
                    notAView: {},
                    subviewSimple: {},
                    subviewCallback: {}
                }
            });
            this.TestViewNoTemplate = Y.Base.create('TestViewNoTemplate', Y.eZ.TemplateBasedView, []);
        },

        "Should find the template": function () {
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

        "activeCallback callback should call the active call for each subview": function () {
            var view = new this.TestView(),
                activeCallbackCalled = false,
                ViewCallback = Y.Base.create('ViewCallback', Y.eZ.TemplateBasedView, [], {
                    activeCallback: function () {
                        activeCallbackCalled = true;
                    }
                });

            view.set('notAView', 42);
            view.set('subviewSimple', new Y.View());
            view.set('subviewCallback', new ViewCallback());

            view.activeCallback();
            Y.Assert.isTrue(
                activeCallbackCalled,
                "The active callback of the subview should have been called"
            );
        }
    });

    Y.Test.Runner.setName("eZ Template Based view tests");
    Y.Test.Runner.add(viewTest);
}, '0.0.1', {requires: ['test', 'ez-templatebasedview']});
