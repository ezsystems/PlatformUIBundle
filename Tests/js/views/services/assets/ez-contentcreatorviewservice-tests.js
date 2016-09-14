/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreatorviewservice-tests', function (Y) {
    var getViewParametersTest, loadTest, closeContentCreatorTest,
        parametersChangeTest, publishedDraftTest, eventHandlersTest,
        Assert = Y.Assert, Mock = Y.Mock;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Content Creator View Service getViewParameters test",

        setUp: function () {
            Y.eZ.Content = Y.Base;
            Y.eZ.Location = Y.Base;
            Y.eZ.Version = Y.Base;
            this.contentType = {};
            this.parentLocation = {};
            this.languageCode = 'bressan';
            this.app = new Y.Base();
            this.app.set('user', {});
            this.service = new Y.eZ.ContentCreatorViewService({
                app: this.app,
            });
            this.service.set('parameters', {
                contentType: this.contentType,
                parentLocation: this.parentLocation,
                languageCode: this.languageCode,
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            delete this.service;
            delete this.app;
            delete Y.eZ.Content;
            delete Y.eZ.Location;
            delete Y.eZ.Version;
        },

        "Should return the parameters": function () {
            var viewParams = this.service.getViewParameters();

            Assert.areSame(
                this.contentType, viewParams.contentType,
                "The content type should have been returned"
            );
            Assert.areSame(
                this.parentLocation, viewParams.parentLocation,
                "The parent Location should have been returned"
            );
            Assert.areSame(
                this.app.get('user'), viewParams.owner,
                "The owner should be the currently logged in user"
            );
            Assert.areSame(
                this.service.get('content'), viewParams.content,
                "The content to be created should have been returned"
            );
            Assert.areSame(
                this.service.get('version'), viewParams.version,
                "The version to be created should have been returned"
            );
            Assert.areEqual(
                this.languageCode, viewParams.languageCode,
                "The language code should have been returned"
            );
        },
    });

    loadTest = new Y.Test.Case({
        name: "eZ Content Creator View Service load test",

        setUp: function () {
            Y.eZ.Content = Y.Base;
            Y.eZ.Location = Y.Base;
            Y.eZ.Version = Y.Base;
            this.contentType = new Mock();
            this.app = new Y.Base();
            this.app.set('contentCreationDefaultLanguageCode', 'bressan');
            this.service = new Y.eZ.ContentCreatorViewService({
                app: this.app,
            });
            this.service.set('parameters', {
                contentType: this.contentType,
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            delete this.service;
            delete this.app;
            delete Y.eZ.Content;
            delete Y.eZ.Location;
            delete Y.eZ.Version;
        },

        "Should initialize the content and the version": function () {
            var typeName = 'Quatrouille',
                defaultFields = {},
                callbackCalled = false;

            Mock.expect(this.contentType, {
                method: 'getName',
                args: [this.app.get('contentCreationDefaultLanguageCode')],
                returns: typeName,
            });
            Mock.expect(this.contentType, {
                method: 'getDefaultFields',
                returns: defaultFields,
            });

            this.service.load(Y.bind(function () {
                callbackCalled = true;

                Assert.areEqual(
                    'New "' + typeName + '"',
                    this.service.get('content').get('name'),
                    "The content should name should have been set"
                );
                Assert.areEqual(
                    defaultFields,
                    this.service.get('content').get('fields'),
                    "The fields of the content should have been initialized"
                );
                Assert.areEqual(
                    defaultFields,
                    this.service.get('version').get('fields'),
                    "The fields of the version should have been initialized"
                );
            }, this));
            Assert.isTrue(
                callbackCalled,
                "The load callback should have been called"
            );
        },
    });

    closeContentCreatorTest = new Y.Test.Case({
        name: "eZ Content Creator View Service closeContentCreator test",

        setUp: function () {
            this.service = new Y.eZ.ContentCreatorViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should fire the `contentCreatorDone` event": function () {
            var eventFired = false;

            this.service.on('contentCreatorDone', function () {
                eventFired = true;
            });
            this.service.closeContentCreator();
            Assert.isTrue(
                eventFired,
                "The `contentCreatorDone` should have been fired"
            );
        }
    });

    parametersChangeTest = new Y.Test.Case({
        name: "eZ Content Creator View Service parameters change test",

        setUp: function () {
            Y.eZ.Content = Y.Base;
            Y.eZ.Location = Y.Base;
            Y.eZ.Version = Y.Base;
            this.contentType = new Mock();
            this.app = new Y.Base();
            this.app.set('contentCreationDefaultLanguageCode', 'bressan');
            this.service = new Y.eZ.ContentCreatorViewService({
                app: this.app,
            });
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            delete this.service;
            delete this.app;
            delete Y.eZ.Content;
            delete Y.eZ.Location;
            delete Y.eZ.Version;
        },

        "Should use the parameters to initialize the attributes": function () {
            var contentType = {},
                parentLocation = {},
                eventHandlers = {},
                languageCode = 'fre';

            this.service.set('parameters', {
                contentType: contentType,
                parentLocation: parentLocation,
                eventHandlers: eventHandlers,
                languageCode: languageCode,
            });

            Assert.areSame(
                contentType, this.service.get('contentType'),
                "The contentType attribute should have been set from the parameters"
            );
            Assert.areSame(
                parentLocation, this.service.get('parentLocation'),
                "The parentLocation attribute should have been set from the parameters"
            );
            Assert.areSame(
                eventHandlers, this.service.get('eventHandlers'),
                "The eventHandlers attribute should have been set from the parameters"
            );
            Assert.areSame(
                languageCode, this.service.get('languageCode'),
                "The languageCode attribute should have been set from the parameters"
            );
        },

        "Should handle the case where languageCode is missing": function () {
            this.service.set('parameters', {});

            Assert.areSame(
                this.app.get('contentCreationDefaultLanguageCode'), this.service.get('languageCode'),
                "The languageCode attribute should have been set from the `contentCreationDefaultLanguageCode` app attribute"
            );
        },

        "Should instantiate new Content item, Version and Location objects": function () {
            var content, version, mainLocation;

            this["Should use the parameters to initialize the attributes"]();
            content = this.service.get('content');
            version = this.service.get('version');
            mainLocation = this.service.get('mainLocation');

            Assert.isInstanceOf(
                Y.eZ.Content, content,
                "The content should be an instance of Y.eZ.Content"
            );
            Assert.isInstanceOf(
                Y.eZ.Version, version,
                "The version should be an instance of Y.eZ.Version"
            );
            Assert.isInstanceOf(
                Y.eZ.Location, mainLocation,
                "The location should be an instance of Y.eZ.Location"
            );

            this.service.set('parameters', {});

            Assert.isInstanceOf(
                Y.eZ.Content, content,
                "The content should be an instance of Y.eZ.Content"
            );
            Assert.isInstanceOf(
                Y.eZ.Version, version,
                "The version should be an instance of Y.eZ.Version"
            );
            Assert.isInstanceOf(
                Y.eZ.Location, mainLocation,
                "The location should be an instance of Y.eZ.Location"
            );
            Assert.areNotSame(
                content, this.service.get('content'),
                "A new content should have been created"
            );
            Assert.areNotSame(
                version, this.service.get('version'),
                "A new version should have been created"
            );
            Assert.areNotSame(
                mainLocation, this.service.get('mainLocation'),
                "A new mainLocation should have been created"
            );
        },
    });

    publishedDraftTest = new Y.Test.Case({
        name: "eZ Content Creator View Service publishedDraft event test",

        setUp: function () {
            this.capi = {};
            this.mainLocationLoaded = false;
            this.mainLocationId = 'st-paul-de-varax';

            Y.eZ.Content = Y.Base.create('contentModel', Y.Base, [], {}, {
                ATTRS: {
                    resources: {
                        value: {
                            MainLocation: this.mainLocationId,
                        }
                    },
                }
            });
            Y.eZ.Location = Y.Base.create('locationModel', Y.Base, [], {
                load: Y.bind(function (options, callback) {
                    Assert.areSame(
                        this.capi, options.api,
                        "The CAPI should be passed to the load method options"
                    );
                    this.mainLocationLoaded = true;
                    callback();
                }, this),
            });
            Y.eZ.Version = Y.Base;
            this.contentType = new Mock();
            this.app = new Y.Base();
            this.app.set('contentCreationDefaultLanguageCode', 'bressan');
            this.service = new Y.eZ.ContentCreatorViewService({
                app: this.app,
                capi: this.capi,
            });
            this.service.set('parameters', {});
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            delete this.service;
            delete this.app;
            delete Y.eZ.Content;
            delete Y.eZ.Location;
            delete Y.eZ.Version;
        },

        "Should load the main location": function () {
            this.service.fire('publishedDraft');

            Assert.isTrue(
                this.mainLocationLoaded,
                "The main location should have been loaded"
            );
        },

        "Should fire the `contentCreated` event after loading the main Location": function () {
            var eventFired = false;

            this.service.on('contentCreated', function () {
                eventFired = true;
            });
            this.service.fire('publishedDraft');

            Assert.isTrue(
                eventFired,
                "The `contentCreated` event should have been fired"
            );
        },
    });

    eventHandlersTest = new Y.Test.Case({
        name: "eZ Content Creator View Service event handlers test",

        setUp: function () {
            Y.eZ.Content = Y.Base;
            Y.eZ.Location = Y.Base;
            Y.eZ.Version = Y.Base;
            this.contentType = new Mock();
            this.app = new Y.Base();
            this.app.set('contentCreationDefaultLanguageCode', 'bressan');
            this.service = new Y.eZ.ContentCreatorViewService({
                app: this.app,
            });
            this.view = new Y.View({bubbleTargets: this.service});
        },

        tearDown: function () {
            this.service.destroy();
            this.app.destroy();
            this.view.destroy();
            delete this.service;
            delete this.app;
            delete this.view;
            delete Y.eZ.Content;
            delete Y.eZ.Location;
            delete Y.eZ.Version;
        },

        "Should define a default handler for `*:closeView` to close the content creator": function () {
            var contentCreatorDone = false;

            this.service.on('contentCreatorDone', function () {
                contentCreatorDone = true;
            });

            this.service.set('parameters', {eventHandlers: {}});
            this.view.fire('closeView');
            Assert.isTrue(
                contentCreatorDone,
                "The content creator should be closed"
            );
        },

        "Should define a default handler for `discardedDraft` to close the content creator": function () {
            var contentCreatorDone = false;

            this.service.on('contentCreatorDone', function () {
                contentCreatorDone = true;
            });

            this.service.set('parameters', {eventHandlers: {}});
            this.service.fire('discardedDraft');
            Assert.isTrue(
                contentCreatorDone,
                "The content creator should be closed"
            );
        },

        _testEventHandler: function (evtName) {
            var handlerCalled = false,
                handler = Y.bind(function (struct) {
                    Assert.areSame(
                        this.service.get('mainLocation'),
                        struct.mainLocation,
                        "The main Location should be part of the provided struct"
                    );
                    Assert.areSame(
                        this.service.get('content'),
                        struct.content,
                        "The content item should be part of the provided struct"
                    );
                    Assert.areSame(
                        this.service.get('contentType'),
                        struct.contentType,
                        "The content type should be part of the provided struct"
                    );

                    handlerCalled = true;
                }, this),
                eventHandlers = {};

            eventHandlers[evtName] = handler;

            this.service.on('contentCreatorDone', function () {
                Assert.fail('The contentCreatorDone should not have been fired');
            });
            this.service.set('parameters', {eventHandlers: eventHandlers});
            this.service.fire(evtName);
            Assert.isTrue(
                handlerCalled,
                "The customer handler should have been called"
            );
        },

        "Should allow to override the default handler": function () {
            this._testEventHandler('publishDraft');
        },

        "Should define the handler for the given event": function () {
            this._testEventHandler('testingThisComponent');
        },
    });

    Y.Test.Runner.setName("eZ Content Creator View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(loadTest);
    Y.Test.Runner.add(closeContentCreatorTest);
    Y.Test.Runner.add(parametersChangeTest);
    Y.Test.Runner.add(publishedDraftTest);
    Y.Test.Runner.add(eventHandlersTest);
}, '', {requires: ['test', 'base', 'view', 'ez-contentcreatorviewservice']});
