YUI.add('editview-tests', function (Y) {
    Y.namespace('eZ');

    var registerTest = {

        "Should autoregister": function () {
            var ViewType = this.viewType,
                viewKey = this.viewKey,
                viewName = new ViewType().constructor.NAME;

            console.log(viewKey, viewName);

            try {
                Y.Assert.areSame(
                    ViewType,
                    Y.eZ.FieldEditView.getFieldEditView(viewKey),
                    "The constructor of " + viewName + " should be registered under " + viewKey + " key"
                );
            } catch (e) {
                Y.Assert.fail(viewName + " is not registered under " + viewKey + " key");
            }
        }
    };

    Y.eZ.EditViewTest = Y.mix(Y.Test.Case, registerTest, false, undefined, 4, true);

});