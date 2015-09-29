/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewrelationstabview-tests', function (Y) {
    var attributesTest,
        renderTest,
        fireLoadObjectRelationsEventTest,
        Assert = Y.Assert,
        Mock = Y.Mock;

    attributesTest = new Y.Test.Case({
        name: "eZ LocationViewRelationsTabView attributes test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewRelationsTabView({
                content: {},
                contentType: {},
                config: {},
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _readOnlyString: function (attr) {
            var value = this.view.get(attr);

            Assert.isString(
                this.view.get(attr),
                "The view should have a "+  attr
            );
            this.view.set(attr, value + 'somethingelse');
            Assert.areEqual(
                value, this.view.get(attr),
                "The " + attr + " should be readonly"
            );
        },

        "Should have a title": function () {
            this._readOnlyString('title');
        },

        "Should have a identifier": function () {
            this._readOnlyString('identifier');
        },
    });

    renderTest = new Y.Test.Case({
        name: "eZ LocationViewRelationsTabView render test",
        setUp: function () {
            this.loadingError = false;
            this.contentMock = new Mock();

            this.relatedContent1Mock = new Mock();
            this.relatedContent2Mock = new Mock();
            this.relatedContents = [
                this.relatedContent1Mock,
                this.relatedContent2Mock,
            ];

            this.contentRelations = [
                {
                    destination: "/relatedcontent/1",
                    type: "COMMON",
                    fieldDefinitionIdentifier: "" //only for 'ATTRIBUTE'
                },
                {
                    destination: "/relatedcontent/1",
                    type: "EMBED",
                    fieldDefinitionIdentifier: "" //only for 'ATTRIBUTE'
                },
                {
                    destination: "/relatedcontent/2",
                    type: "CHOUCROUTE",
                    fieldDefinitionIdentifier: "" //only for 'ATTRIBUTE'
                },
                {
                    destination: "/relatedcontent/2",
                    type: "ATTRIBUTE",
                    fieldDefinitionIdentifier:"relationList"
                },
            ];

            Mock.expect(this.contentMock, {
                method: 'get',
                args: ['relations'],
                returns: this.contentRelations
            });

            this.contentTypeMock = new Mock();
            this.fieldDefinitions = {
                relationList: { names: {
                    "eng-GB": "Welcome Lucie",
                    "fre-FR": "Bienvenue Lucie"}
                },
                relation: { names: {
                    "eng-GB": "Great, a cousin",
                    "fre-FR": "Super, une cousine"}
                },
            };

            Mock.expect(this.contentTypeMock, {
                method: 'get',
                args: ['fieldDefinitions'],
                returns: this.fieldDefinitions
            });

            this._configureRelatedContentMock(
                this.relatedContent1Mock, '/relatedcontent/1', 'eng-GB', '/rc/loc/1'
            );
            this._configureRelatedContentMock(
                this.relatedContent2Mock, '/relatedcontent/2', 'eng-GB', '/rc/loc/2'
            );

            this.expectedRelatedContent = [
                {
                    content: this.relatedContent1Mock.toJSON(),
                    mainLocationId: '/rc/loc/1',
                    relationInfo: [
                        {
                            relationTypeName: "Content level relation",
                            fieldDefinitionName: ""
                        },
                        {
                            relationTypeName: "Embed",
                            fieldDefinitionName: ""
                        }
                    ]
                },
                {
                    content: this.relatedContent2Mock.toJSON(),
                    mainLocationId: '/rc/loc/2',
                    relationInfo: [
                        {
                            relationTypeName: "Unknown relation type",
                            fieldDefinitionName: ""
                        },
                        {
                            relationTypeName: "Attribute",
                            fieldDefinitionName: "Welcome Lucie"
                        }
                    ]
                },
            ];

            this.view = new Y.eZ.LocationViewRelationsTabView({
                content: this.contentMock,
                relatedContents: this.relatedContents,
                contentType: this.contentTypeMock,
                config: {},
                loadingError: this.loadingError,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _configureRelatedContentMock: function(relatedContentMock, id, languageCode, mainLocation) {
            Mock.expect(relatedContentMock, {
                method: 'toJSON',
                returns: {}
            });

            Mock.expect(relatedContentMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if (attr === 'id') {
                        return id;
                    } else if (attr === 'mainLanguageCode') {
                        return languageCode;
                    } else if (attr === 'resources') {
                        return {MainLocation: mainLocation};
                    } else {
                        Y.fail("Unexpected parameter " + attr + " for content mock");
                    }
                }
            });
        },

        "Render should call the template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },

        _testRelatedContentItem: function (expectedRelatedContentItem, relatedContentItem, index) {
            Assert.areSame(
                expectedRelatedContentItem.content, relatedContentItem.content,
                "Expected relatedContent (" + index + ") content should be available in the template"
            );

            Assert.areSame(
                expectedRelatedContentItem.mainLocationId, relatedContentItem.mainLocationId,
                "Expected mainLocationId (" + index + ") content should be available in the template"
            );

            Assert.areSame(
                expectedRelatedContentItem.relationInfo.relationTypeName,
                relatedContentItem.relationInfo.relationTypeName,
                "Expected relatedContent (" + index + ") relationTypeName should be available in the template"
            );
            Assert.areSame(
                expectedRelatedContentItem.relationInfo.fieldDefinitionName,
                relatedContentItem.relationInfo.fieldDefinitionName,
                "Expected relatedContent (" + index + ") fieldDefinitionName should be available in the template"
            );
        },

        "Variables should be available in the template": function () {
            var that = this;

            this.view.template = function (args) {
                Y.Array.each(that.expectedRelatedContent, function (expectedRelatedContent, i){
                    that._testRelatedContentItem(expectedRelatedContent, args.relatedContents[i], i);
                });

                Assert.areSame(
                    that.loadingError, args.loadingError,
                    "loadingError should be available in the template"
                );
            };

            this.view.render();
        },
    });


    fireLoadObjectRelationsEventTest = new Y.Test.Case({
        name: "eZ LocationViewRelationsTabView fire load object relations event test",
        setUp: function () {
            this.view = new Y.eZ.LocationViewRelationsTabView({});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadObjectRelations event": function () {
            var relationsCalled = false;

            this.view.once('loadObjectRelations', function () {
                relationsCalled = true;
            });

            this.view.set('active', true);

            Assert.isTrue(relationsCalled, "loadObjectRelations should have been called");
        },
    });

    Y.Test.Runner.setName("eZ Location View Relations Tab View tests");
    Y.Test.Runner.add(attributesTest);
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(fireLoadObjectRelationsEventTest);
}, '', {requires: ['test', 'ez-locationviewrelationstabview', 'node-event-simulate']});
