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
