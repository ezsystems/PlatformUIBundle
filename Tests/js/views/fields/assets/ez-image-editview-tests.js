/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-image-editview-tests', function (Y) {
    var viewTest, registerTest, imageSetterTest, alternativeTextTest,
        imageVariationTest, buttonsTest, warningTest, renderingTest,
        validateTest, pickImageTest,
        getFieldNotUpdatedTest, getFieldUpdatedEmptyTest,
        getFieldUpdatedTest, getFieldUpdatedNoDataTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case({
        name: "eZ Image View test",

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
            this.view = new Y.eZ.ImageEditView({
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
                Assert.areEqual(10, Y.Object.keys(variables).length, "The template should receive 10 variables");

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
                    expectedIsEmpty,
                    variables.isEmpty,
                    "isEmpty should be available in the field edit view template"
                );
                Assert.areSame(
                    view.get('image'), variables.image,
                    "The image struct should be available in the field edit view template"
                );
                Assert.areSame(
                    view.get('alternativeText'), variables.alternativeText,
                    "The alternativeText should be available in the field edit view template"
                );
                Assert.areSame(
                    view.get('loadingError'), variables.loadingError,
                    "The loadingError should be available in the field edit view template"
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

        "Test filled image": function () {
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

    imageSetterTest = new Y.Test.Case({
        name: "eZ Image View image attribute setter test",

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
            this.view = new Y.eZ.ImageEditView({
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
            Assert.isNull(this.view.get('image'), 'The image attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should handle a null value": function () {
            this._initView();
            this.view._set('image', null);
            Assert.isNull(this.view.get('image'), 'The image attr should be null');
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should handle a field value": function () {
            var image;

            this.field = {
                fieldValue: {
                    uri: 'path/to/file.jpg',
                    fileName: 'file.jpg',
                    fileSize: 42,
                }
            };
            this._initView();

            image = this.view.get('image');
            Assert.isObject(image, 'The image attr should be an object');
            Assert.areEqual(
                this.field.fieldValue.uri,
                image.originalUri,
                "The image object should get a originalUri property"
            );
            Assert.areEqual(
                this.field.fieldValue.fileName,
                image.name,
                "The image object should get a name property"
            );
            Assert.areEqual(
                this.field.fieldValue.fileSize,
                image.size,
                "The image object should get a size property"
            );
            Assert.areEqual('N/A', image.type, "The type property should be 'N/A'");
            Assert.isFalse(image.displayUri, "The displayUri property should be false");
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should handle a literal object": function () {
            var image,
                value = {
                    originalUri: 'path/to/file.jpg',
                    displayUri: 'path/to/file.jpg',
                    name: 'file.jpg',
                    size: 42,
                    type: 'image/jpg',
                    data: "base64content",
                };

            this._initView();
            this.view._set('image', value);

            image = this.view.get('image');
            Assert.areSame(value, image, "The image attr should store the object");
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },

        "Should reject unrecognized value": function () {
            this._initView();
            this.view._set('image', undefined);
            Assert.isNull(this.view.get('image'), "The type property should be null");
            Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
        },
        
        "Should revoke the displayUri of the previous entry": function () {
            var value = {
                    originalUri: 'path/to/file.jpg',
                    displayUri: 'path/to/file.jpg',
                    name: 'file.jpg',
                    size: 42,
                    type: 'image/jpg',
                    data: "base64content",
                },
                value2 = {
                    originalUri: 'path/to/file.jpg',
                    displayUri: 'path/to/file.jpg',
                    name: 'file.jpg',
                    size: 42,
                    type: 'image/jpg',
                    data: "base64content",
                };


            this._initView();
            this.view._set('image', value);
            this.view._set('image', value2);

            Assert.isTrue(this.revokeCalled, "revokeObjectURL should have been called");
            Assert.areEqual(
                value.displayUri, this.revokeUri,
                "The previous displayUri should have been revoked"
            );
        },
    });

    alternativeTextTest = new Y.Test.Case({
        name: "eZ Image View image alternative text",

        setUp: function () {
            this.field = {
                fieldValue: {
                    alternativeText: "default alternative text",
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

            this.view = new Y.eZ.ImageEditView({
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

        "Should retrieve the alternative text in the field value": function () {
            Assert.areEqual(
                this.field.fieldValue.alternativeText,
                this.view.get('alternativeText'),
                "The fieldValue alternativeText should be stored in the alternativeText attribute"
            );
        },

        "Should track the change in the alternative text input": function () {
            var container = this.view.get('container'),
                newAlt = 'new alternative',
                that = this,
                input;

            this.view.render();
            this.view.after('alternativeTextChange', function () {
                that.resume(function () {
                    Assert.areEqual(
                        newAlt, this.view.get('alternativeText'),
                        "The alternativeText attribute should have been updated"
                    );
                    Assert.isTrue(
                        this.view.get('updated'),
                        "The updated flag attribute should be true"
                    );
                });
            });
            input = container.one('.ez-image-alt-text-input');
            input.simulate('focus');
            input.set('value', newAlt);
            this.wait();
        },
    });

    imageVariationTest = new Y.Test.Case({
        name: "eZ Image View image variation test",

        setUp: function () {
            this.variationIdentifier = 'reference';
            this.field = {
                fieldValue: {
                    alternativeText: "default alternative text",
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

            this.view = new Y.eZ.ImageEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType,
                variationIdentifier: this.variationIdentifier,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire the loadImageVariation event": function () {
            var loadEvent = false,
                that = this;

            this.view.on('loadImageVariation', function (e) {
                loadEvent = true;
                Assert.areSame(
                    that.field,
                    e.field,
                    "The field should be provided in the event facade"
                );
                Assert.areEqual(
                    that.variationIdentifier,
                    e.variation,
                    "The variation identifier should be provided in the event facade"
                );
            });
            this.view.set('active', true);

            Assert.isTrue(loadEvent, "The loadImageVariation event should have been fired");
        },

        "Should not fire the loadImageVariation event": function () {
            this.field.fieldValue = null;
            this.view.on('loadImageVariation', function (e) {
                Assert.fail('The loadImageVariation should not have been fired');
            });
            this.view.set('active', true);
        },

        "Should update the view when the imageVariation attribute changes": function () {
            var imageVariation = {
                    uri: 'uri/to/the/variation',
                };

            this.view.render();
            this.view.set('imageVariation', imageVariation);

            Assert.areEqual(
                imageVariation.uri, this.view.get('image').displayUri,
                "The variation uri should be set as the display Uri"
            );
            Assert.areEqual(
                imageVariation.uri,
                this.view.get('container').one('.ez-image-preview').getAttribute('src'),
                "The variation should be displayed"
            );
        },

        "Should render the view when the loadingError attribute changes": function () {
            var that = this,
                templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function (variables) {
                templateCalled = true;
                Assert.areSame(
                    that.view.get('loadingError'),
                    variables.loadingError,
                    "loadingError should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };

            this.view.set('loadingError', true);

            Assert.isTrue(templateCalled, "The template has not been used");
        },

        "Should try to reload the image when tapping on the retry button": function () {
            var that = this,
                loadImageVariation = false;

            this.view.render();
            this.view.set('active', true);
            this.view.set('loadingError', true);
            this.view.on('loadImageVariation', function () {
                loadImageVariation = true;
            });

            this.view.get('container').one('.ez-asynchronousview-retry').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        loadImageVariation,
                        "The loadImageVariation should have been fired"
                    );
                    Assert.isFalse(
                        this.view.get('loadingError'),
                        "The `loadingError` attribute should be resetted to false"
                    );
                });
            });
            this.wait();
        },
    });

    buttonsTest = new Y.Test.Case({
        name: "eZ Image View image buttons test",

        setUp: function () {
            var win = Y.config.win,
                that = this;

            this.field = {
                fieldValue: {
                    alternativeText: "default alternative text",
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

            this.view = new Y.eZ.ImageEditView({
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

        "Should remove the image": function () {
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
                        this.view.get('image'), "The image attribute should be null"
                    );
                });
            });
            this.wait();
        },

        "Should open the select file window": function () {
            var container = this.view.get('container'),
                that = this;

            this.view.render();

            container.one('.ez-image-input-file').on('click', function () {
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
        name: "eZ Image View image warning test",

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

            this.view = new Y.eZ.ImageEditView({
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

            container.one('.ez-image-warning-hide').simulateGesture('tap', function () {
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
        name: "eZ Image View image validate test",

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
            this.view = new Y.eZ.ImageEditView({
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

    pickImageTest = new Y.Test.Case({
        name: "eZ Image View image pick image test",

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

            this.view = new Y.eZ.ImageEditView({
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
                returns: {files: [{size: 50, name: "file.jpg", type: "image/jpg"}]},
            });
            Mock.expect(eventFacade.target, {
                method: 'set',
                args: ['value', ''],
            });

            this.view.render();
            this.view._updateImage(eventFacade);
            Assert.isString(
                this.view.get('warning'),
                "A warning should have been generated"
            );
            Mock.verify(eventFacade);
            Mock.verify(fileReader);
        },

        "Should read the file": function () {
            var fileReader = this.view.get('fileReader'),
                container = this.view.get('container'),
                imgContent = "base64 image content",
                file = {size: 5, name: "file.jpg", type: "image/jpg"},
                base64ImgContent = "data;" + file.type + ";base64," + imgContent,
                image,
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
                    Assert.isTrue(
                        container.hasClass('is-image-being-updated'),
                        "The container should get the is-image-being-updated class"
                    );
                    fileReader.result = base64ImgContent;
                    fileReader.onload();
                }
            });

            this.view.render();
            this.view._updateImage(eventFacade);
            Assert.isFalse(
                this.view.get('warning'),
                "The warning attribute should stay false"
            );
            image = this.view.get('image');

            Assert.areEqual(
                imgContent, image.data,
                "The image content should be available in the image attribute"
            );
            Assert.areEqual(
                file.name, image.name,
                "The image name should be available in the image attribute"
            );
            Assert.areEqual(
                file.size, image.size,
                "The image size should be available in the image attribute"
            );
            Assert.areEqual(
                file.type, image.type,
                "The image type should be available in the image attribute"
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
            ViewConstructor: Y.eZ.ImageEditView,

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
            ViewConstructor: Y.eZ.ImageEditView,

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
                alternativeText: "Alt text",
            },
            newValue: {
                name: "me.jpg",
                size: "42",
                data: "base64 content",
            },
            ViewConstructor: Y.eZ.ImageEditView,

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
                this.view._set('image', this.newValue);
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
                alternativeText: "Alt text",
            },
            newValue: {
                name: "me.jpg",
                size: "42",
            },
            ViewConstructor: Y.eZ.ImageEditView,

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
                this.view._set('image', this.newValue);
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
        name: "eZ Image View image rendering tests",

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
            this.createdUrl = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        },

        _initView: function () {
            this.view = new Y.eZ.ImageEditView({
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
        },

        "Should add the empty class": function () {
            this.field = {fieldValue: null};
            this._initView();
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass('is-image-empty'),
                "The container should get the is-image-empty class"
            );
        },

        "Should remove the empty class": function () {
            this["Should add the empty class"]();
            this.view._set('image', {name: "file.jpg", uri: "path/to/file.jpg"});

            Assert.isFalse(
                this.view.get('container').hasClass('is-image-empty'),
                "The container should not get the is-image-empty class"
            );
        },

        "Should add the loading error class": function () {
            this._initView();
            this.view.render();
            this.view.set('loadingError', true);

            Assert.isTrue(
                this.view.get('container').hasClass('has-loading-error'),
                "The container should get the has-loading-error class"
            );
        },

        "Should remove the loading error class": function () {
            this["Should add the loading error class"]();
            this.view.set('loadingError', false);

            Assert.isFalse(
                this.view.get('container').hasClass('has-loading-error'),
                "The container should not get the has-loading-error class"
            );
        },

        "Should add the loading class": function () {
            this.field = {fieldValue: {name: "file.jpg"}};
            this._initView();
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass('is-image-loading'),
                "The container should get the is-image-loading class"
            );
        },

        "Should remove the loading class": function () {
            this["Should add the loading class"]();
            this.view.set('imageVariation', {uri: "path/to/variation.jpg"});

            Assert.isFalse(
                this.view.get('container').hasClass('is-image-loading'),
                "The container should not get the is-image-loading class"
            );
        },

        "Should disable the remove button": function () {
            this.field = {fieldValue: {name: "file.jpg"}};
            this._initView();
            this.view.render();

            this.view._set('image', null);

            Assert.isTrue(
                this.view.get('container').one('.ez-button-delete').get('disabled'),
                "The remove button should be disabled"
            );
        },

        "Should update the rendered view": function () {
            var c,
                newImage = {
                    name: "update.jpg",
                    size: 42,
                    type: "image/jpg",
                    originalUri: this.createdUrl,
                    displayUri: this.createdUrl,
                };

            this["Should disable the remove button"]();
            c = this.view.get('container');

            this.view._set('image', newImage);

            Assert.isFalse(
                this.view.get('container').one('.ez-button-delete').get('disabled'),
                "The remove button should be disabled"
            );
            Assert.areEqual(
                newImage.name, c.one(".ez-image-properties-name").getContent(),
                "The image name should be updated"
            );
            Assert.areEqual(
                newImage.size, c.one(".ez-image-properties-size").getContent(),
                "The image size should be updated"
            );
            Assert.areEqual(
                newImage.type, c.one(".ez-image-properties-type").getContent(),
                "The image type should be updated"
            );
            Assert.areEqual(
                this.createdUrl, c.one(".ez-image-view-original").getAttribute('href'),
                "The view original link should be updated"
            );
            Assert.areEqual(
                this.createdUrl, c.one(".ez-image-preview").getAttribute('src'),
                "The view original link should be updated"
            );
            Assert.isFalse(
                c.hasClass('is-image-being-updated'),
                "The container should not have the is-image-being-updated class"
            );
        },
    });

    Y.Test.Runner.setName("eZ Image Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(imageSetterTest);
    Y.Test.Runner.add(alternativeTextTest);
    Y.Test.Runner.add(imageVariationTest);
    Y.Test.Runner.add(buttonsTest);
    Y.Test.Runner.add(warningTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(pickImageTest);
    Y.Test.Runner.add(renderingTest);
    Y.Test.Runner.add(getFieldNotUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedEmptyTest);
    Y.Test.Runner.add(getFieldUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedNoDataTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Image Edit View registration test";
    registerTest.viewType = Y.eZ.ImageEditView;
    registerTest.viewKey = "ezimage";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'model', 'event-valuechange', 'node-event-simulate', 'getfield-tests', 'editviewregister-tests', 'ez-image-editview']});
