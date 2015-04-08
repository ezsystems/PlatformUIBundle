/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-media-view-tests', function (Y) {
    var viewTest, registerTest, playerEventTest, isAudioTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Media View test",

            setUp: function () {
                this.templateVariablesCount = 5;
                this.fieldDefinition = {
                    fieldType: 'ezmedia',
                    identifier: 'media',
                    fieldSettings: {
                        mediaType: 'TYPE_HTML5_AUDIO'
                    }
                };
                this.field = {
                    fieldValue: {
                        autoplay: 'false',
                        fileName: 'marcus.avi',
                        fileSize: '42000',
                        hasController: 'false',
                        height: '42',
                        id: 'marcusmiller',
                        inputUri: 'uieuie',
                        loop: 'false',
                        mimeType: 'video/mp4',
                        path: '',
                        uri: '/var/marcus.avi',
                        width: '42',
                    }
                };
                this.isEmpty = false;
                this.view = new Y.eZ.MediaView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
                delete this.view;
            },


            "Test field value": function () {
                this._testValue(
                    this.field.fieldValue, this.field.fieldValue, "The value in the template should be the fieldValue"
                );
            },

            "Test empty field value": function () {
                this._testValue(
                    null, null, "The value in the template should be null"
                );
            },

            "Test isEmpty with an empty field value": function () {
                this._testIsEmpty(
                    {fieldValue: null}, true,
                    "null should be considered empty"
                );
            },

            "Test isEmpty with a field value": function () {
                this._testIsEmpty(
                    this.field, false,
                    "Value should not be considered empty"
                );
            },
        })
    );

    isAudioTest = new Y.Test.Case({
        name: "eZ Media View player audio detection test",

        setUp: function () {
            this.fieldDefinition = {
                fieldType: 'ezmedia',
                identifier: 'media',
                fieldSettings: {
                    mediaType: 'TYPE_HTML5_AUDIO'
                }
            };
            this.field = {
                fieldValue: {
                    autoplay: 'false',
                    fileName: 'marcus.avi',
                    fileSize: '42000',
                    hasController: 'false',
                    height: '42',
                    id: 'marcusmiller',
                    inputUri: 'uieuie',
                    loop: 'false',
                    mimeType: 'video/mp4',
                    path: '',
                    uri: '/var/marcus.avi',
                    width: '42',
                }
            };
            this.view = new Y.eZ.MediaView({
                fieldDefinition: this.fieldDefinition,
                field: this.field
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },


        "Should detect whether the field is configured for an audio file": function () {
            var origTpl = this.view.template;

            this.view.set('field', {fieldValue: this.fieldValue});
            this.view.template = function (variables) {
                Assert.isTrue(variables.isAudio, "isAudio should be true");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should detect whether the field is configured for a video file": function () {
            var origTpl = this.view.template,
                fieldDefiniton = this.fieldDefinition;

            fieldDefiniton.fieldSettings.mediaType = "TYPE_HTML5_VIDEO";

            this.view.set('field', {fieldValue: this.fieldValue});
            this.view.template = function (variables) {
                Assert.isFalse(variables.isAudio, "isAudio should be false");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    playerEventTest = new Y.Test.Case({
        name: "eZ Media View player events test",

        setUp: function () {
            this.fieldDefinition = {
                fieldType: 'ezmedia',
                identifier: 'media',
                fieldSettings: {
                    mediaType: 'TYPE_HTML5_VIDEO'
                }
            };
            this.field = {
                fieldValue: {
                    autoplay: 'false',
                    fileName: 'marcus.avi',
                    fileSize: '42000',
                    hasController: 'false',
                    height: '42',
                    id: 'marcusmiller',
                    inputUri: 'uieuie',
                    loop: 'false',
                    mimeType: 'video/mp4',
                    path: '',
                    uri: '/var/marcus.avi',
                    width: '42',
                }
            };
            this.view = new Y.eZ.MediaView({
                fieldDefinition: this.fieldDefinition,
                field: this.field
            });

            // phantomjs does not support the video tag and the associated
            // events so to simulate error events, we let
            // YUI consider those events as custom events, this way,
            // Y.Node.fire() can be used.
            this.origErrorCfg = Y.Node.DOM_EVENTS.error;
            delete Y.Node.DOM_EVENTS.error;
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should handle the case where there's no player": function () {
            this.view.set('field', {fieldValue: null});
            this.view.render();
        },

        "Should track the error event": function () {
            var c = this.view.get('container'),
                video;

            this.view.render();

            video = c.one('.ez-media-player');
            video.getDOMNode().error = {
                code: 42,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 42,
            };
            video.fire('error');

            Assert.isTrue(
                c.hasClass('is-media-unsupported'),
                "The 'is-media-unsupported' class should be added on the container"
            );
        },

        "Should ignore error other than unsupported file format": function () {
            var c = this.view.get('container'),
                video;

            this.view.render();

            video = c.one('.ez-media-player');
            video.getDOMNode().error = {
                code: 2,
                MEDIA_ERR_SRC_NOT_SUPPORTED: 42,
            };
            video.fire('error');

            Assert.isFalse(
                c.hasClass('is-media-unsupported'),
                "The 'is-media-unsupported' class should not be added on the container"
            );
        },
    });

    Y.Test.Runner.setName("eZ Media View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(playerEventTest);
    Y.Test.Runner.add(isAudioTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Media View registration test";
    registerTest.viewType = Y.eZ.MediaView;
    registerTest.viewKey = "ezmedia";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-media-view', 'ez-genericfieldview-tests']});
