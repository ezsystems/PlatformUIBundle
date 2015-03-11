/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-media-editview-tests', function (Y) {
    var viewTest, registerTest, mediaSetterTest,
        buttonsTest, warningTest, renderingTest,
        validateTest, pickMediaTest, dndTest,
        getFieldNotUpdatedTest, getFieldUpdatedEmptyTest,
        getFieldUpdatedTest, getFieldUpdatedNoDataTest,
        playerSettingTest, videoEventTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseViewTest, {
            name: "eZ Media View test",
            ViewConstructor: Y.eZ.MediaEditView,
            templateVariablesCount: 13,
            fileTemplateVariable: "media",
            _getFieldDefinition: function (required) {
                return {
                    isRequired: required,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },
            _getField: function () {
                return {
                    fieldValue: {
                        loop: true,
                        autoplay: true,
                        hasController: true,
                        width: 800,
                        height: 600,
                        fileName: "MTB",
                        path: "path/to/mtb.webm",
                        mimeType: "video/webm",
                        fileSize: 5445455,
                    }
                };
            },
            _additionalVariableAssertions: function (variables) {
                Assert.areSame(
                    this.view.get('loop'), variables.loop,
                    "The loop attribute should available"
                );
                Assert.areSame(
                    this.view.get('autoplay'), variables.autoplay,
                    "The autoplay attribute should available"
                );
                Assert.areSame(
                    this.view.get('hasController'), variables.hasController,
                    "The hasController attribute should available"
                );
                Assert.areSame(
                    this.view.get('width'), variables.width,
                    "The width attribute should available"
                );
                Assert.areSame(
                    this.view.get('height'), variables.height,
                    "The height attribute should available"
                );
                Assert.isFalse(
                    variables.isAudio,
                    "The isAudio flag should be false"
                );
            },
        })
    );

    mediaSetterTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseFileSetterTest, {
            name: "eZ Media View media attribute setter test",
            ViewConstructor: Y.eZ.MediaEditView,
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },

            "Should handle a field value": function () {
                var media;

                this.field = {
                    fieldValue: {
                        uri: 'path/to/little.ogg',
                        fileName: 'Oasis - Little by little.ogg',
                        mimeType: "audio/ogg",
                        fileSize: 4002455,
                    }
                };
                this._initView();

                media = this.view.get('file');
                Assert.isObject(media, 'The media attr should be an object');
                Assert.areEqual(
                    this.field.fieldValue.uri,
                    media.uri,
                    "The media object should get a originalUri property"
                );
                Assert.areEqual(
                    this.field.fieldValue.fileName,
                    media.name,
                    "The media object should get a name property"
                );
                Assert.areEqual(
                    this.field.fieldValue.fileSize,
                    media.size,
                    "The media object should get a size property"
                );
                Assert.areEqual(
                    this.field.fieldValue.mimeType,
                    media.type,
                    "The media object should get a type property"
                );
                Assert.isFalse(this.revokeCalled, "revokeObjectURL should not have been called");
            },

            "Should handle a literal object": function () {
                var media,
                    value = {
                        uri: 'path/to/little.ogg',
                        name: 'Oasis - Little by little.ogg',
                        type: "audio/ogg",
                        size: 4002455,
                        data: "base64content",
                    };

                this._initView();
                this.view._set('file', value);

                media = this.view.get('file');
                Assert.areSame(value, media, "The media attr should store the object");
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
            name: "eZ Media View buttons test",
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },
            field: {
                fieldValue: {
                    uri: "path/to/file.webm"
                },
            },
            ViewConstructor: Y.eZ.MediaEditView,
        })
    );

    warningTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseWarningTest, {
            name: "eZ Media View warning test",
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },
            ViewConstructor: Y.eZ.MediaEditView,
        })
    );

    validateTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseValidateTest, {
            name: "eZ Media View media validate test",
            _getFieldDefinition: function () {
                return {
                    isRequired: true,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },
            ViewConstructor: Y.eZ.MediaEditView,
        })
    );

    pickMediaTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBasePickFileTest, {
            name: "eZ Media View pick file test",
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                    validatorConfiguration: {
                        FileSizeValidator: {
                            maxFileSize: this.maxSize
                        }
                    },
                };
            },
            ViewConstructor: Y.eZ.MediaEditView,
        })
    );

    getFieldNotUpdatedTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            _should: {
                ignore: {
                    "Test getField": true,
                }
            },
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO"
                },
            },
            fieldValue: null,
            ViewConstructor: Y.eZ.MediaEditView,

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
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO"
                },
            },
            fieldValue: null,
            newValue: null,
            ViewConstructor: Y.eZ.MediaEditView,

            _setNewValue: function () {
                this.view._set('updated', true);
            },
        })
    );

    getFieldUpdatedTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.GetFieldTests, {
            version: new Y.Model(),
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO"
                },
            },
            fieldValue: {
                fileName: "mtb.webm",
                width: 640,
                height: 480,
                hasController: true,
                autoplay: true,
                loop: true,
            },
            newValue: {
                name: "danny_macaskill.webm",
                data: "base64 content",
            },
            ViewConstructor: Y.eZ.MediaEditView,

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
                Assert.areEqual(this.newValue.size, fieldValue.fileSize, msg);
                Assert.areEqual(this.newValue.data, fieldValue.data, msg);
                Assert.areEqual(this.fieldValue.loop, fieldValue.loop, msg);
                Assert.areEqual(this.fieldValue.autoplay, fieldValue.autoplay, msg);
                Assert.areEqual(this.fieldValue.hasController, fieldValue.hasController, msg);
                Assert.areEqual(this.fieldValue.width, fieldValue.width, msg);
                Assert.areEqual(this.fieldValue.height, fieldValue.height, msg);
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
            fieldDefinition: {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO"
                },
            },
            fieldValue: {
                fileName: "mtb.webm",
                width: 640,
                height: 480,
                hasController: true,
                autoplay: true,
                loop: true,
            },
            newValue: {
                name: "danny_macaskill.webm",
            },
            ViewConstructor: Y.eZ.MediaEditView,

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
                Assert.areEqual(this.fieldValue.loop, fieldValue.loop, msg);
                Assert.areEqual(this.fieldValue.autoplay, fieldValue.autoplay, msg);
                Assert.areEqual(this.fieldValue.hasController, fieldValue.hasController, msg);
                Assert.areEqual(this.fieldValue.width, fieldValue.width, msg);
                Assert.areEqual(this.fieldValue.height, fieldValue.height, msg);
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
            name: "eZ Media View rendering tests",
            ViewConstructor: Y.eZ.MediaEditView,
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                };
            },

            "Should update the rendered view": function () {
                var c,
                    newMedia = {
                        name: "little.ogg",
                        size: 4654556,
                        type: "audio/ogg",
                        uri: this.createdUrl,
                    };

                this["Should disable the remove button"]();
                c = this.view.get('container');

                this.view._set('file', newMedia);

                Assert.isFalse(
                    this.view.get('container').one('.ez-button-delete').get('disabled'),
                    "The remove button should be disabled"
                );
                Assert.areEqual(
                    newMedia.name, c.one(".ez-media-properties-name").getContent(),
                    "The media name should not be updated"
                );
                Assert.areEqual(
                    newMedia.size, c.one(".ez-media-properties-size").getContent(),
                    "The media size should be updated"
                );
                Assert.areEqual(
                    newMedia.type, c.one(".ez-media-properties-type").getContent(),
                    "The media type should be updated"
                );
                Assert.areEqual(
                    this.createdUrl, c.one(".ez-media-link").getAttribute('href'),
                    "The view original link should be updated"
                );
                Assert.areEqual(
                    this.createdUrl, c.one(".ez-media-player").getAttribute('src'),
                    "The media player should be updated"
                );
            },
        })
    );

    playerSettingTest = new Y.Test.Case({
        name: "eZ Media player properties tests",

        setUp: function () {
            this.field = {
                fieldValue: {
                    uri: "path/to/danny_macaskill.webm",
                    width: 640,
                    height: 480,
                    hasController: false,
                    autoplay: false,
                    loop: false,
                },
            };
            this.fieldDefinition = {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO",
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

            this.view = new Y.eZ.MediaEditView({
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

        _fieldValueToAttributeTest: function (attribute) {
            Assert.areEqual(
                this.field.fieldValue[attribute],
                this.view.get(attribute),
                "The fieldValue " + attribute + " should be stored in the '" + attribute + "' attribute"
            );
        },

        "Should retrieve the loop property in the field value": function () {
            this._fieldValueToAttributeTest('loop');
        },

        "Should retrieve the autoplay property in the field value": function () {
            this._fieldValueToAttributeTest('autoplay');
        },

        "Should retrieve the hasController property in the field value": function () {
            this._fieldValueToAttributeTest('hasController');
        },

        "Should retrieve the width property in the field value": function () {
            this._fieldValueToAttributeTest('width');
        },

        "Should retrieve the height property in the field value": function () {
            this._fieldValueToAttributeTest('height');
        },

        _trackCheckboxTest: function (attribute) {
            var container = this.view.get('container'),
                newVal = true,
                input;

            this.view.render();
            input = container.one('input[name=' + attribute + ']');
            input.set('checked', newVal);
            input.simulate('change');
            Assert.areEqual(
                newVal, this.view.get(attribute),
                "The '" + attribute + "' attribute should have been updated"
            );
            Assert.isTrue(
                this.view.get('updated'),
                "The updated flag attribute should be true"
            );
        },

        "Should track the loop change": function () {
            this._trackCheckboxTest('loop');
        },

        "Should track the hasController change": function () {
            this._trackCheckboxTest('hasController');
        },

        "Should track the autoplay change": function () {
            this._trackCheckboxTest('autoplay');
        },

        _trackSizeTest: function (attribute) {
            var container = this.view.get('container'),
                newVal = 100,
                that = this,
                input;

            this.view.render();
            this.view.after(attribute + 'Change', function () {
                that.resume(function () {
                    Assert.areEqual(
                        newVal, this.view.get(attribute),
                        "The '" + attribute + "' attribute should have been updated"
                    );
                    Assert.isTrue(
                        this.view.get('updated'),
                        "The updated flag attribute should be true"
                    );
                });
            });
            input = container.one('input[name=' + attribute + ']');
            input.simulate('focus');
            input.set('value', newVal);
            this.wait();
        },

        "Should track the width change": function () {
            this._trackSizeTest('width');
        },

        "Should track the height change": function () {
            this._trackSizeTest('width');
        },
    });

    videoEventTest = new Y.Test.Case({
        name: "eZ Media player video event tests",

        setUp: function () {
            this.field = {
                fieldValue: {
                    uri: "path/to/danny_macaskill.webm",
                    width: 640,
                    height: 480,
                    hasController: false,
                    autoplay: false,
                    loop: false,
                },
            };
            this.fieldDefinition = {
                isRequired: false,
                fieldSettings: {
                    mediaType: "TYPE_HTML5_VIDEO",
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

            this.view = new Y.eZ.MediaEditView({
                container: '.container',
                field: this.field,
                fieldDefinition: this.fieldDefinition,
                version: this.version,
                content: this.content,
                contentType: this.contentType
            });
            // phantomjs does not support the video tag and the associated
            // events so to simulate the loadedmetadata and error events, we let
            // YUI consider those events as custom events, this way,
            // Y.Node.fire() can be used.
            this.origLoadedMetadataCfg = Y.Node.DOM_EVENTS.loadedmetadata;
            this.origErrorCfg = Y.Node.DOM_EVENTS.error;
            delete Y.Node.DOM_EVENTS.loadedmetadata;
            delete Y.Node.DOM_EVENTS.error;
        },

        tearDown: function () {
            this.view.destroy();
            this.view.get('container').setAttribute('class', 'container');
            delete this.view;
            Y.Node.DOM_EVENTS.loadedmetadata = this.origLoadedMetadataCfg;
            Y.Node.DOM_EVENTS.error = this.origErrorCfg;
        },

        "Should track the loadedmetadata event": function () {
            var c = this.view.get('container'),
                videoWidth = 200, videoHeight = 100,
                video, width, height;

            this.view.render();

            video = c.one('.ez-media-player');
            width = c.one('input[name=width]');
            height = c.one('input[name=height]');
            video.getDOMNode().videoWidth =  videoWidth;
            video.getDOMNode().videoHeight = videoHeight;
            c.addClass('is-media-being-updated');
            video.fire('loadedmetadata');
            Assert.isFalse(
                c.hasClass('is-media-being-updated'),
                "The 'is-media-being-updated' class should be removed from the container"
            );
            Assert.areEqual(
                videoWidth, width.getAttribute('placeholder'),
                "The width input should have the placeholder attribute filled with the video width"
            );
            Assert.areEqual(
                videoHeight, height.getAttribute('placeholder'),
                "The height input should have the placeholder attribute filled with the video height"
            );
        },

        "Should track the loadedmetadata event (audio)": function () {
            var c = this.view.get('container'),
                audio;

            this.view.get('fieldDefinition').fieldSettings.mediaType = "TYPE_HTML5_AUDIO";
            this.view.render();

            audio = c.one('.ez-media-player');
            c.addClass('is-media-being-updated');
            audio.fire('loadedmetadata');
            Assert.isFalse(
                c.hasClass('is-media-being-updated'),
                "The 'is-media-being-updated' class should be removed from the container"
            );
        },

        "Should track the error event": function () {
            var c = this.view.get('container'),
                video, width, height;

            this["Should track the loadedmetadata event"]();
            video = c.one('.ez-media-player');
            width = c.one('input[name=width]');
            height = c.one('input[name=height]');

            c.addClass('is-media-being-updated');
            video.getDOMNode().error = {
                code: 42,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 42,
            };
            video.fire('error');

            Assert.isFalse(
                c.hasClass('is-media-being-updated'),
                "The 'is-media-being-updated' class should be removed from the container"
            );
            Assert.isTrue(
                c.hasClass('is-media-unsupported'),
                "The 'is-media-unsupported' class should be added on the container"
            );
            Assert.areEqual(
                "", width.getAttribute('placeholder'),
                "The width placeholder should be empty"
            );
            Assert.areEqual(
                "", height.getAttribute('placeholder'),
                "The height placeholder should be empty"
            );
        },

        "Should track the error event (audio)": function () {
            var c = this.view.get('container'),
                audio;

            this["Should track the loadedmetadata event (audio)"]();
            audio = c.one('.ez-media-player');
            audio.getDOMNode().error = {
                code: 42,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 42,
            };
            audio.fire('error');

            Assert.isFalse(
                c.hasClass('is-media-being-updated'),
                "The 'is-media-being-updated' class should be removed from the container"
            );
            Assert.isTrue(
                c.hasClass('is-media-unsupported'),
                "The 'is-media-unsupported' class should be added on the container"
            );
        },

        "Should ignore error other than unsupported file format": function () {
            var c = this.view.get('container'),
                video, width, height;

            this["Should track the loadedmetadata event"]();
            video = c.one('.ez-media-player');
            width = c.one('input[name=width]');
            height = c.one('input[name=height]');

            c.addClass('is-media-being-updated');
            video.getDOMNode().error = {
                code: 2,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 42,
            };
            video.fire('error');

            Assert.isFalse(
                c.hasClass('is-media-being-updated'),
                "The 'is-media-being-updated' class should be removed from the container"
            );
            Assert.isFalse(
                c.hasClass('is-media-unsupported'),
                "The 'is-media-unsupported' class should not be added on the container"
            );
            Assert.areNotEqual(
                "", width.getAttribute('placeholder'),
                "The width placeholder should be kept"
            );
            Assert.areNotEqual(
                "", height.getAttribute('placeholder'),
                "The height placeholder should be kept"
            );
        },
    });

    dndTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.BinaryBaseDragAndDropTest, {
            name: "eZ Media edit view drag and drop tests",
            ViewConstructor: Y.eZ.MediaEditView,
            _getFieldDefinition: function () {
                return {
                    isRequired: false,
                    fieldSettings: {
                        mediaType: "TYPE_HTML5_VIDEO"
                    },
                    validatorConfiguration: {
                        FileSizeValidator: {
                            maxFileSize: this.maxSize
                        }
                    },
                };
            },
        })
    );

    Y.Test.Runner.setName("eZ Media Edit View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(mediaSetterTest);
    Y.Test.Runner.add(buttonsTest);
    Y.Test.Runner.add(warningTest);
    Y.Test.Runner.add(validateTest);
    Y.Test.Runner.add(pickMediaTest);
    Y.Test.Runner.add(renderingTest);
    Y.Test.Runner.add(dndTest);
    Y.Test.Runner.add(getFieldNotUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedEmptyTest);
    Y.Test.Runner.add(getFieldUpdatedTest);
    Y.Test.Runner.add(getFieldUpdatedNoDataTest);
    Y.Test.Runner.add(playerSettingTest);
    Y.Test.Runner.add(videoEventTest);

    registerTest = new Y.Test.Case(Y.eZ.EditViewRegisterTest);
    registerTest.name = "Media Edit View registration test";
    registerTest.viewType = Y.eZ.MediaEditView;
    registerTest.viewKey = "ezmedia";

    Y.Test.Runner.add(registerTest);

}, '', {
    requires: [
        'test', 'model', 'event-valuechange', 'node-event-simulate', 'ez-media-editview',
        'getfield-tests', 'editviewregister-tests', 'binarybase-tests',
    ]
});
