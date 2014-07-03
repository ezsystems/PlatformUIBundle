/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('editviewregister-tests', function (Y) {
    Y.namespace('eZ');

    Y.eZ.EditViewRegisterTest = {
        "Should autoregister": function () {
            var ViewType = this.viewType,
                viewKey = this.viewKey,
                viewName = ViewType.NAME;

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
});