/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-discoverybarviewservice-tests', function (Y) {
    var serviceTest,
        Assert = Y.Assert;

    serviceTest = new Y.Test.Case({
        name: "eZ Discovery Bar View Service tests",

        setUp: function () {
            this.app = new Y.Mock();
            this.capi = new Y.Mock();

            this.service = new Y.eZ.DiscoveryBarViewService({
                app: this.app,
                capi: this.capi,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
            delete this.app;
            delete this.capi;
        },

        "load should call the next callback": function () {
            var nextCalled = false,
                that = this;

            this.service.load(function (param) {
                nextCalled = true;
                Assert.areSame(
                    that.service,
                    param,
                    "The service should be passed to the `next` callback"
                );
            });

            Assert.isTrue(nextCalled, "The `next` callback was not called");
        },
    });

    Y.Test.Runner.setName("eZ Discovery Bar View Service tests");
    Y.Test.Runner.add(serviceTest);
}, '', {requires: ['test', 'ez-discoverybarviewservice']});
