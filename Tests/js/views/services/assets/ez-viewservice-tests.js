YUI.add('ez-viewservice-tests', function (Y) {
    var test;

    test = new Y.Test.Case({
        name: "eZ View Service tests",

        "load should call the callback": function () {
            var service = new Y.eZ.ViewService(),
                cbCalled = false,
                cb = function (param) {
                    cbCalled = true;
                    Y.Assert.areSame(
                        service, param,
                        "The service itself should available in the parameter of the callback"
                    );
                };

            service.load(cb);
            Y.Assert.isTrue(cbCalled, "The load callback should have been called");
        },

        "getViewParameters should return an empty object": function () {
            var service = new Y.eZ.ViewService(),
                params = service.getViewParameters();

            Y.Assert.isObject(params, "getViewParameters should return an object");
            Y.Assert.isTrue(Y.Object.isEmpty(params), "getViewParameters should return an empty object");
        },

        "An error should fire an 'error' event": function () {
            var errorMsg = 'This is an error',
                errorCalled = false,
                TestService = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    load: function (cb) {
                        this._error(errorMsg);
                        cb(this);
                    }
                }),
                service;

            service = new TestService();
            service.on('error', function (e) {
                errorCalled = true;
                Y.Assert.areSame(
                    errorMsg, e.message,
                    "The error event facade should contain the error message"
                );
            });
            service.load(function() {});

            Y.Assert.isTrue(errorCalled, "An error event should have been fired");
        }
    });

    Y.Test.Runner.setName("eZ View Service tests");
    Y.Test.Runner.add(test);

}, '0.0.1', {requires: ['test', 'ez-viewservice']});
