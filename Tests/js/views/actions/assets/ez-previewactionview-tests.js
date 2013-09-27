YUI.add('ez-previewactionview-tests', function (Y) {

    var container = Y.one('.container');

    viewTest = new Y.Test.Case({
        name: "eZ Preview Action View test",

        setUp: function () {

            this.view = new Y.eZ.PreviewActionView({
                container: container,
                actionId: "test",
                hint: "Test hint",
                label: "Test label",
                buttons: [{
                    option : "desktop"
                }, {
                    option : "tablet"
                }, {
                    option : "mobile"
                }]
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
                Y.Assert.areEqual(5, Y.Object.keys(variables).length, "The template should receive 4 variables");
                Y.Assert.isArray(variables.buttons, "buttons should be available in the template and should be an array");
                Y.Assert.isBoolean(variables.disabled, "disabled should be available in the template and should be boolean");
                Y.Assert.isString(variables.actionId, "actionId should be available in the template and should be a string");
                Y.Assert.isString(variables.label, "label should be available in the template and should be a string");
                Y.Assert.isString(variables.hint, "hint should be available in the template and should be a string");

                return  '<button></button>';
            };
            this.view.render();
        }
    });

    Y.Test.Runner.setName("eZ Preview Action View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'ez-previewactionview']});
