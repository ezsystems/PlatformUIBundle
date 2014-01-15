YUI.add('ez-buttonactionview-tests', function (Y) {
    var container = Y.one('.container'),
        viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Button Action View test",

        setUp: function () {
            this.view = new Y.eZ.ButtonActionView({
                container: container,
                actionId: "test",
                hint: "Test hint",
                label: "Test label"
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
                Y.Assert.areEqual(4, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Y.Assert.isBoolean(variables.disabled, "disabled should be available in the template and should be boolean");
                Y.Assert.isString(variables.actionId, "actionId should be available in the template and should be a string");
                Y.Assert.isString(variables.label, "label should be available in the template and should be a string");
                Y.Assert.isString(variables.hint, "hint should be available in the template and should be a string");

                return  '<button></button>';
            };
            this.view.render();
        },

        "Should fire an action once the action button is tapped": function () {
            var that = this,
                actionFired = false;

            // 'testAction' is composed of actionId + 'Action'
            this.view.on('testAction', function (e) {
                actionFired = true;
                Y.Assert.areSame(
                    that.view.get('content'), e.content,
                    "The event facade object should provide the content"
                );
            });

            this.view.render();

            this.view.get('container').one('[data-action="test"]').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(actionFired, "Action event should have been fired");
                });
            });
            this.wait();
        }

    });

    Y.Test.Runner.setName("eZ Button Action View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-buttonactionview']});
