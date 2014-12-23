/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binaryfile-editview-tests', function (Y) {
    var viewTest, registerTest, binaryfileSetterTest,
        buttonsTest, warningTest, renderingTest,
        validateTest, pickBinaryFileTest,
        getFieldNotUpdatedTest, getFieldUpdatedEmptyTest,
        getFieldUpdatedTest, getFieldUpdatedNoDataTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case({
        name: "eZ BinaryFile View test",

        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = {fieldValue: null};
            this.jsonContent = {};
            this.jsonContentType = {};
            this.jsonVersion = {};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: this.jsonContent
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: this.jsonVersion
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: this.jsonContentType
            });
        },

        _initView: function () {
            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        _testAvailableVariables: function (required, expectRequired, expectedIsEmpty) {
            var fieldDefinition = this._getFieldDefinition(required),
                view,
                that = this;

            this._initView();
            view = this.view;
            view.set('fieldDefinition', fieldDefinition);
            view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(7, Y.Object.keys(variables).length, "The template should receive 7 variables");

                Assert.areSame(
                     that.jsonContent, variables.content,
                    "The content should be available in the field edit view template"
                );
                Assert.areSame(
                     that.jsonVersion, variables.version,
                    "The version should be available in the field edit view template"
                );
                Assert.areSame(
                    that.jsonContentType, variables.contentType,
                    "The contentType should be available in the field edit view template"
                );
                Assert.areSame(
                    fieldDefinition, variables.fieldDefinition,
                    "The fieldDefinition should be available in the field edit view template"
                );
                Assert.areSame(
                    that.field, variables.field,
                    "The field should be available in the field edit view template"
                );
                Assert.areSame(
                    view.get('file'), variables.binaryfile,
                    "The binaryfile struct should be available in the field edit view template"
                );

                Assert.areSame(expectRequired, variables.isRequired);

                return '';
            };
            this.view.render();
        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false, true);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true, true);
        },

        "Test filled binaryfile": function () {
            this.field = {
                fieldValue: {
                    fileName: 'troll.jpg',
                    fileSize: 42,
                    originalUri: '/path/to/troll.jpg',
                    alternativeText: "Vilain Troll",
                }
            };

            this._testAvailableVariables(false, false, false);
        },
    });

    binaryfileSetterTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile attribute setter test",

        setUp: function () {
            var that = this,
                win = Y.config.win;

            this.field = {fieldValue: null};
            this.fieldDefinition = {isRequired: false};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });
            this.revokeCalled = false;
            this.revokeUri = "";

            this.originalURL = win.URL;
            win.URL = {};
            win.URL.revokeObjectURL = function (uri) {
                that.revokeCalled = true;
                that.revokeUri = uri;
                // phantomjs seems to not support window.URL
                if ( that.originalURL && that.originalURL.revokeObjectURL ) {
                    that.originalURL.revokeObjectURL(uri);
                }
            };
        },

        _initView: function () {
            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            Y.config.win.URL = this.originalURL;
        },

        "Should handle a null field value": function () {
            this._initView();
            Assert.isNull(this.view.get('file'), 'The binaryfile attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should handle a null value": function () {
            this._initView();
            this.view._set('file', null);
            Assert.isNull(this.view.get('file'), 'The binaryfile attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

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

        "Should reject unrecognized value": function () {
            this._initView();
            this.view._set('file', undefined);
            Assert.isNull(this.view.get('file'), "The type property should be null");
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
    });

    buttonsTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile buttons test",

        setUp: function () {
            var win = Y.config.win,
                that = this;

            this.field = {
                fieldValue: {
                    uri: "path/to/file.jpg"
                },
            };
            this.fieldDefinition = {isRequired: false};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.originalURL = win.URL;
            win.URL = {};
            win.URL.revokeObjectURL = function (uri) {
                // phantomjs seems to not support window.URL
                if ( that.originalURL && that.originalURL.revokeObjectURL ) {
                    that.originalURL.revokeObjectURL(uri);
                }
            };

            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            Y.config.win.URL = this.originalURL;
        },

        "Should remove the binaryfile": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.render();

            this.view._set('warning', "Test warning");
            container.one('.ez-button-delete').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('warning'), "The warning should be set to false"
                    );
                    Assert.isNull(
                        this.view.get('file'), "The binaryfile attribute should be null"
                    );
                });
            });
            this.wait();
        },

        "Should open the select file window": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.render();

            container.one('.ez-filebased-input-file').on('click', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('warning'), "The warning should be set to false"
                    );
                });
            });

            this.view._set('warning', "Test warning");
            container.one('.ez-button-upload').simulateGesture('tap');
            this.wait();
        },
    });

    warningTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile warning test",

        setUp: function () {
            this.field = {
                fieldValue: null
            };
            this.fieldDefinition = {isRequired: false};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should show the warning box": function () {
            var text = 'Et hop!',
                container = this.view.get('container');

            this.view.render();
            this.view._set('warning', text);
            Assert.isTrue(
                container.hasClass('has-warning'),
                "The container should get the has-warning class"
            );
        },

        "Should hide the warning box": function () {
            var text = 'Et hop!',
                that = this,
                container = this.view.get('container');

            this.view.render();
            this.view._set('warning', text);

            container.one('.ez-filebased-warning-hide').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        container.hasClass('has-warning'),
                        "The container should not have the has-warning class"
                    );
                    Assert.isFalse(
                        this.view.get('warning'),
                        "The warning should be set to false"
                    );
                });
            });
            this.wait();
        }
    });

    validateTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile validate test",

        setUp: function () {
            this.field = {
                fieldValue: null
            };
            this.fieldDefinition = {isRequired: true};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });
        },

        _initView: function () {
            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test not required empty": function () {
            this.fieldDefinition.isRequired = false;
            this.field.fieldValue = null;
            this._initView();
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "An empty value is valid"
            );
        },

        "Test required empty": function () {
            this.fieldDefinition.isRequired = true;
            this.field.fieldValue = null;
            this._initView();
            this.view.validate();

            Assert.isFalse(
                this.view.isValid(),
                "An empty value is invalid"
            );
        },
        
        "Test not required not empty": function () {
            this.fieldDefinition.isRequired = false;
            this.field.fieldValue = {
                uri: "path/to/file.jpg",
                fileName: "file.jpg",
            };
            this._initView();
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A not empty value is valid"
            );
        },

        "Test required not empty": function () {
            this.fieldDefinition.isRequired = true;
            this.field.fieldValue = {
                uri: "path/to/file.jpg",
                fileName: "file.jpg",
            };
            this._initView();
            this.view.validate();

            Assert.isTrue(
                this.view.isValid(),
                "A not empty value is valid"
            );
        },
    });

    pickBinaryFileTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile pick binaryfile test",

        setUp: function () {
            var that = this, win = Y.config.win;

            this.field = {
                fieldValue: null
            };
            this.maxSize = 10;
            this.fieldDefinition = {
                isRequired: false,
                validatorConfiguration: {
                    FileSizeValidator: {
                        maxFileSize: this.maxSize
                    }
                }
            };
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
            this.view._set('fileReader', new Mock());
            this.originalURL = win.URL;
            win.URL = {};
            win.URL.createObjectURL = function (uri) {
                // phantomjs seems to not support window.URL
                if ( that.originalURL && that.originalURL.createObjectURL ) {
                    that.originalURL.revokeObjectURL(uri);
                }
            };
        },

        tearDown: function () {
            this.view.destroy();
            Y.config.win.URL = this.originalURL;
        },

        // PhantomJS is not able to programmatically set the value of an input
        // file element, so we are forced to directly call the protected change
        // event handler. Those tests are inspired by the Y.Uploader tests, see
        // https://github.com/yui/yui3/blob/master/src/uploader/tests/unit/uploaderhtml5.html
        "Should refuse the file": function () {
            var fileReader = this.view.get('fileReader'),
                eventFacade = new Y.DOMEventFacade({
                    type: 'change'
                });

            eventFacade.target = new Mock();
            Mock.expect(fileReader, {
                method: 'readAsDataURL',
                callCount: 0,
            });
            Mock.expect(eventFacade.target, {
                method: 'getDOMNode',
                returns: {files: [{size: 50 * 1024 * 1024, name: "file.jpg", type: "binaryfile/jpg"}]},
            });
            Mock.expect(eventFacade.target, {
                method: 'set',
                args: ['value', ''],
            });

            this.view.render();
            this.view._updateFile(eventFacade);
            Assert.isString(
                this.view.get('warning'),
                "A warning should have been generated"
            );
            Mock.verify(eventFacade);
            Mock.verify(fileReader);
        },

        "Should read the file": function () {
            var fileReader = this.view.get('fileReader'),
                fileContent = "base64 binaryfile content",
                file = {size: 5 * 1024 * 1024, name: "file.jpg", type: "audio/ogg"},
                base64ImgContent = "data;" + file.type + ";base64," + fileContent,
                binaryfile,
                eventFacade = new Y.DOMEventFacade({
                    type: 'change'
                });

            eventFacade.target = new Mock();
            Mock.expect(eventFacade.target, {
                method: 'getDOMNode',
                returns: {files: [file]},
            });
            Mock.expect(eventFacade.target, {
                method: 'set',
                args: ['value', ''],
            });
            Mock.expect(fileReader, {
                method: 'readAsDataURL',
                args: [file],
                run: function (f) {
                    fileReader.result = base64ImgContent;
                    fileReader.onload();
                }
            });

            this.view.render();
            this.view._updateFile(eventFacade);
            Assert.isFalse(
                this.view.get('warning'),
                "The warning attribute should stay false"
            );
            binaryfile = this.view.get('file');

            Assert.areEqual(
                fileContent, binaryfile.data,
                "The binaryfile content should be available in the binaryfile attribute"
            );
            Assert.areEqual(
                file.name, binaryfile.name,
                "The binaryfile name should be available in the binaryfile attribute"
            );
            Assert.areEqual(
                file.size, binaryfile.size,
                "The binaryfile size should be available in the binaryfile attribute"
            );
            Assert.areEqual(
                file.type, binaryfile.type,
                "The binaryfile type should be available in the binaryfile attribute"
            );
            Assert.isUndefined(
                fileReader.onload,
                "The onload handler should be resetted"
            );
        },

        "Should read the file (no max size)": function () {
            this.view.get('fieldDefinition').validatorConfiguration.FileSizeValidator.maxFileSize = false;
            this["Should read the file"]();
        }
    });

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
                Assert.areEqual(this.newValue.name, fieldValue.fileName, msg);
                Assert.areEqual(this.newValue.size, fieldValue.fileSize, msg);
                Assert.areEqual(this.newValue.data, fieldValue.data, msg);
                Assert.areEqual(this.fieldValue.alternativeText, fieldValue.alternativeText, msg);
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
                Assert.areEqual(this.newValue.size, fieldValue.fileSize, msg);
                Assert.areEqual(this.fieldValue.alternativeText, fieldValue.alternativeText, msg);
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

    renderingTest = new Y.Test.Case({
        name: "eZ BinaryFile View binaryfile rendering tests",

        setUp: function () {
            var win = Y.config.win, that = this;

            this.field = {};
            this.fieldDefinition = {isRequired: false};
            this.content = new Mock();
            this.version = new Mock();
            this.contentType = new Mock();
            Mock.expect(this.content, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.version, {
                method: 'toJSON',
                returns: {}
            });
            Mock.expect(this.contentType, {
                method: 'toJSON',
                returns: {}
            });

            this.originalURL = win.URL;
            win.URL = {};
            win.URL.revokeObjectURL = function (uri) {
                // phantomjs seems to not support window.URL
                if ( that.originalURL && that.originalURL.revokeObjectURL ) {
                    that.originalURL.revokeObjectURL(uri);
                }
            };
            this.createdUrl = "data:binaryfile/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        },

        _initView: function () {
            this.view = new Y.eZ.BinaryFileEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            Y.config.win.URL = this.originalURL;
            this.view.destroy();
            this.view.get('container').setAttribute('class', 'container');
        },

        "Should add the empty class": function () {
            this.field = {fieldValue: null};
            this._initView();
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass('is-field-empty'),
                "The container should get the is-field-empty class"
            );
        },

        "Should remove the empty class": function () {
            this["Should add the empty class"]();
            this.view._set('file', {name: "file.jpg", uri: "path/to/file.jpg"});

            Assert.isFalse(
                this.view.get('container').hasClass('is-field-empty'),
                "The container should not get the is-field-empty class"
            );
        },

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
            console.log(this.view.get('container').getAttribute('class'));
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

        "Should disable the remove button": function () {
            this.field = {fieldValue: {name: "file.jpg"}};
            this._initView();
            this.view.render();

            this.view._set('file', null);

            Assert.isTrue(
                this.view.get('container').one('.ez-button-delete').get('disabled'),
                "The remove button should be disabled"
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
    });

    Y.Test.Runner.setName("eZ BinaryFile Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(binaryfileSetterTest);
    Y.Test.Runner.add(buttonsTest);
    Y.Test.Runner.add(warningTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(pickBinaryFileTest);
    Y.Test.Runner.add(renderingTest);
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
    requires: ['test', 'model', 'event-valuechange', 'node-event-simulate', 'getfield-tests', 'editviewregister-tests', 'ez-binaryfile-editview']
});
