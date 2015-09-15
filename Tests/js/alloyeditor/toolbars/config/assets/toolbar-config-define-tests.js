/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('toolbar-config-define-tests', function (Y) {
    var Assert = Y.Assert;

    Y.namespace('eZ.Test');

    // Define test methods for AlloyEditor's toolbars defintion.
    // To use those methods, the following properties must be defined:
    // - toolbarConfig : the toolbar config to test
    // - toolbarConfigName : the expected name of the toolbar config
    // - methods : an object containing a reference to the expected test,
    // setPosition and getArrowBoxClasses methods
    Y.eZ.Test.ToolbarConfigDefineTest = {
        "Should define the toolbar configuration": function () {
            Assert.isObject(
                this.toolbarConfig,
                "The " + this.toolbarConfigName + " toolbar configuration should be defined"
            );
        },

        "Should have a correct name": function () {
            Assert.areEqual(
                this.toolbarConfigName, this.toolbarConfig.name,
                "The name of the toolbar configuration should be '" + this.toolbarConfigName + "'"
            );
        },

        _testMethod: function (methodName) {
            Assert.areSame(
                this.methods[methodName],
                this.toolbarConfig[methodName],
                methodName + " has not the expected value on " + this.toolbarConfigName
            );
        },

        "Should have the correct `test` method": function () {
            this._testMethod('test');
        },

        "Should have the correct `setPosition` method": function () {
            this._testMethod('setPosition');
        },

        "Should have the correct `getArrowBoxClasses` method": function () {
            this._testMethod('getArrowBoxClasses');
        },
    };
});
