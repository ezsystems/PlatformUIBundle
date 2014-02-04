YUI.add('ez-errorview-tests', function (Y) {
    var container = Y.one('.container'),
        viewTest,
        testErrorText = "Not Found",
        testRetryAction = {
            run: function () {},
            args: [],
            context: null
        },
        IS_HIDDEN_CLASS = 'is-hidden';

    viewTest = new Y.Test.Case({
        name: "eZ Error View test",

        setUp: function () {
            this.view = new Y.eZ.ErrorView({
                container: container,
                retryAction: testRetryAction,
                additionalInfo: {
                    errorText: testErrorText
                }
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
            Y.Assert.areNotEqual("", container.getHTML(), "View container should contain the result of the this.view");
        },

        "Test available variable in template": function () {
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(1, Y.Object.keys(variables).length, "The template should receive 1 variable");
                Y.Assert.isObject(variables.additionalInfo, "additionalInfo should be available in the template and should be an object");

                return "";
            };
            this.view.render();
        },

        "Should fire the 'closeApp' event when tapping 'close' link": function () {
            var closeFired = false, that = this;

            this.view.render();

            this.view.on('closeApp', function (e) {
                closeFired = true;
            });

            Y.one('.ez-close-app').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(closeFired, "The close event should have been fired");
                });
            });
            this.wait();
        },

        "Should fire the 'retry' event when tapping 'retry' link": function () {
            var retryFired = false, that = this;

            this.view.render();

            this.view.on('retryAction', function (retryAction) {
                Y.Assert.areSame(retryAction.run, testRetryAction.run);
                Y.Assert.areSame(retryAction.args, testRetryAction.args);
                Y.Assert.areSame(retryAction.context, testRetryAction.context);
                retryFired = true;
            });

            Y.one('.ez-retry').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(retryFired, "The retry event should have been fired");
                });
            });
            this.wait();
        },

        "Should fire a close event when 'escape' hotkey is pressed": function () {
            var closeFired = false;

            this.view.on('closeApp', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-error-dialog').simulate("keyup", { charCode: 27 }); // Sending "escape" key code
            Y.assert(closeFired, "The close event should have been fired");
        },

        "Should NOT fire a close event when any hotkey other than 'escape' is pressed": function () {
            var closeFired = false;

            this.view.on('closeApp', function (e) {
                closeFired = true;
            });

            this.view.render();
            container.one('.ez-error-dialog').simulate("keyup", { charCode: 28 }); // Sending some other key code
            Y.assert(!closeFired, "The close event should NOT have been fired");
        },

        "Should focus on the content element using special method": function () {
            var focused = false;
            this.view.render();

            container.one('.ez-error-dialog').on('focus', function () {
                focused = true;
            });

            this.view.set('active', true);

            Y.assert(focused, "Main content node of the view should get the focus");
        },

        "Should hide itself when 'hide' method is called": function () {
            this.view.render();

            Y.assert(
                !this.view.get('container').hasClass(IS_HIDDEN_CLASS),
                "The view should not be hidden after rendering"
            );

            this.view.hide();

            Y.assert(
                this.view.get('container').hasClass(IS_HIDDEN_CLASS),
                "The view should have been hidden"
            );
        }

    });

    Y.Test.Runner.setName("eZ Error View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-errorview']});
