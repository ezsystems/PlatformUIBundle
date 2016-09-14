/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryviewservice-tests', function (Y) {
    var getViewParametersTest, loadContentTypes,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Universal Discovery View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.UniversalDiscoveryViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return the parameters": function () {
            var parameters = {some: "params"};

            this.service.set('parameters', parameters);
            Assert.isObject(this.service.getViewParameters());
            Assert.areEqual(1, Y.Object.keys(this.service.getViewParameters()).length);
            Assert.areSame(
                parameters.some, this.service.getViewParameters().some,
                "The view parameters should be the parameters"
            );
        },
    });

    loadContentTypes = new Y.Test.Case({
        name: "eZ Universal Discovery View Service loadContentTypes test",

        setUp: function () {
            this.service = new Y.eZ.UniversalDiscoveryViewService();
            this.service.contentType = new Mock();
            this.view = new Y.View({bubbleTargets: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.view.destroy();
            delete this.service;
            delete this.view;
        },

        "Should load the content types": function () {
            var groups = [];

            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false, groups);
                }
            });

            this.view.fire('loadContentTypes');

            Assert.areSame(
                groups, this.view.get('contentTypeGroups'),
                "The view should have received the content types"
            );
            Assert.isFalse(
                this.view.get('loadingError'),
                "The loading error flag should be false"
            );
        },

        "Should handle loading errors": function () {
            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                }
            });

            this.view.fire('loadContentTypes');

            Assert.isTrue(
                this.view.get('loadingError'),
                "The loading error flag should be true"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(loadContentTypes);
}, '', {requires: ['test', 'view', 'ez-universaldiscoveryviewservice']});
