YUI.add('editviewregister-tests', function (Y) {
    Y.namespace('eZ');

    Y.eZ.EditViewRegisterTest = {
        "Should autoregister": function () {
            var ViewType = this.viewType,
                viewKey = this.viewKey;

            try {
                Y.Assert.areSame(
                    ViewType,
                    Y.eZ.FieldEditView.getFieldEditView(viewKey),
                    "The constructor should be registered under " + viewKey + " key"
                );
            } catch (e) {
                Y.Assert.fail("The view is not registered under " + viewKey + " key");
            }
        }
    };
});