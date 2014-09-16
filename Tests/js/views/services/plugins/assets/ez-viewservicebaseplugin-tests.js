YUI.add('ez-viewservicebaseplugin-tests', function (Y) {
    var tests,
        Assert = Y.Assert;


    tests = new Y.Test.Case({
        name: "eZ View Service Base Plugin tests",

        setUp: function () {
            this.plugin = new Y.eZ.Plugin.ViewServiceBase();
        },

        tearDown: function () {
            this.plugin.destroy();
            delete this.plugin;
        },

        _testMethodCallback: function (method) {
            var called = false,
                cb = function () {
                    called = true;
                };

            this.plugin[method](cb);
            Assert.isTrue(called, method + " should have call its callback");
        },

        "afterLoad should call its callback parameter": function () {
            this._testMethodCallback('afterLoad');
        },

        "parallelLoad should call its callback parameter": function () {
            this._testMethodCallback('parallelLoad');
        },

        "getViewParameters should return an empty object": function () {
            var params = this.plugin.getViewParameters();

            Assert.isObject(params, "getViewParameters should return an object");
            Assert.areEqual(
                0, Y.Object.keys(params).length,
                "getViewParameters should return an empty object"
            );
        },

        'setNextViewServiceParameters() should return the plugin itself': function () {
            var service = new Y.eZ.ViewService(),
                returnVal = this.plugin.setNextViewServiceParameters(service);

            Assert.areSame(service, returnVal, 'setNextViewServiceParameters() should return the new active service');
        }
    });

    Y.Test.Runner.setName("eZ View Service Base Plugin tests");
    Y.Test.Runner.add(tests);
}, '0.0.1', {requires: ['test', 'ez-viewservicebaseplugin', 'ez-viewservice']});
