/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-viewservice-tests', function (Y) {
    var test, pluginViewParamTests, pluginLoadTests,
        Assert = Y.Assert;

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

        "setNextViewServiceParameters() should return the provided param": function () {
            var service = new Y.eZ.ViewService(),
                param = 'test';

            Y.Assert.areEqual(
                param,
                service.setNextViewServiceParameters(param),
                'The setNextViewServiceParameters() method should return provided param'
            );
        },

        "setNextViewServiceParameters() should spread the provided param to the view service plugins": function () {
            var pluginMethodCalled = false,
                plugin = Y.Base.create('plugin1', Y.eZ.Plugin.ViewServiceBase, [], {
                    setNextViewServiceParameters: function (service) {
                        pluginMethodCalled = true;
                        Y.Assert.areEqual(
                            param,
                            service,
                            'The new active service should be passed to the plugin setNextViewServiceParameters method'
                        );
                    }
                }, {NS: 'plugin1'}),
                plugins = [plugin],
                service,
                param = 'test';

            service = new Y.eZ.ViewService({plugins: plugins});
            service.setNextViewServiceParameters(param);
            Y.Assert.isTrue(pluginMethodCalled, 'Plugin setNextViewServiceParameters() method should be called');
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

    pluginViewParamTests = new Y.Test.Case({
        name: "eZ View Service getViewParameters with plugins tests",

        setUp: function () {
            var serviceParams = {'service': 1, 'param': {}},
                plugin1Params = {'plugin1': "plugin1"},
                plugin2Params = {'plugin2': "plugin2"},
                Service = Y.Base.create('testService', Y.eZ.ViewService, [], {
                    _getViewParameters: function () {
                        return serviceParams;
                    }
                }),
                plugins = [
                    Y.Base.create('plugin1', Y.eZ.Plugin.ViewServiceBase, [], {
                        getViewParameters: function () {
                            return plugin1Params;
                        },
                    }, {NS: "plugin1"}),
                    Y.Base.create('plugin2', Y.eZ.Plugin.ViewServiceBase, [], {
                        getViewParameters: function () {
                            return plugin2Params;
                        },
                    }, {NS: "plugin2"}),
                ];

            this.serviceParams = serviceParams;
            this.plugin1Params = plugin1Params;
            this.plugin2Params = plugin2Params;
            this.service = new Service({
                plugins: plugins
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should merge the view parameters from the plugins and the service": function () {
            var params = this.service.getViewParameters(),
                expectedLength;

            expectedLength = Y.Object.keys(this.serviceParams).length
                + Y.Object.keys(this.plugin1Params).length
                + Y.Object.keys(this.plugin2Params).length;
            Assert.areEqual(
                expectedLength, Y.Object.keys(params).length,
                "The view should get " + expectedLength + " parameters"
            );

            Y.Object.each(this.serviceParams, function (value, key) {
                Assert.areSame(
                    value, params[key],
                    "The view should get the parameter " + key + " from view service"
                );
            });
            Y.Object.each(this.plugin1Params, function (value, key) {
                Assert.areSame(
                    value, params[key],
                    "The view should get the parameter " + key + " from the plugin 1"
                );
            });
            Y.Object.each(this.plugin2Params, function (value, key) {
                Assert.areSame(
                    value, params[key],
                    "The view should get the parameter " + key + " from the plugin 2"
                );
            });
        },
    });

    pluginLoadTests = new Y.Test.Case({
        name: "eZ View Service load with plugins tests",

        setUp: function () {
            var that = this,
                Service, plugins;

            this.serviceName = 'testService';
            this.plugin1Name = 'plugin1';
            this.plugin2Name = 'plugin2';
            this.loadStack = [];
            this.expectedLoadStack = [
                this.serviceName + "._load",
                this.plugin2Name + ".parallelLoad",
                this.plugin1Name + ".parallelLoad",
                this.plugin2Name + ".afterLoad",
                this.plugin1Name + ".afterLoad"
            ];
            Service  = Y.Base.create(this.serviceName, Y.eZ.ViewService, [], {
                _load: function (cb) {
                    that.loadStack.push(that.serviceName + "._load");
                    cb();
                },
            });
            plugins = [
                Y.Base.create(this.plugin1Name, Y.eZ.Plugin.ViewServiceBase, [], {
                    parallelLoad: function (cb) {
                        setTimeout(function () {
                            that.loadStack.push(that.plugin1Name + ".parallelLoad");
                            cb();
                        }, 30);
                    },

                    afterLoad: function (cb) {
                        setTimeout(function () {
                            that.loadStack.push(that.plugin1Name + ".afterLoad");
                            cb();
                        }, 30);
                    },
                }, {NS: this.plugin1Name}),
                Y.Base.create(this.plugin2Name, Y.eZ.Plugin.ViewServiceBase, [], {
                    parallelLoad: function (cb) {
                        setTimeout(function () {
                            that.loadStack.push(that.plugin2Name + ".parallelLoad");
                            cb();
                        }, 10);
                    },
                    afterLoad: function (cb) {
                        setTimeout(function () {
                            that.loadStack.push(that.plugin2Name + ".afterLoad");
                            cb();
                        }, 10);
                    },
                }, {NS: this.plugin2Name}),
            ];

            this.service = new Service({
                plugins: plugins
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should the afterLoad and parallelLoad of the plugins": function () {
            var that = this;

            this.service.load(function () {
                that.resume(function () {
                    Assert.areSame(
                        this.expectedLoadStack.length, this.loadStack.length,
                        "Expected " + this.expectedLoadStack.length + " 'load' calls"
                    );
                    Y.Array.each(this.expectedLoadStack, function (expected, i) {
                        Assert.areEqual(
                            expected, that.loadStack[i],
                            "The operation " + i + " should be " + expected
                        );
                    });
                });
            });
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ View Service tests");
    Y.Test.Runner.add(test);
    Y.Test.Runner.add(pluginViewParamTests);
    Y.Test.Runner.add(pluginLoadTests);
}, '', {requires: ['test', 'ez-viewservice', 'ez-viewservicebaseplugin']});
