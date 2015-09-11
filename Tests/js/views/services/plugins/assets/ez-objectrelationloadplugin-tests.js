/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationloadplugin-tests', function (Y) {
    var tests, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Object Relation Load Plugin event tests",

        setUp: function () {
            this.relatedContent = new Y.Mock();
            this.destination = '/api/ezp/v2/content/objects/117';
            this.fieldDefinitionIdentifier = 'super_attribut_relation';
            this.relationId = 42;

            Y.Mock.expect(this.relatedContent, {
                method: 'set',
                args: ['id', this.destination],
            });

            this.capi = {};
            this.service = new Y.Base();

            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.set('destinationContent', null);
            this.view.addTarget(this.service);

            this.service.set('capi', this.capi);
            this.service.set('content', new Y.eZ.Content());
            this.service.get('content').set('relations', [
                {
                    id: this.relationId,
                    destination: this.destination,
                    type: 'ATTRIBUTE',
                    fieldDefinitionIdentifier: this.fieldDefinitionIdentifier,
                },
                {
                    id: this.relationId,
                    destination: this.destination,
                    type: 'EMBED',
                    fieldDefinitionIdentifier: this.fieldDefinitionIdentifier,
                }
            ]);

            this.plugin = new Y.eZ.Plugin.ObjectRelationLoad({
                host: this.service,
            });
            this.plugin._set('relatedContent', this.relatedContent);
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
            delete this.relatedContent;
        },

        "Should load the related content on `loadFieldRelatedContent` event": function () {
            var that = this,
                initialLoadingError = this.view.get('loadingError');

            Y.Mock.expect(this.relatedContent, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        'the CAPI should be passed in the options'
                    );
                    callback();
                }
            });

            this.view.fire(
                'loadFieldRelatedContent',
                {fieldDefinitionIdentifier: this.fieldDefinitionIdentifier}
            );
            Assert.areSame(
                this.relatedContent,
                this.view.get('destinationContent'),
                "The view should get the related content"
            );
            Assert.areSame(
                initialLoadingError,
                this.view.get('loadingError'),
                "The loadingError should stay the same"
            );
            Y.Mock.verify(this.relatedContent);
        },

        "Should handle loading error while loading related content": function () {
            var that = this,
                initialDest = this.view.get('destinationContent');

            Y.Mock.expect(this.relatedContent, {
                method: 'load',
                args: [Y.Mock.Value.Object, Y.Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi,
                        options.api,
                        'the CAPI should be passed in the options'
                    );
                    callback(true);
                }
            });

            this.view.fire(
                'loadFieldRelatedContent',
                {fieldDefinitionIdentifier: this.fieldDefinitionIdentifier}
            );
            Assert.areSame(
                initialDest,
                this.view.get('destinationContent'),
                "The destinationContent should stay the same"
            );
            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
            Y.Mock.verify(this.relatedContent);
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ObjectRelationLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Object Relation Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'ez-objectrelationloadplugin', 'ez-contentmodel', 'ez-pluginregister-tests']});
