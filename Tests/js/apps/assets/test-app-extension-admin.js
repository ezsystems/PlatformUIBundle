/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-app-extension-admin', function (Y) {
    Y.namespace('eZ');

    function AdminAppExtensionTest() {
    }

    AdminAppExtensionTest._called = 0;

    AdminAppExtensionTest.prototype.extend = function (app) {
        AdminAppExtensionTest._called++;
    };

    Y.eZ.AdminAppExtension = AdminAppExtensionTest;

});
