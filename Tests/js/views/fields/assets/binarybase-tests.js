/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('binarybase-tests', function (Y) {
    var Assert = Y.Assert, Mock = Y.Mock;

    Y.namespace('eZ.Test');

    // Rendering test for file based view. This test expects the following
    // properties to be set:
    // - ViewConstructor the constructor function of the view
    // - fileTemplateVariable: the name of the variable holding the `file`
    // attribute in the template
    //
    // And optionally:
    // - templateVariablesCount: the number of expected template variables (7
    // by default)
    // - _additionalVariableAssertions: a method to check additional variables
    // if there are any
    Y.eZ.Test.BinaryBaseViewTest = {
        templateVariablesCount: 7,
        _getFieldDefinition: function (required) {
            return {
                isRequired: required
            };
        },

        setUp: function () {
            this.field = this._getField();
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

        _getField: function () {
            return {fieldValue: null};
        },

        _initView: function () {
            this.view = new this.ViewConstructor({
                container: '.container',
                field: this.field,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _testAvailableVariables: function (required, expectRequired, expectedIsEmpty) {
            var fieldDefinition = this._getFieldDefinition(required),
                view, origTpl,
                that = this;

            this._initView();
            view = this.view;
            view.set('fieldDefinition', fieldDefinition);
            origTpl = view.template;
            view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(
                    that.templateVariablesCount,
                    Y.Object.keys(variables).length,
                    "The template should receive " + this.templateVariablesCount + " variables"
                );

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
                    view.get('file'), variables[that.fileTemplateVariable],
                    "The file struct should be available in the field edit view template"
                );

                Assert.areSame(expectRequired, variables.isRequired);
                that._additionalVariableAssertions.call(that, variables);

                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        _additionalVariableAssertions: function (variables) {

        },

        "Test not required field": function () {
            this._testAvailableVariables(false, false, true);
        },

        "Test required field": function () {
            this._testAvailableVariables(true, true, true);
        },

        "Test filled file": function () {
            this.field = {
                fieldValue: {
                    fileName: 'troll.jpg',
                    mimeType: 'image/jpeg',
                    fileSize: 42,
                    uri: '/path/to/troll.jpg',
                }
            };

            this._testAvailableVariables(false, false, false);
        },
    };

    // Test for the `file` attribute setter. This test expects the
    // ViewConstructor property to be filled with the view constructor function
    // to test.
    Y.eZ.Test.BinaryBaseFileSetterTest = {
        setUp: function () {
            var that = this,
                win = Y.config.win;

            this.field = {fieldValue: null};
            this.fieldDefinition = this._getFieldDefinition();
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

        _getFieldDefinition: function () {
            return {isRequired: false};
        },

        _initView: function () {
            this.view = new this.ViewConstructor({
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
            delete this.view;
            Y.config.win.URL = this.originalURL;
        },

        "Should handle a null field value": function () {
            this._initView();
            Assert.isNull(this.view.get('file'), 'The file attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should handle a null value": function () {
            this._initView();
            this.view._set('file', null);
            Assert.isNull(this.view.get('file'), 'The file attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should reject unrecognized value": function () {
            this._initView();
            this.view._set('file', undefined);
            Assert.isNull(this.view.get('file'), "The file attribute should be null");
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },
    };

    // Test for the remove and upload file buttons. This test expects the
    // following properties to be set:
    // - ViewConstructor the view constructor
    // - field the initial field object
    Y.eZ.Test.BinaryBaseButtonTests = {
        setUp: function () {
            var win = Y.config.win,
                that = this;

            this.fieldDefinition = this._getFieldDefinition();
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

            this.view = new this.ViewConstructor({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        _getFieldDefinition: function () {
            return {isRequired: false};
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            Y.config.win.URL = this.originalURL;
        },

        "Should remove the file": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.render();

            this.view._set('warning', "Test warning");
            container.one('.ez-button-delete').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('warning'), "The warning attribute should be set to false"
                    );
                    Assert.isNull(
                        this.view.get('file'), "The file attribute should be null"
                    );
                });
            });
            this.wait();
        },

        "Should open the select file window": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.render();

            container.one('.ez-binarybase-input-file').on('click', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('warning'), "The warning attribute should be set to false"
                    );
                });
            });

            this.view._set('warning', "Test warning");
            container.one('.ez-button-upload').simulateGesture('tap');
            this.wait();
        },
    };

    // Test for the warning message handling. This test expects the
    // ViewConstructor property to set
    Y.eZ.Test.BinaryBaseWarningTest = {
        setUp: function () {
            this.field = {
                fieldValue: null
            };
            this.fieldDefinition = this._getFieldDefinition();
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

            this.view = new this.ViewConstructor({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        _getFieldDefinition: function () {
            return {isRequired: false};
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
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

            container.one('.ez-binarybase-warning-hide').simulateGesture('tap', function () {
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
    };

    // Test for the validate method. This test expects the ViewConstructor
    // property to be set with the view constructor function
    Y.eZ.Test.BinaryBaseValidateTest = {
        setUp: function () {
            this.field = {
                fieldValue: null
            };
            this.fieldDefinition = this._getFieldDefinition();
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

        _getFieldDefinition: function () {
            return {isRequired: true};
        },

        _initView: function () {
            this.view = new this.ViewConstructor({
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
            delete this.view;
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
    };

    // Test for the validation when the user picks a file.
    // This test expects the ViewConstructor property to be filled with the view
    // constructor function. Optionnaly, the `multiplicator` property can be set
    // to handle the fact the max file size is expressed in byte or megabyte.
    // The default value of multiplicator is suited for max size in megabyte,
    // set it to 1 to handle the case where the max file size is in byte.
    Y.eZ.Test.BinaryBasePickFileTest = {
        multiplicator: 1024*1024, // default max file size in Mb
        setUp: function () {
            var that = this, win = Y.config.win;

            this.field = {
                fieldValue: null
            };
            this.maxSize = 10;
            this.fieldDefinition = this._getFieldDefinition();
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

            this.view = new this.ViewConstructor({
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

        _getFieldDefinition: function () {
            return {
                isRequired: false,
                validatorConfiguration: {
                    FileSizeValidator: {
                        maxFileSize: this.maxSize
                    }
                }
            };
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
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
                returns: {files: [{size: 50 * this.multiplicator, name: "file.jpg", type: "image/jpeg"}]},
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
                file = {size: 5 * this.multiplicator, name: "file.jpg", type: "image/jpeg"},
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
                "The binaryfile content should be available in the file attribute"
            );
            Assert.areEqual(
                file.name, binaryfile.name,
                "The binaryfile name should be available in the file attribute"
            );
            Assert.areEqual(
                file.size, binaryfile.size,
                "The binaryfile size should be available in the file attribute"
            );
            Assert.areEqual(
                file.type, binaryfile.type,
                "The binaryfile type should be available in the file attribute"
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
    };

    Y.eZ.Test.BinaryBaseRenderingTest = {
        setUp: function () {
            var win = Y.config.win, that = this;

            this.field = {};
            this.fieldDefinition = this._getFieldDefinition();
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
            this.createdUrl = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        },

        _getFieldDefinition: function () {
            return {
                isRequired: false,
            };
        },

        _initView: function () {
            this.view = new this.ViewConstructor({
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
            delete this.view;
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
    };


    Y.eZ.Test.BinaryBaseDragAndDropTest = {
        multiplicator: 1024*1024, // default max file size in Mb
        setUp: function () {
            var win = Y.config.win, that = this;

            this.maxSize = 10;
            this.field = {};
            this.fieldDefinition = this._getFieldDefinition();
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
            win.URL.createObjectURL = function (uri) {
                return that.createdUrl;
            };

            this.fileContent = "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
            this.createdUrl = "data:image/gif;base64," + this.fileContent;

            this.view = new this.ViewConstructor({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
        },

        _getFieldDefinition: function () {
            return {
                isRequired: false,
                validatorConfiguration: {
                    FileSizeValidator: {
                        maxFileSize: this.maxSize
                    },
                },
            };
        },

        tearDown: function () {
            Y.config.win.URL = this.originalURL;
            this.view.destroy();
            delete this.view;
        },

        _simulateEvent: function (evtName) {
            var evt = Y.config.doc.createEvent('Event');

            evt.initEvent(evtName, true, true);
            return evt;
        },

        _dragEventTest: function (evtName) {
            var dropArea,
                container = this.view.get('container'),
                facade,
                evt = this._simulateEvent(evtName);

            this.view.render();

            dropArea = container.one('.ez-binarybase-drop-area');
            this.view._set('warning', 'Previous message');
            container.delegate(evtName, function (e) {
                facade = e;
            }, '.ez-binarybase-drop-area', this);
            evt.dataTransfer = {};
            dropArea.getDOMNode().dispatchEvent(evt);
            Assert.isTrue(
                this.view.get('container').hasClass('is-dragging-file'),
                "The view container should get the is-dragging-file class"
            );
            Assert.isFalse(
                this.view.get('warning'),
                "The previous warning message should be removed"
            );
            Assert.isTrue(
                facade._event.defaultPrevented,
                "The " + evtName + " event should be prevented"
            );
            Assert.areEqual(
                "copy", facade._event.dataTransfer.dropEffect,
                "The drop effect should be set to copy"
            );
        },

        "Should handle the dragenter DOM event": function () {
            this._dragEventTest('dragenter');
        },

        "Should handle the dragover DOM event": function () {
            this._dragEventTest('dragover');
        },

        "Should handle the dragleave DOM event": function () {
            var dl = this._simulateEvent('dragleave'),
                dropArea;

            this._dragEventTest('dragenter');

            dropArea = this.view.get('container').one('.ez-binarybase-drop-area');
            dropArea.getDOMNode().dispatchEvent(dl);

            Assert.isFalse(
                this.view.get('container').hasClass('is-dragging-file'),
                "The view container should not get the is-dragging-file class anymore"
            );
        },

        _dropEventWarningTest: function (files) {
            var dropArea,
                container = this.view.get('container'),
                facade,
                evt = this._simulateEvent('drop');

            evt.dataTransfer = {files: files};
            this.view.render();

            dropArea = container.one('.ez-binarybase-drop-area');
            container.delegate("drop", function (e) {
                facade = e;
            }, '.ez-binarybase-drop-area', this);
            dropArea.getDOMNode().dispatchEvent(evt);
            Assert.isString(
                this.view.get('warning'),
                "The warning attribute should be filled with a message"
            );
            Assert.isTrue(
                facade._event.defaultPrevented,
                "The drop event should be prevented"
            );
        },

        "Should handle drop of a text selection": function () {
            this._dropEventWarningTest([false]);
        },

        "Should handle drop of several files": function () {
            this._dropEventWarningTest([{}, {}]);
        },

        "Should validate the size of a dropped file": function () {
            this._dropEventWarningTest(
                [{size: (this.maxSize + 1) * this.multiplicator, name: "toobig.jpg", type: "image/jpeg"}]
            );
        },

        "Should accept the dropped file": function () {
            var dropArea,
                that = this,
                container = this.view.get('container'),
                file = {
                    size: (this.maxSize - 1) * this.multiplicator,
                    type: "image/jpeg",
                    name: "dropped.jpg",
                },
                reader = new Mock(),
                facade,
                evt = this._simulateEvent('drop');

            evt.dataTransfer = {files: [file]};
            Mock.expect(reader, {
                method: 'readAsDataURL',
                args: [file],
                run: function () {
                    reader.result = that.createdUrl;
                    reader.onload();
                }
            });

            this.view._set('fileReader', reader);
            this.view.render();

            dropArea = container.one('.ez-binarybase-drop-area');
            container.delegate("drop", function (e) {
                facade = e;
            }, '.ez-binarybase-drop-area', this);
            dropArea.getDOMNode().dispatchEvent(evt);
            Assert.isFalse(
                this.view.get('warning'),
                "The warning attribute should be false"
            );
            Assert.isTrue(
                facade._event.defaultPrevented,
                "The drop event should be prevented"
            );
            Assert.isUndefined(reader.onload, "The onload handler should be resetted");
            Assert.areEqual(
                this.view.get('file').name, file.name,
                "The name of the dropped file should be kept"
            );
            Assert.areEqual(
                this.view.get('file').size, file.size,
                "The size of the dropped file should be kept"
            );
            Assert.areEqual(
                this.view.get('file').type, file.type,
                "The type of the dropped file should be kept"
            );
            Assert.areEqual(
                this.view.get('file').data, this.fileContent,
                "The content of the dropped file should have been read"
            );
            Mock.verify(reader);
        },
    };
});
