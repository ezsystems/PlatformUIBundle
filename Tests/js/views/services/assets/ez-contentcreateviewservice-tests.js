/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreateviewservice-tests', function (Y) {
    var loadTest,
        Mock = Y.Mock, Assert = Y.Assert;

    loadTest = new Y.Test.Case({
        name: 'eZ Content Create View Service load test',

        setUp: function () {
            var that = this;

            this.type = new Mock();
            this.names = {'eng-GB': "Song"};
            this.fieldDefinitions = {
                "title": {
                    "fieldDefinitionIdentifier": "title",
                    "defaultValue": "Ramble on",
                },
                "artist": {
                    "fieldDefinitionIdentifier": "artist",
                    "defaultValue": "Led Zeppelin",
                }
            };
            this.app = new Mock();
            this.user = {};
            Mock.expect(this.app, {
                method: 'get',
                args: ['user'],
                returns: this.user,
            });
            this.parentLocation = new Mock();
            this.parentLocationId = '42';
            this.viewParentLocation = '/view/parent/';
            Mock.expect(this.parentLocation, {
                method: 'get',
                args: ['id'],
                returns: this.parentLocationId,
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        that.parentLocationId, params.id,
                        "The parent location id should be passed to routeUri"
                    );
                    return that.viewParentLocation;
                }
            });
            this.capi = {};
            this.service = new Y.eZ.ContentCreateViewService({
                contentType: this.type,
                app: this.app,
                capi: this.capi,
                parentLocation: this.parentLocation,
            });
        },

        _assertLoadResult: function (service) {
            var content = service.get('content'),
                version = service.get('version'),
                fields = content.get('fields'),
                that = this;

            Assert.areSame(
                that.service,
                service,
                "The service should passed in parameter"
            );
            Assert.areSame(
                that.user,
                service.get('owner'),
                "The owner should be set to app's user"
            );
            Assert.areSame(
                content.get('fields'),
                version.get('fields'),
                "The fields of the version and the content should be the same"
            );
            Assert.isTrue(
                content.get('name').indexOf(that.names['eng-GB']) !== -1,
                "The name of the content should contain the name of the type"
            );
            Assert.areEqual(
                Y.Object.keys(that.fieldDefinitions).length,
                Y.Object.keys(fields).length,
                "The content should have as many fields as there are field definitions in the type"
            );
            Y.Object.each(that.fieldDefinitions, function (fieldDef, identifier) {
                Assert.areEqual(
                    identifier,
                    fields[identifier].fieldDefinitionIdentifier,
                    "The field definition identifier should set for each field"
                );
                Assert.areEqual(
                    fieldDef.defaultValue,
                    fields[identifier].fieldValue,
                    "The value of the fields should be the default value of the corresponding field definition"
                );
            });
        },

        "Should initialize a new content and a new version": function () {
            var loadCallback = false, that = this,
                originalVersion = this.service.get('version'),
                originalContent = this.service.get('content');

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            this.service.load(function (service) {
                loadCallback = true;

                Assert.areNotSame(
                    originalVersion,
                    that.service.get('version'),
                    "A new version object should have been instantiated"
                );
                Assert.areNotSame(
                    originalContent,
                    that.service.get('content'),
                    "A new content object should have been instantiated"
                );
                that._assertLoadResult(service);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should handle missing fieldDefinitions in the content type": function () {
            var loadCallback = false, that = this,
                getFieldDefinitionsCalls = 0;

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        if ( getFieldDefinitionsCalls === 0 ) {
                            getFieldDefinitionsCalls++;
                            return undefined;
                        }
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            Mock.expect(this.type, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    callback(false);
                }
            });
            this.service.load(function (service) {
                loadCallback = true;
                that._assertLoadResult(service);
            });
            Assert.isTrue(loadCallback, "The load callback should have been called");
        },

        "Should handle the error while loading the content type": function () {
            var errorFired = false, that = this,
                getFieldDefinitionsCalls = 0;

            Mock.expect(this.type, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'fieldDefinitions' ) {
                        if ( getFieldDefinitionsCalls === 0 ) {
                            getFieldDefinitionsCalls++;
                            return undefined;
                        }
                        return that.fieldDefinitions;
                    } else if ( attr === 'names' ) {
                        return that.names;
                    } else if ( attr === 'id' ) {
                        return 'typeid';
                    } else {
                        Y.fail("Unexpected type.get(" + attr + ") call");
                    }
                }
            });
            Mock.expect(this.type, {
                method: 'load',
                args: [Mock.Value.Object, Mock.Value.Function],
                run: function (options, callback) {
                    Assert.areSame(
                        that.capi, options.api,
                        "The CAPI should be passed to the type load method"
                    );
                    callback(true);
                }
            });

            this.service.on('error', function () {
                errorFired = true;
            });
            this.service.load();
            Assert.isTrue(errorFired, "The error should have been fired");
        },

        "Should initialize the redirection attributes": function () {
            var content = new Mock(),
                mainLocationId = 'good-bad-times',
                viewMainLocation = '/view/' + mainLocationId;

            this["Should initialize a new content and a new version"]();

            Mock.expect(content, {
                method: 'get',
                args: ['resources'],
                returns: {
                    MainLocation: mainLocationId
                }
            });
            Mock.expect(this.app, {
                method: 'routeUri',
                args: ['viewLocation', Mock.Value.Object],
                run: function (route, params) {
                    Assert.areEqual(
                        mainLocationId, params.id,
                        "The main location id should be passed to routeUri"
                    );
                    return viewMainLocation;
                }
            });
            this.service.set('content', content);
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('discardRedirectionUrl'),
                "The discardRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                this.viewParentLocation,
                this.service.get('closeRedirectionUrl'),
                "The closeRedirectionUrl should be the parent location view url"
            );
            Assert.areEqual(
                viewMainLocation,
                this.service.get('publishRedirectionUrl'),
                "THe publishRedirectionUrl should be the main location view url"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Create View Service tests");
    Y.Test.Runner.add(loadTest);
}, '', {requires: ['test', 'ez-contentcreateviewservice']});
