/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-image-editview-tests', function (Y) {
    var viewTest, registerTest, imageSetterTest, alternativeTextTest,
        imageVariationTest, buttonsTest, warningTest, renderingTest,
        validateTest, pickImageTest, dndTest,
        getFieldNotUpdatedTest, getFieldUpdatedEmptyTest,
        getFieldUpdatedTest, getFieldUpdatedNoDataTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseViewTest, {
            name: "eZ Image View test",
            ViewConstructor: Y.eZ.ImageEditView,
            templateVariablesCount: 8,
            fileTemplateVariable: "image",
            _additionalVariableAssertions: function (variables) {
                Assert.areSame(
                    this.view.get('alternativeText'), variables.alternativeText,
                    "The alternativeText should be available in the field edit view template"
                );
            },
        })
    );

    imageSetterTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseFileSetterTest, {
            name: "eZ Image View image attribute setter test",
            ViewConstructor: Y.eZ.ImageEditView,

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

                image = this.view.get('file');
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
                this.view._set('file', value);

                image = this.view.get('file');
                Assert.areSame(value, image, "The image attr should store the object");
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
                this.view._set('file', value);
                this.view._set('file', value2);

                Assert.isTrue(this.revokeCalled, "revokeObjectURL should have been called");
                Assert.areEqual(
                    value.displayUri, this.revokeUri,
                    "The previous displayUri should have been revoked"
                );
            },
        })
    );

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
            delete this.view;
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
            delete this.view;
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
                imageVariation.uri, this.view.get('file').displayUri,
                "The variation uri should be set as the display Uri"
            );
            Assert.areEqual(
                imageVariation.uri,
                this.view.get('container').one('.ez-image-preview').getAttribute('src'),
                "The variation should be displayed"
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

    buttonsTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseButtonTests, {
            name: "eZ Image View buttons test",
            field: {
                fieldValue: {
                    alternativeText: "default alternative text",
                    uri: "path/to/file.jpg"
                },
            },
            ViewConstructor: Y.eZ.ImageEditView,
        })
    );

    warningTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseWarningTest, {
            name: "eZ Image View warning test",
            ViewConstructor: Y.eZ.ImageEditView,
        })
    );

    validateTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseValidateTest, {
            name: "eZ Image View image validate test",
            ViewConstructor: Y.eZ.ImageEditView,
        })
    );

    pickImageTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBasePickFileTest, {
            name: "eZ Image View pick image test",
            ViewConstructor: Y.eZ.ImageEditView,
            multiplicator: 1, // in image, the max size is in bytes

            "Should refuse a non image file": function () {
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
                    returns: {files: [{size: (this.maxSize - 1) * this.multiplicator, name: "file.ogv", type: "video/ogg"}]},
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
                variations: {},
            },
            newValue: {
                name: "me.jpg",
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
                this.view._set('file', this.newValue);
            },

            _assertCorrectFieldValue: function (fieldValue, msg) {
                Assert.areNotSame(
                    this.view.get('field').fieldValue,
                    fieldValue,
                    "The original field value should be cloned"
                );
                Assert.isUndefined(
                    fieldValue.variations,
                    "The variations object should be removed from the field value"
                );
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

    renderingTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseRenderingTest, {
            name: "eZ Image View rendering tests",
            ViewConstructor: Y.eZ.ImageEditView,

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

                this.view._set('file', newImage);

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
        })
    );

    dndTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseDragAndDropTest, {
            name: "eZ Image edit view drag and drop tests",
            multiplicator: 1,
            ViewConstructor: Y.eZ.ImageEditView,
            "Should refuse a non image dropped file": function () {
                this._dropEventWarningTest(
                    [{size: (this.maxSize - 1) * this.multiplicator, name: "wrong.ogg", type: "audio/ogg"}]
                );
            },
        })
    );

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
    Y.Test.Runner.add(dndTest);
    Y.Test.Runner.add(getFieldNotUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedEmptyTest);
    Y.Test.Runner.add(getFieldUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedNoDataTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Image Edit View registration test";
    registerTest.viewType = Y.eZ.ImageEditView;
    registerTest.viewKey = "ezimage";

    Y.Test.Runner.add(registerTest);

}, '', {
    requires: [
        'test', 'model', 'event-valuechange', 'node-event-simulate', 'ez-image-editview',
        'getfield-tests', 'editviewregister-tests', 'binarybase-tests'
    ]
});
