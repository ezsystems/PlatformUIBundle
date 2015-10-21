/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-relation-editview-tests', function (Y) {
    var viewTest, registerTest, getFieldTest, getEmptyFieldTest;

    viewTest = new Y.Test.Case({
        name: "eZ Relation View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.destinationContent = new Y.Mock();
            this.destinationContentToJSON = {anythingJSONed: 'somethingJSONed'};
            Y.Mock.expect(this.destinationContent, {
                method: 'toJSON',
                returns: this.destinationContentToJSON
            });
            Y.Mock.expect(this.destinationContent, {
                method: 'get',
                args: ['contentId'],
                returns: 45
            });
            this.fieldDefinitionIdentifier= "niceField";
            this.fieldDefinition = {
                fieldType: "ezobjectrelation",
                identifier: this.fieldDefinitionIdentifier,
                isRequired: false
            };
            this.field = {fieldValue: {destinationContentId: 45}};

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

            this.view = new Y.eZ.RelationEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                content: this.content,
                version: this.version,
                contentType: this.contentType,
                destinationContent: this.destinationContent,
            });
            this.view.set('destinationContent', this.destinationContent);
            this.view.set('loadingError', this.loadingError);
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired) {
            var fieldDefinition = this._getFieldDefinition(required),
                that = this;

            this.view.set('fieldDefinition', fieldDefinition);

            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(9, Y.Object.keys(variables).length, "The template should receive 9 variables");
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
                Y.Assert.areSame(
                    that.destinationContentToJSON, variables.destinationContent,
                    "The field should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    that.view.get('loadingError'), variables.loadingError,
                    "The field should be available in the field edit view template"
                );
                Y.Assert.areSame(
                    !that.field.fieldValue.destinationContentId, variables.isEmpty,
                    "The field should be available in the field edit view template"
                );


                Y.Assert.areSame(expectRequired, variables.isRequired);
                return '';
            };
            this.view.render();
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true);
        },

        "Test validate no constraints": function () {
            var fieldDefinition = this._getFieldDefinition(false);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view.set('destinationContent', null);
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
            this.view._set('destinationContent', null);
            this.view.validate();
            this.view.render();

            Y.Assert.isFalse(
                this.view.isValid(),
                "An empty relation is NOT valid"
            );
        },

        "Should fill the destinationcontentId attribute from the field": function () {
            Y.Assert.areSame(
                this.view.get('field').fieldValue.destinationContentId,
                this.view.get('destinationContentId'),
                "The destinationContentId of the field value should be the same than the attribute"
            );
        },

        "Should fire the loadFieldRelatedContent event": function () {
            var loadContentEvent = false,
                that = this;

            this.view.on('loadFieldRelatedContent', function (e) {
                Y.Assert.areSame(
                    that.fieldDefinitionIdentifier,
                    e.fieldDefinitionIdentifier,
                    "fieldDefinitionIdentifier is the same than the one in the field"
                );
                loadContentEvent = true;
            });
            this.view.set('active', true);

            Y.Assert.isTrue(loadContentEvent, "loadContentEvent should be called when changing active value");
        },

        "Should NOT fire the loadFieldRelatedContent event if field is empty": function () {
            var loadContentEvent = false,
                that = this;

            this.view.on('loadFieldRelatedContent', function (e) {
                Y.Assert.areSame(
                    that.fieldDefinitionIdentifier,
                    e.fieldDefinitionIdentifier,
                    "fieldDefinitionIdentifier is the same than the one in the field"
                );
                loadContentEvent = true;
            });
            this.view._set('destinationContentId', null);
            this.view.set('active', true);

            Y.Assert.isFalse(loadContentEvent, "loadContentEvent should NOT be called when changing active value");
        },

        "Should run the UniversalDiscoveryWidget": function () {
            var that = this;

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    Y.Assert.isObject(e.config, "contentDiscover config should be an object");
                    Y.Assert.isFunction(e.config.contentDiscoveredHandler, "config should have a function named contentDiscoveredHandler");
                    Y.Assert.isFunction(e.config.cancelDiscoverHandler, "config should have a function named cancelDiscoverHandler");
                });
            });

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
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

        "Should prevent default behaviour of the tap event for remove button": function () {
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
            this.view.get('container').one('.ez-relation-remove').simulateGesture('tap');
            this.wait();
        },

        "Should remove relation when tap on remove button": function () {
            var that = this;

            this.view.render();
            this.view.get('container').once('tap', function (e) {
                that.resume(function () {
                    Y.Assert.isNull(
                        this.view.get('destinationContentId'),
                        "destinationContentId should be null"
                    );
                    Y.Assert.isNull(
                        this.view.get('destinationContent'),
                        "destinationContent should be null"
                    );
                    Y.Assert.isTrue(
                        this.view.get('container').one('.ez-relation-remove').get('disabled'),
                        'Remove button should be disabled'
                    );
                });
            });
            this.view.get('container').one('.ez-relation-remove').simulateGesture('tap');
            this.wait();
        },

        "Should fill the relation with the universal discovery widget selection": function () {
            var that = this,
                contentInfoMock = new Y.Mock(),
                fakeEventFacade = {selection: {contentInfo: contentInfoMock}};

            Y.Mock.expect(contentInfoMock, {
                method: 'toJSON',
                returns: {name: 'me', publishedDate: 'yesterday', lastModificationDate: 'tomorrow'}
            });

            Y.Mock.expect(contentInfoMock, {
                method: 'get',
                args: ['contentId'],
                returns: 51
            });
            this.view.on('contentDiscover', function (e) {
                that.resume(function () {

                    e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
                    Y.Assert.areSame(
                        contentInfoMock.get('contentId'),
                        this.view.get('destinationContentId'),
                        'destinationContentId should match the contentId of the selected relation'
                    );
                    Y.Assert.areSame(
                        contentInfoMock,
                        this.view.get('destinationContent'),
                        'destinationContent should match the content of the selected relation'
                    );
                    Y.Assert.isFalse(
                        this.view.get('container').one('.ez-relation-remove').get(('disabled')),
                        'Remove button should be disabled'
                    );
                });
            });

            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should validate when the universal discovery is canceled (empty relation)": function () {
            var that = this,
                fieldDefinition = this._getFieldDefinition(true);

            this.view.set('fieldDefinition', fieldDefinition);
            this.view._set('destinationContentId', null);

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.cancelDiscoverHandler.call(this);
                    Y.Assert.areSame(this.view.get('errorStatus'),
                        'This field is required',
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
            this.view._set('destinationContentId', 51);

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.cancelDiscoverHandler.call(this);
                    Y.Assert.isFalse(this.view.get('errorStatus'),'errorStatus should be false');
                });
            });
            this.view.get('container').one('.ez-relation-discover').simulateGesture('tap');
            this.wait();
        },

        "Should render the view when the destinationContent attribute changes": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('destinationContent', this.destinationContent);
            Y.Assert.isTrue(templateCalled, "The template has not been used");
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
    });

    Y.Test.Runner.setName("eZ Relation Edit View tests");
    Y.Test.Runner.add(viewTest);

    getFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.RelationEditView,
            value: {destinationContentId: 45},
            newValue: 45,

            _setNewValue: function () {
                this.view._set("destinationContentId", this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'fieldValue should be an object');
                Y.Assert.areEqual(this.newValue, fieldValue.destinationContentId,  msg);
            },
        })
    );
    Y.Test.Runner.add(getFieldTest);

    getEmptyFieldTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            ViewConstructor: Y.eZ.RelationEditView,
            value: {destinationContentId: null},
            newValue: null,

            _setNewValue: function () {
                this.view._set("destinationContentId", this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Y.Assert.isObject(fieldValue, 'fieldValue should be an object');
                Y.Assert.areEqual(this.newValue, fieldValue.destinationContentId,  msg);
            },
        })
    );
    Y.Test.Runner.add(getEmptyFieldTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Relation Edit View registration test";
    registerTest.viewType = Y.eZ.RelationEditView;
    registerTest.viewKey = "ezobjectrelation";
    Y.Test.Runner.add(registerTest);
}, '', {requires: ['test', 'getfield-tests', 'node-event-simulate', 'editviewregister-tests', 'ez-relation-editview']});
