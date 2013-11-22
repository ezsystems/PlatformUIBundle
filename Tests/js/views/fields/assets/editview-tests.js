YUI.add('editview-tests', function (Y) {
    Y.namespace('eZ');

    Y.eZ.EditViewRegisterTest = new Y.Test.Case({
        name: "Generic eZ Edit View registration test",

        "Should autoregister": function () {
            var ViewType = this.viewType,
                viewKey = this.viewKey,
                viewName = new ViewType().constructor.NAME;

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
    });

});