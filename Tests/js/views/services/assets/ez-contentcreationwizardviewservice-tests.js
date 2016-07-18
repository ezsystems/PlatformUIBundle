/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardviewservice-tests', function (Y) {
    var getViewParametersTest, loadTest, wizardEndingTest,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.ContentCreationWizardViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should return an object build on parameters": function () {
            var viewParameters;

            this.service.set('parameters', {param: 'param'});
            viewParameters = this.service.getViewParameters();

            Assert.areEqual(
                'param', viewParameters.param,
                "getViewParameters should return an object build from the parameters"
            );
        },

        "Should return the app config": function () {
            var config = {};

            this.service.set('config', config);

            Assert.areSame(
                config,
                this.service.getViewParameters().config,
                "The view parameters should contain the config"
            );
        },

        "Should return the content type groups": function () {
            var groups = [];

            this.service.set('contentTypeGroups', groups);

            Assert.areSame(
                groups,
                this.service.getViewParameters().contentTypeGroups,
                "The view parameters should contain the Content Type Groups"
            );
        },
    });

    loadTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View Service load test",

        setUp: function () {
            this.app = new Y.Base();
            this.app.set('loading', false);
            this.service = new Y.eZ.ContentCreationWizardViewService({
                app: this.app,
            });
            this.service.contentType = new Mock();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should set the app loading flag": function () {
            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
            });
            this.service.load(function () {
                Assert.fail('The callback should not be called');
            });

            Assert.isTrue(
                this.app.get('loading'),
                "The `loading` flag should be set"
            );
        },

        "Should handle content types loading error": function () {
            var errorEvent = false;

            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });

            this.service.on('error', function () {
                errorEvent = true;
            });

            this.service.load(function () {
                Assert.fail('The callback should not be called');
            });

            Assert.isFalse(
                this.app.get('loading'),
                "The `loading` flag should be false"
            );
            Assert.isTrue(
                errorEvent,
                "The error event should have been fired"
            );
        },

        "Should load the content types": function () {
            var callbackCalled = false,
                groups = [];

            Mock.expect(this.service.contentType, {
                method: 'loadAllContentTypes',
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(false, groups);
                },
            });

            this.service.load(Y.bind(function () {
                callbackCalled = true;

                Assert.areSame(
                    groups, this.get('contentTypeGroups'),
                    "The Content Type Groups should have been loaded"
                );
            }, this.service));

            Assert.isFalse(
                this.app.get('loading'),
                "The `loading` flag should be false"
            );
            Assert.isTrue(
                callbackCalled,
                "The load callback should have been called"
            );
        },
    });

    wizardEndingTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View Service contentCreationWizardEnding event test",

        setUp: function () {
            this.app = new Mock(new Y.Base());
            this.service = new Y.eZ.ContentCreationWizardViewService({
                app: this.app,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should redirect the user to the create content route": function () {
            var contentTypeId = 'quatrouille',
                locationId = 'st-paul-de-varax',
                contentType = new Y.Base(),
                location = new Y.Base();

            contentType.set('id', contentTypeId);
            location.set('id', locationId);

            Mock.expect(this.app, {
                method: 'navigateTo',
                args: ['createContentUnder', Mock.Value.Object],
                run: function (name, params) {
                    Assert.areEqual(
                        contentTypeId,
                        params.contentTypeId,
                        "The content type id should be provided in the route params"
                    );
                    Assert.areEqual(
                        locationId,
                        params.parentLocationId,
                        "The parent location id should be provided in the route params"
                    );
                },
            });

            this.service.fire('contentCreationWizardEnding', {
                contentType: contentType,
                parentLocation: location,
            });
            Mock.verify(this.app);
        },
    });

    Y.Test.Runner.setName("eZ Content Creation Wizard View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(wizardEndingTest);
}, '', {requires: ['test', 'base', 'ez-contentcreationwizardviewservice']});
