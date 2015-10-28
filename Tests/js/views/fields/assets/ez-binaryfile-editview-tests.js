/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binaryfile-editview-tests', function (Y) {
    var viewTest, registerTest, binaryfileSetterTest,
        buttonsTest, warningTest, renderingTest,
        validateTest, pickBinaryFileTest, dndTest,
        getFieldNotUpdatedTest, getFieldUpdatedEmptyTest,
        getFieldUpdatedTest, getFieldUpdatedNoDataTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseViewTest, {
            name: "eZ BinaryFile View test",
            ViewConstructor: Y.eZ.BinaryFileEditView,
            fileTemplateVariable: "binaryfile",
        })
    );

    binaryfileSetterTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseFileSetterTest, {
            name: "eZ BinaryFile View binaryfile attribute setter test",
            ViewConstructor: Y.eZ.BinaryFileEditView,

            "Should handle a field value": function () {
                var binaryfile;

                this.field = {
                    fieldValue: {
                        uri: 'path/to/little.ogg',
                        fileName: 'Oasis - Little by little.ogg',
                        mimeType: "audio/ogg",
                        fileSize: 4002455,
                    }
                };
                this._initView();

                binaryfile = this.view.get('file');
                Assert.isObject(binaryfile, 'The binaryfile attr should be an object');
                Assert.areEqual(
                    this.field.fieldValue.uri,
                    binaryfile.uri,
                    "The binaryfile object should get a originalUri property"
                );
                Assert.areEqual(
                    this.field.fieldValue.fileName,
                    binaryfile.name,
                    "The binaryfile object should get a name property"
                );
                Assert.areEqual(
                    this.field.fieldValue.fileSize,
                    binaryfile.size,
                    "The binaryfile object should get a size property"
                );
                Assert.areEqual(
                    this.field.fieldValue.mimeType,
                    binaryfile.type,
                    "The binaryfile object should get a type property"
                );
                Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
            },

            "Should handle a literal object": function () {
                var binaryfile,
                    value = {
                        uri: 'path/to/little.ogg',
                        name: 'Oasis - Little by little.ogg',
                        type: "audio/ogg",
                        size: 4002455,
                        data: "base64content",
                    };

                this._initView();
                this.view._set('file', value);

                binaryfile = this.view.get('file');
                Assert.areSame(value, binaryfile, "The binaryfile attr should store the object");
                Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
            },

            "Should revoke the uri of the previous entry": function () {
                var value = {
                        uri: 'path/to/little.ogg',
                        name: 'Oasis - Little by little.ogg',
                        type: "audio/ogg",
                        size: 4002455,
                        data: "base64content",
                    },
                    value2 = {
                        uri: 'path/to/supersonic.ogg',
                        name: 'Oasis - Supersonic.ogg',
                        type: "audio/ogg",
                        size: 4002456,
                        data: "base64content2",
                    };


                this._initView();
                this.view._set('file', value);
                this.view._set('file', value2);

                Assert.isTrue(this.revokeCalled, "revokeObjectURL should have been called");
                Assert.areEqual(
                    value.uri, this.revokeUri,
                    "The previous displayUri should have been revoked"
                );
            },
        })
    );

    buttonsTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseButtonTests, {
            name: "eZ BinaryFile View buttons test",
            field: {
                fieldValue: {
                    uri: "path/to/file.jpg"
                },
            },
            ViewConstructor: Y.eZ.BinaryFileEditView,
        })
    );

    warningTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseWarningTest, {
            name: "eZ BinaryFile View warning test",
            ViewConstructor: Y.eZ.BinaryFileEditView,
        })
    );

    validateTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseValidateTest, {
            name: "eZ BinaryFile View binaryfile validate test",
            ViewConstructor: Y.eZ.BinaryFileEditView,
        })
    );

    pickBinaryFileTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBasePickFileTest, {
            name: "eZ BinaryFile View pick file test",
            ViewConstructor: Y.eZ.BinaryFileEditView,
        })
    );

    getFieldNotUpdatedTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            _should: {
                ignore: {
                    "Test getField": true,
                }
            },
            fieldDefinition: {isRequired: false},
            fieldValue: null,
            ViewConstructor: Y.eZ.BinaryFileEditView,

            _setNewValue: function () {

            },

            "Should return undefined": function () {
                this.view.render();
                this._setNewValue();

                Assert.isUndefined(
                    this.view.getField(),
                    "getField should return undefined"
                );
            }
        })
    );

    getFieldUpdatedEmptyTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            fieldDefinition: {isRequired: false},
            fieldValue: null,
            newValue: null,
            ViewConstructor: Y.eZ.BinaryFileEditView,

            _setNewValue: function () {
                this.view._set('updated', true);
            },
        })
    );

    getFieldUpdatedTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            version: new Y.Model(),
            fieldDefinition: {isRequired: false},
            fieldValue: {
                fileName: "original.jpg",
                url: "some url",
                mimeType: "food/tartiflette"
            },
            newValue: {
                name: "me.jpg",
                data: "base64 content",
            },
            ViewConstructor: Y.eZ.BinaryFileEditView,

            _afterSetup: function () {
                var that = this,
                    win = Y.config.win;

                this.originalURL = win.URL;
                win.URL = {};
                win.URL.revokeObjectURL = function (uri) {
                    // phantomjs seems to not support window.URL
                    if ( that.originalURL && that.originalURL.revokeObjectURL ) {
                        that.originalURL.revokeObjectURL(uri);
                    }
                };
            },

            _afterTearnDown: function () {
                Y.config.win.URL = this.originalURL;
            },

            _setNewValue: function () {
                this.view._set('file', this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Assert.areNotSame(
                    this.view.get('field').fieldValue,
                    fieldValue,
                    "The original field value should be cloned"
                );
                Assert.areEqual(this.newValue.name, fieldValue.fileName, msg);
                Assert.areEqual(this.newValue.data, fieldValue.data, msg);
                Assert.isUndefined(fieldValue.url, msg);
                Assert.isUndefined(fieldValue.mimeType, msg);
            },

            "Should reset the updated attribute after version save": function () {
                this.view.render();
                this._setNewValue();

                this.view.getField();

                Assert.isTrue(this.view.get('updated'), "The updated attribute should be true");
                this.version.fire('save');
                Assert.isFalse(this.view.get('updated'), "The updated attribute should be false");
            },
        })
    );

    getFieldUpdatedNoDataTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            version: new Y.Model(),
            fieldDefinition: {isRequired: false},
            fieldValue: {
                fileName: "original.jpg",
            },
            newValue: {
                name: "me.jpg",
            },
            ViewConstructor: Y.eZ.BinaryFileEditView,

            _afterSetup: function () {
                var that = this,
                    win = Y.config.win;

                this.originalURL = win.URL;
                win.URL = {};
                win.URL.revokeObjectURL = function (uri) {
                    // phantomjs seems to not support window.URL
                    if ( that.originalURL && that.originalURL.revokeObjectURL ) {
                        that.originalURL.revokeObjectURL(uri);
                    }
                };
            },

            _afterTearnDown: function () {
                Y.config.win.URL = this.originalURL;
            },

            _setNewValue: function () {
                this.view._set('file', this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Assert.areEqual(this.newValue.name, fieldValue.fileName, msg);
            },

            "Should reset the updated attribute after version save": function () {
                this.view.render();
                this._setNewValue();

                this.view.getField();

                Assert.isTrue(this.view.get('updated'), "The updated attribute should be true");
                this.version.fire('save');
                Assert.isFalse(this.view.get('updated'), "The updated attribute should be false");
            },
        })
    );

    renderingTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseRenderingTest, {
            name: "eZ BinaryFile View rendering tests",
            ViewConstructor: Y.eZ.BinaryFileEditView,

            "Should add classes based on the mime type": function () {
                this.field = {
                    fieldValue: {
                        fileName: "little.ogg",
                        mimeType: "audio/ogg whatever.special-chars_in_it",
                    }
                };
                this._initView();
                this.view.render();

                Assert.isTrue(
                    this.view.get('container').hasClass('is-type-audio'),
                    "The container should get the is-type-audio class"
                );
                Assert.isTrue(
                    this.view.get('container').hasClass('is-mimetype-audio-ogg-whatever-special-chars-in-it'),
                    "The container should get a sanitized class based on the full mimetype"
                );
            },

            "Should remove the previously added mime type based class": function () {
                this["Should add classes based on the mime type"]();
                this.view._set('file', null);

                Assert.isFalse(
                    this.view.get('container').hasClass('is-type-audio'),
                    "The container should not get the is-type-audio class anymore"
                );
                Assert.isFalse(
                    this.view.get('container').hasClass('is-mimetype-audio-ogg-whatever-special-chars-in-it'),
                    "The container should not get a class based on the full mimetype anymore"
                );
            },

            "Should update the rendered view": function () {
                var c,
                    newBinaryFile = {
                        name: "little.ogg",
                        size: 4654556,
                        type: "audio/ogg",
                        uri: this.createdUrl,
                    };

                this["Should disable the remove button"]();
                c = this.view.get('container');

                this.view._set('file', newBinaryFile);

                Assert.isFalse(
                    this.view.get('container').one('.ez-button-delete').get('disabled'),
                    "The remove button should be disabled"
                );
                Assert.areEqual(
                    newBinaryFile.name, c.one(".ez-binaryfile-properties-name").getContent(),
                    "The binaryfile name should be updated"
                );
                Assert.areEqual(
                    newBinaryFile.size, c.one(".ez-binaryfile-properties-size").getContent(),
                    "The binaryfile size should be updated"
                );
                Assert.areEqual(
                    newBinaryFile.type, c.one(".ez-binaryfile-properties-type").getContent(),
                    "The binaryfile type should be updated"
                );
                Assert.areEqual(
                    this.createdUrl, c.one(".ez-binaryfile-download").getAttribute('href'),
                    "The view original link should be updated"
                );
            },
        })
    );

    dndTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseDragAndDropTest, {
            name: "eZ BinaryFile edit view drag and drop tests",
            ViewConstructor: Y.eZ.BinaryFileEditView,
        })
    );

    Y.Test.Runner.setName("eZ BinaryFile Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(binaryfileSetterTest);
    Y.Test.Runner.add(buttonsTest);
    Y.Test.Runner.add(warningTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(pickBinaryFileTest);
    Y.Test.Runner.add(renderingTest);
    Y.Test.Runner.add(dndTest);
    Y.Test.Runner.add(getFieldNotUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedEmptyTest);
    Y.Test.Runner.add(getFieldUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedNoDataTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "BinaryFile Edit View registration test";
    registerTest.viewType = Y.eZ.BinaryFileEditView;
    registerTest.viewKey = "ezbinaryfile";

    Y.Test.Runner.add(registerTest);

}, '', {
    requires: [
        'test', 'model', 'event-valuechange', 'node-event-simulate', 'ez-binaryfile-editview',
        'getfield-tests', 'editviewregister-tests', 'binarybase-tests',
    ]
});
