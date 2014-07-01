YUI.add('ez-buttonactionview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.ButtonActionViewTestCases, {
            setUp: function () {
                this.actionId = "test";
                this.hint = "Test hint";
                this.label = "Test label";
                this.disabled = false;
                this.view = new Y.eZ.ButtonActionView({
                    container: '.container',
                    actionId: this.actionId,
                    hint: this.hint,
                    label: this.label,
                    disabled: this.disabled,
                });

                this.templateVariablesCount = 4;
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Button Action View tests");
    Y.Test.Runner.add(viewTest);
}, '0.0.1', {requires: ['test', 'ez-buttonactionview', 'ez-genericbuttonactionview-tests']});
