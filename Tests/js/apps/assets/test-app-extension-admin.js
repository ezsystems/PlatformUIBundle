YUI.add('ez-app-extension-admin', function (Y) {
    Y.namespace('eZ');

    console.log('LOADED');
    function AdminAppExtensionTest() {
    }

    AdminAppExtensionTest._called = 0;

    AdminAppExtensionTest.prototype.extend = function (app) {
        AdminAppExtensionTest._called++;
    };

    Y.eZ.AdminAppExtension = AdminAppExtensionTest;

});
