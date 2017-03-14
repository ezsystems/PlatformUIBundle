/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relationlist-editview-tests', function (Y) {
    var viewTest,
        registerTest,
        universalDiscoveryRelationTest,
        getFieldTest,
        getEmptyFieldTest,
        tapTest,
        loadObjectRelationsTest,
        initializerTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Relation list View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.relatedContents = [];
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelationlist",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false
            };
            this.field = {fieldValue: {destinationContentIds: [45, 42]}};

            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.loadingError = false;
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.contentType = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.RelationListEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                relatedContents: this.relatedContents,
                translating: false,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this,
                destContentToJSONArray = [];

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(10, Y.Object.keys(variables).length, "The template should receive 10 variables");
                Y.Assert.areSame(
                    that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                Y.Assert.isFalse(
                    variables.isNotTranslatable,
                    "The isNotTranslatable should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.view.get('loadingError'), variables.loadingError,
                    "The field should be available in the field edit view template"
                );
                Y.Array.each(that.view.get('relatedContents'), function (destContent) {
                    destContentToJSONArray.push(destContent.toJSON());
                });
                for ( var i = 0; i<= variables.relatedContents.length; i++){
                    Y.Assert.areSame(
                        destContentToJSONArray[i],
                        variables.relatedContents[i],
                        "The field should be available in the field edit view template"
                    );
                }

                Y.Assert.areSame(expectRequired, variables.isRequired);
                return '';
            };
            this.view.render();
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('relatedContents', []);
            this.view.render();

            this.view.validate();
            Y.Assert.isTrue(
                this.view.isValid(),
                "An empty relation is valid"
            );
        },

        "Test validate required": function () {
            var fieldDefinition = this._getFieldDefinition(true);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('relatedContents', []);
            this.view.validate();
            this.view.render();

            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty relation is NOT valid"
            );
        },

        "Should render the view when the loadingError attribute changes": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('loadingError', true);
            Y.Assert.isTrue(templateCalled, "The template has not been used");
        },

        "Should render the view when the destinationContent attribute changes": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('relatedContents', this.relatedContents);
            Y.Assert.isTrue(templateCalled, "The template has not been used");
        },
    });

    Y.Test.Runner.setName("eZ Relation list Edit View tests");
    Y.Test.Runner.add(viewTest);

    initializerTest = new Y.Test.Case({
        name: "eZ Relation list initializing test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelationlist",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false
            };
            this.field = {fieldValue: {destinationContentIds: [45, 42]}};

            this.view = new Y.eZ.RelationListEditView({
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                relatedContents: this.relatedContents,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fill the destinationContentsIds attribute from the field": function () {
            Y.Assert.isArray(
                this.view.get('destinationContentsIds'),
                "destinationContentsIds should be an array"
            );
            for (var i = 0; i <= this.view.get('destinationContentsIds').length; i++) {
                Y.Assert.areSame(
                    this.view.get('field').fieldValue.destinationContentIds[i],
                    this.view.get('destinationContentsIds')[i],
                    "The destinationContentId of the field value should be the same than the attribute"
                );
            }
        },
    });

    Y.Test.Runner.add(initializerTest);

    universalDiscoveryRelationTest = new Y.Test.Case({
        name: "eZ Relation list universal discovery relation test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required,
                fieldSettings: {},
            };
        },

        setUp: function () {
            this.relatedContents = [];
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelationlist",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false,
                fieldSettings: {
                    selectionContentTypes: ['allowed_content_type_identifier']
                }
            };
            this.field = {fieldValue: {destinationContentIds: [45, 42]}};

            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.contentType = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.RelationListEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                relatedContents: this.relatedContents,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should validate when the universal discovery is canceled (empty relation)": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(true);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('destinationContentsIds', null);

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.cancelDiscoverHandler.call(this);
                    Y.Assert.areSame(
                        this.view.get('errorStatus'),
                        'this.field.is.required domain=fieldedit',
                        'errorStatus should be true'
                    );
                });
            });

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should validate when the universal discovery is canceled": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.cancelDiscoverHandler.call(this);
                    Y.Assert.isFalse(this.view.get('errorStatus'),'errorStatus should be false');
                });
            });
            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },


        "Should fill the relation with the universal discovery widget selection": function () {
            var that = this,
                contentInfoMock1 = new Y.Mock(),
                contentInfoMock2 = new Y.Mock(),
                fakeEventFacade = {selection: [{contentInfo: contentInfoMock1}, {contentInfo: contentInfoMock2}]},
                contentIdsArray;
            this.view._set('destinationContentsIds', [42, 45]);
            contentIdsArray = Y.Array.dedupe(that.view.get('destinationContentsIds'));
            Y.Mock.expect(contentInfoMock1, {
                method: 'toJSON',
                returns: {name: 'me', publishedDate: 'yesterday', lastModificationDate: 'tomorrow'}
            });

            Y.Mock.expect(contentInfoMock1, {
                method: 'get',
                args: ['contentId'],
                returns: 42
            });

            Y.Mock.expect(contentInfoMock2, {
                method: 'toJSON',
                returns: {name: 'me', publishedDate: 'yesterday', lastModificationDate: 'tomorrow'}
            });

            Y.Mock.expect(contentInfoMock2, {
                method: 'get',
                args: ['contentId'],
                returns: 51
            });
            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    Y.Array.each(fakeEventFacade.selection, function (selection) {
                        if ( that.view.get('destinationContentsIds').indexOf(selection.contentInfo.get('contentId')) == -1) {
                            contentIdsArray.push(selection.contentInfo.get('contentId'));
                        }
                    });
                    e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
                    Y.ArrayAssert.itemsAreEqual(
                        contentIdsArray,
                        [42,45,51],
                        'destinationContentsIds should match the contentIds of the selected relation'
                    );
                });
            });

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should run the UniversalDiscoveryWidget": function () {
            var that = this,
                allowedContentType = new Y.Mock(),
                notAllowedContentType = new Y.Mock();

            Y.Mock.expect(allowedContentType, {
                method: 'get',
                args: ['identifier'],
                returns: this.fieldDefinition.fieldSettings.selectionContentTypes[0]
            });
            Y.Mock.expect(notAllowedContentType, {
                method: 'get',
                args: ['identifier'],
                returns: 'not_allowed_content_type_identifier'
            });

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    Y.Assert.isObject(e.config, "contentDiscover config should be an object");
                    Y.Assert.isFunction(e.config.contentDiscoveredHandler, "config should have a function named contentDiscoveredHandler");
                    Y.Assert.isFunction(e.config.cancelDiscoverHandler, "config should have a function named cancelDiscoverHandler");
                    Y.Assert.isFunction(e.config.isSelectable, "config should have a function named isSelectable");
                    Y.Assert.isTrue(
                        e.config.isSelectable({contentType: allowedContentType}),
                        "isSelectable should return TRUE if selected content's content type is on allowed content types list"
                    );
                    Y.Assert.isFalse(
                        e.config.isSelectable({contentType: notAllowedContentType}),
                        "isSelectable should return FALSE if selected content's content type is not on allowed content types list"
                    );
                    Assert.isUndefined(
                        e.config.startingLocationId,
                        "The starting Location id parameter should not be set"
                    );
                });
            });

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should run the UniversalDiscoveryWidget starting at selectionDefaultLocation": function () {
            var locationId = 'whatever/location/id';

            this.fieldDefinition.fieldSettings.selectionContentTypes = [];
            this.fieldDefinition.fieldSettings.selectionDefaultLocationHref = locationId;

            this.view.on('contentDiscover', this.next(function (e) {
                Assert.areEqual(
                    locationId,
                    e.config.startingLocationId,
                    "The starting Location id parameter should be set"
                );
            }, this));

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();

        },
    });

    Y.Test.Runner.add(universalDiscoveryRelationTest);

    tapTest = new Y.Test.Case({
        name: "eZ Relation list tap test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.destinationContent1 = new Y.Mock();
            this.destinationContent1ToJSON = {anythingJSONed: 'somethingJSONed'};

            Y.Mock.expect(this.destinationContent1, {
                method: 'toJSON',
                returns: this.destinationContent1ToJSON
            });
            Y.Mock.expect(this.destinationContent1, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (arg) {
                    if ( arg == 'contentId' ) {
                        return 45;
                    } else if ( arg == 'id') {
                        return "/api/ezp/v2/content/objects/45";
                    } else {
                        Y.Assert.fail('argument for get() not expected');
                    }
                }
            });
            this.destinationContent2 = new Y.Mock();
            this.destinationContent2ToJSON = {anythingJSONed2: 'somethingJSONed2'};

            Y.Mock.expect(this.destinationContent2, {
                method: 'toJSON',
                returns: this.destinationContent2ToJSON
            });
            Y.Mock.expect(this.destinationContent2, {
                method: 'get',
                args: [Y.Mock.Value.String],
                run: function (arg) {

                    if ( arg == 'contentId' ) {
                        return 42;
                    } else if ( arg == 'id') {
                        return "/api/ezp/v2/content/objects/42";
                    } else {
                        Y.Assert.fail('argument for get() not expected');
                    }
                }
            });

            this.relatedContents = [this.destinationContent1, this.destinationContent2];
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelationlist",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false,
                fieldSettings: {},
            };
            this.field = {fieldValue: {destinationContentIds: [45, 42]}};

            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Y.Mock();
            this.version = new Y.Mock();
            this.contentType = new Y.Mock();
            Y.Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Y.Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Y.Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });

            this.view = new Y.eZ.RelationListEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                relatedContents: this.relatedContents,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should prevent default behaviour of the tap event for select button": function () {
            var that = this;

            this.view.render();
            this.view.get('container').once('tap', function (e) {
                that.resume(function () {
                    Y.Assert.isTrue(
                        !!e.prevented,
                        "The tap event should have been prevented"
                    );
                });
            });
            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should remove the relation related to the remove button when it is tapped": function () {
            var that = this,
                contentId = 42;

            this.view.get('container').once('tap', function (e) {
                that.resume(function () {
                    Y.Assert.isTrue(
                        !!e.prevented,
                        "The tap event should have been prevented"
                    );

                    Y.ArrayAssert.doesNotContain(
                        contentId,
                        that.view.get('destinationContentsIds'),
                        "The contentId of the relation removed should be deleted"
                    );
                });
            });
            this.view.get('container').one('button[data-content-id="/api/ezp/v2/content/objects/'+ contentId +'"]').simulateGesture('tap');
            this.wait();
        },

        "Should render the view and make the table disapear when we remove the last relation": function () {
            var that = this,
                contentId = 42;

            this.view.set('relatedContents', [this.destinationContent2]);
            this.view.render();
            that.view.template = function () {
                that.resume(function () {
                    Y.Assert.isNull(that.view.get('container').one('.ez-relationlist-contents'), 'The relation list table should have disapeared');
                });
            };
            this.view.get('container').one('button[data-content-id="/api/ezp/v2/content/objects/'+ contentId +'"]').simulateGesture('tap');
            this.wait();
        },

        "Should remove the table row of the relation when we tap on its remove button ": function () {
            var that = this,
                contentId = 42;

            this.view.set('relatedContents', [this.destinationContent1, this.destinationContent2]);
            this.view.render();
            that.view.get('container').onceAfter(['webkitTransitionEnd', 'transitionend'], Y.bind(function () {
                that.resume(function () {
                    Y.Assert.isNull(
                        that.view.get('container').one('tr[data-content-id="' + contentId + '"]'),
                        'The relation table row should have disapeared');
                });
            }, this));

            this.view.get('container').one('button[data-content-id="/api/ezp/v2/content/objects/'+ contentId +'"]').simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.add(tapTest);

    loadObjectRelationsTest = new Y.Test.Case({
        name: "eZ Relations list loadObjectRelations event test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelationlist",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false
            };
            this.field = {fieldValue: {destinationContentIds: [45, 42]}};
            this.content = {};

            this.view = new Y.eZ.RelationListEditView({
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                content: this.content,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the loadObjectRelations event": function () {
            var loadContentEvent = false;

            this.view.on('loadObjectRelations', Y.bind(function (e) {
                Y.Assert.areSame(
                    this.fieldDefinitionIdentifier,
                    e.fieldDefinitionIdentifier,
                    "fieldDefinitionIdentifier is the same than the one in the field"
                );
                Y.Assert.areSame(
                    this.content,
                    e.content,
                    "The content should be provided in the event facade"
                );

                loadContentEvent = true;
            }, this));
            this.view.set('active', true);

            Y.Assert.isTrue(loadContentEvent, "loadObjectRelations event should be fired when getting active");
        },

        "Should NOT fire the loadObjectRelations event if field is empty": function () {
            var loadContentEvent = false,
                that = this;

            this.view.on('loadObjectRelations', function (e) {
                Y.Assert.areSame(
                    that.fieldDefinitionIdentifier,
                    e.fieldDefinitionIdentifier,
                    "fieldDefinitionIdentifier is the same than the one in the field"
                );
                loadContentEvent = true;
            });
            this.view._set('destinationContentsIds', null);
            this.view.set('active', true);

            Y.Assert.isFalse(loadContentEvent, "loadContentEvent should NOT be called when changing active value");
        },
    });

    Y.Test.Runner.add(loadObjectRelationsTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.RelationListEditView,
            value: {destinationContentsIds: [45, 42]},
            newValue: [45, 42],

            _setNewValue: function () {
                this.view._set("destinationContentsIds", this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'fieldValue should be an object');
                Y.Assert.areEqual(this.newValue, fieldValue.destinationContentIds,  msg);
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.RelationListEditView,
            value: {destinationContentsIds: null},
            newValue: null,

            _setNewValue: function () {
                this.view._set("destinationContentsIds", this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'fieldValue should be an object');
                Y.Assert.areEqual(this.newValue, fieldValue.destinationContentIds,  msg);
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Relation List Edit View registration test";
    registerTest.viewType = Y.eZ.RelationListEditView;
    registerTest.viewKey = "ezobjectrelationlist";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'node-event-simulate', 'editviewregister-tests', 'ez-relationlist-editview']});
