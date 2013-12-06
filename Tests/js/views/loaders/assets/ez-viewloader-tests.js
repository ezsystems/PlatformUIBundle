YUI.add('ez-viewloader-tests', function (Y) {
    var vlTest;

    vlTest = new Y.Test.Case({
        name: "eZ View Loader tests",

        "load should call the callback": function () {
            var loader = new Y.eZ.ViewLoader(),
                cbCalled = false,
                cb = function () {
                    cbCalled = true;
                };

            loader.load(cb);
            Y.Assert.isTrue(cbCalled, "The load callback should have been called");
        },

        "response object should get a 'variables' entry": function () {
            var result = {
                    album: "Battle Born"
                },
                response = {},
                TestLoader = Y.Base.create('testLoader', Y.eZ.ViewLoader, [], {
                    load: function (cb) {
                        this._setResponseVariables(result);
                        cb();
                    }
                }),
                loader;

            loader = new TestLoader({'response': response});
            loader.load(function() {});

            Y.Assert.areSame(
                loader.get('response').variables.album, result.album,
                "The response variable property should be filled with the result of load"
            );
        }
    });

    Y.Test.Runner.setName("eZ View Loader tests");
    Y.Test.Runner.add(vlTest);

}, '0.0.1', {requires: ['test', 'ez-viewloader']});
