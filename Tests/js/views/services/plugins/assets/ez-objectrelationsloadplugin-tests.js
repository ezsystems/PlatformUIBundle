/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-objectrelationsloadplugin-tests', function (Y) {
    var tests, testsContentStructs, registerTest,
        Assert = Y.Assert;

    tests = new Y.Test.Case({
        name: "eZ Object Relations Load Plugin event tests",

        setUp: function () {
            this.Content = function () {
                this.set = tests._set;
                this.load = tests._load;
            };
            this.destination1 = '/api/ezp/v2/content/objects/117';
            this.destination2 = '/api/ezp/v2/content/objects/118';
            this.destination2Again = '/api/ezp/v2/content/objects/118';
            this.fieldDefId = 69;
            this.contentDestinations = [
                {destination: this.destination1},
                {destination: this.destination2},
                {destination: this.destination2Again}
            ];

            this.capi = {};
            this.service = new Y.Base();

            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.set('relatedContents', null);
            this.view.addTarget(this.service);

            this.service.set('capi', this.capi);

            this.plugin = new Y.eZ.Plugin.ObjectRelationsLoad({
                host: this.service,
            });

            this.service.set('content', new Y.Mock());
            Y.Mock.expect(this.service.get('content'), {
                method: 'relations',
                args: ['ATTRIBUTE', this.fieldDefId],
                returns: this.contentDestinations
            });

            this.plugin.set('contentModelConstructor', this.Content);
        },

        _set: function (name, value) {
            var isCorrectValue = false;
            Assert.areSame(
                'id',
                name,
                'method set should be called to set the id'
            );
            if ( value == tests.destination1 || value == tests.destination2 ){
                isCorrectValue = true;
            }
            Assert.isTrue(isCorrectValue, 'The id should be one of the destination content id');
            this.id = value;
        },

        _load: function (options, callback) {

        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        "Should load the related contents": function () {
            var that = this;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback();
            };

            this.view.fire(
                'whatever:loadObjectRelations',
                {relationType: 'ATTRIBUTE', fieldDefinitionIdentifier: that.fieldDefId}
            );

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                this.contentDestinations.length -1, //destination2 should be present only once
                this.view.get('relatedContents').length,
                'the view should have as many content as the related content minus the duplicate'
            );

            Y.Array.each(this.view.get('relatedContents'), function (value, i) {
                Assert.areSame(
                    that.contentDestinations[i].destination,
                    value.id,
                    "the view's contents should have the good destinations"
                );
            });

            Assert.isFalse(this.view.get('loadingError'), "The loadingError should be false");
        },

        "Should handle loading errors": function () {
            var that = this;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );
                callback(true);
            };

            this.view.fire(
                'whatever:loadObjectRelations',
                {relationType: 'ATTRIBUTE', fieldDefinitionIdentifier: that.fieldDefId}
            );

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                0,
                this.view.get('relatedContents').length,
                'the view should have no related content'
            );

            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
        },

        "Should handle some loading errors": function () {
            var that = this;

            this._load = function (options, callback){
                Assert.areSame(
                    that.capi,
                    options.api,
                    'The REST API client should be passed in the load options'
                );

                callback(this.id == that.destination1);
            };

            this.view.fire(
                'whatever:loadObjectRelations',
                {relationType: 'ATTRIBUTE', fieldDefinitionIdentifier: that.fieldDefId}
            );

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                1,
                this.view.get('relatedContents').length,
                'the view should have no content destination'
            );

            Y.Array.each(this.view.get('relatedContents'), function (value, i) {
                Assert.areSame(
                    that.destination2,
                    value.id,
                    "the view's contents should only have the content with the id of destination2"
                );
            });

            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
        },
    });

    testsContentStructs = new Y.Test.Case({
        name: "eZ Object Relations Load Plugin event tests content structs",

        setUp: function () {
            this.destination1 = '/api/ezp/v2/content/objects/117';
            this.destination2 = '/api/ezp/v2/content/objects/118';
            this.destination2Again = '/api/ezp/v2/content/objects/118';
            this.fieldDefId = 69;
            this.contentDestinations = [
                {destination: this.destination1},
                {destination: this.destination2},
                {destination: this.destination2Again}
            ];

            this.relatedContentsJSON = [
                {
                    id: this.destination1,
                    resources: {
                        MainLocation: '/main/location/of/content/1'
                    }
                },
                {
                    id: this.destination2,
                    resources: {
                        MainLocation: '/main/location/of/content/2'
                    }
                }
            ];

            this.capi = {};
            this.service = new Y.Base();

            this.view = new Y.View();
            this.view.set('loadingError', false);
            this.view.set('relatedContents', null);
            this.view.addTarget(this.service);

            this.service.set('capi', this.capi);

            this.plugin = new Y.eZ.Plugin.ObjectRelationsLoad({
                host: this.service,
            });

            this.service.set('content', new Y.Mock());
            Y.Mock.expect(this.service.get('content'), {
                method: 'relations',
                args: ['ATTRIBUTE', this.fieldDefId],
                returns: this.contentDestinations
            });
        },

        tearDown: function () {
            this.plugin.destroy();
            this.view.destroy();
            this.service.destroy();
            delete this.plugin;
            delete this.view;
            delete this.service;
        },

        _getContentJsonById: function (contentId) {
            var matchingContentJSON = null;

            Y.Array.each(this.relatedContentsJSON, function (contentJSON) {
                if (contentJSON.id === contentId) {
                    matchingContentJSON = contentJSON;
                }
            });
            Assert.isNotNull(matchingContentJSON, 'Trying to get contentJSON with incorrect id "' + contentId + '"');

            return matchingContentJSON;
        },

        "Should load the related contents with locations and its path as content structs": function () {
            var that = this,
                locationPath = [],
                Content = Y.Base.create('content', Y.Base, [],
                    {
                        load: function (options, callback) {
                            var relatedContentJSON;

                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            relatedContentJSON = that._getContentJsonById(this.get('id'));
                            this.set('resources', relatedContentJSON.resources);

                            callback(false);
                        }
                    }
                ),
                Location = Y.Base.create('location', Y.Base, [],
                    {
                        load: function (options, callback) {
                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            callback(false);
                        },
                        loadPath: function (options, callback) {
                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            this.set('path', locationPath);

                            callback(false);
                        }
                    }
                );

            this.plugin.set('contentModelConstructor', Content);
            this.plugin.set('locationModelConstructor', Location);

            this.view.fire('whatever:loadObjectRelations', {
                relationType: 'ATTRIBUTE',
                fieldDefinitionIdentifier: that.fieldDefId,
                loadLocationPath: true,
            });

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of content structs');

            Assert.areEqual(
                this.contentDestinations.length -1, //destination2 should be present only once
                this.view.get('relatedContents').length,
                'the view should have as many content as the related content minus the duplicate'
            );

            Y.Array.each(this.view.get('relatedContents'), function (value, i) {
                Assert.isObject(value.content, "The view's content struct should contain content");
                Assert.isObject(value.location, "The view's content struct should contain location");
                Assert.areSame(
                    that.contentDestinations[i].destination,
                    value.content.get('id'),
                    "The view's contents should have the good destinations"
                );
                Assert.areSame(
                    locationPath,
                    value.location.get('path'),
                    "The view's locations should have loaded path"
                );
            });

            Assert.isFalse(this.view.get('loadingError'), "The loadingError should be false");
        },

        "Should load the related contents in content structs without loading location's path": function () {
            var that = this,
                Content = Y.Base.create('content', Y.Base, [],
                    {
                        load: function (options, callback) {
                            var relatedContentJSON;

                            relatedContentJSON = that._getContentJsonById(this.get('id'));
                            this.set('resources', relatedContentJSON.resources);

                            callback(false);
                        }
                    }
                ),
                Location = Y.Base.create('location', Y.Base, [],
                    {
                        load: function (options, callback) {
                            callback(false);
                        },
                        loadPath: function (options, callback) {
                            Assert.fail("The location shouldn't be loaded");
                        }
                    }
                );

            this.plugin.set('contentModelConstructor', Content);
            this.plugin.set('locationModelConstructor', Location);

            this.view.fire('whatever:loadObjectRelations', {
                relationType: 'ATTRIBUTE',
                fieldDefinitionIdentifier: that.fieldDefId,
                loadLocation: true,
            });

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of content structs');

            Assert.areEqual(
                this.contentDestinations.length -1, //destination2 should be present only once
                this.view.get('relatedContents').length,
                'the view should have as many content as the related content minus the duplicate'
            );

            Y.Array.each(this.view.get('relatedContents'), function (value, i) {
                Assert.isObject(value.content, "The view's content struct should contain content");
                Assert.isObject(value.location, "The view's content struct should contain location");
                Assert.areSame(
                    that.contentDestinations[i].destination,
                    value.content.get('id'),
                    "The view's contents should have the good destinations"
                );
            });

            Assert.isFalse(this.view.get('loadingError'), "The loadingError should be false");
        },

        "Should handle error when loading content fails": function () {
            var that = this,
                Content = Y.Base.create('content', Y.Base, [],
                    {
                        load: function (options, callback) {
                            callback(true);
                        }
                    }
                );

            this.plugin.set('contentModelConstructor', Content);

            this.view.fire('whatever:loadObjectRelations', {
                relationType: 'ATTRIBUTE',
                fieldDefinitionIdentifier: that.fieldDefId,
                loadLocationPath: true,
            });

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                0,
                this.view.get('relatedContents').length,
                'the view should have no related content'
            );

            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
        },

        "Should handle error when loading location fails": function () {
            var that = this,
                Content = Y.Base.create('content', Y.Base, [],
                    {
                        load: function (options, callback) {
                            var relatedContentJSON;

                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            relatedContentJSON = that._getContentJsonById(this.get('id'));
                            this.set('resources', relatedContentJSON.resources);

                            callback(false);
                        }
                    }
                ),
                Location = Y.Base.create('location', Y.Base, [],
                    {
                        load: function (options, callback) {
                            callback(true);
                        }
                    }
                );

            this.plugin.set('contentModelConstructor', Content);
            this.plugin.set('locationModelConstructor', Location);

            this.view.fire('whatever:loadObjectRelations', {
                relationType: 'ATTRIBUTE',
                fieldDefinitionIdentifier: that.fieldDefId,
                loadLocationPath: true,
            });

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                0,
                this.view.get('relatedContents').length,
                'the view should have no related content'
            );

            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
        },

        "Should handle error when loading location's path fails": function () {
            var that = this,
                Content = Y.Base.create('content', Y.Base, [],
                    {
                        load: function (options, callback) {
                            var relatedContentJSON;

                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            relatedContentJSON = that._getContentJsonById(this.get('id'));
                            this.set('resources', relatedContentJSON.resources);

                            callback(false);
                        }
                    }
                ),
                Location = Y.Base.create('location', Y.Base, [],
                    {
                        load: function (options, callback) {
                            Assert.areSame(
                                that.capi,
                                options.api,
                                'The REST API client should be passed in the load options'
                            );

                            callback(false);
                        },
                        loadPath: function (options, callback) {
                            callback(true);
                        }
                    }
                );

            this.plugin.set('contentModelConstructor', Content);
            this.plugin.set('locationModelConstructor', Location);

            this.view.fire('whatever:loadObjectRelations', {
                relationType: 'ATTRIBUTE',
                fieldDefinitionIdentifier: that.fieldDefId,
                loadLocationPath: true,
            });

            Assert.isArray(this.view.get('relatedContents'), 'the view should have an array of contents');

            Assert.areEqual(
                0,
                this.view.get('relatedContents').length,
                'the view should have no related content'
            );

            Assert.isTrue(this.view.get('loadingError'), "The loadingError should be true");
        },
    });

    registerTest = new Y.Test.Case(Y.eZ.Test.PluginRegisterTest);
    registerTest.Plugin = Y.eZ.Plugin.ObjectRelationsLoad;
    registerTest.components = ['locationViewViewService'];

    Y.Test.Runner.setName("eZ Object Relation List Load Plugin tests");
    Y.Test.Runner.add(tests);
    Y.Test.Runner.add(testsContentStructs);
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'view', 'base', 'array-extras', 'ez-objectrelationsloadplugin', 'ez-pluginregister-tests']});
