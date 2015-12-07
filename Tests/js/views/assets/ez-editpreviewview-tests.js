/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editpreviewview-tests', function (Y) {
    var IS_HIDDEN_CLASS = 'is-editpreview-hidden',
        IS_LOADING_CLASS = 'is-loading',
        viewTest, isHiddenTest,
        Assert = Y.Assert, Mock = Y.Mock;

    viewTest = new Y.Test.Case({
        name: "eZ Edit Preview View test",

        setUp: function () {
            this.contentId = 59;
            this.currentVersionNo = 41;
            this.versionNo = 42;
            this.versionIsNew = false;
            this.versionName = 'Test elvish name';
            this.currentVersionName = 'Current Test elvish name';
            this.languageCode = 'quenya';
            this.versionNames = {
                'eng-GB': 'Test name',
                'quenya': this.versionName,
            };
            this.currentVersionNames = {
                'eng-GB': 'Current version Test name',
                'quenya': this.currentVersionName,
            };
            this.currentVersion = new Mock();
            this.contentMock = new Mock();
            Mock.expect(this.contentMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: Y.bind(function (attr) {
                    if ( attr === 'contentId' ) {
                        return this.contentId;
                    } else if ( attr === 'currentVersion' ) {
                        return this.currentVersion;
                    }
                    Y.fail('Unexpected content.get("' + attr + '")');
                }, this),
            });
            this.versionMock = new Mock();
            this._configureVersionMock(
                this.versionMock, this.versionNo, this.versionNames
            );
            this._configureVersionMock(
                this.currentVersion, this.currentVersionNo, this.currentVersionNames
            );
            Mock.expect(this.versionMock, {
                method: 'isNew',
                run: Y.bind(function () {
                    return this.versionIsNew;
                }, this),
            });

            this.view = new Y.eZ.EditPreviewView({
                container: '.container',
                content: this.contentMock,
                version: this.versionMock,
                languageCode: this.languageCode
            });
        },

        _configureVersionMock: function (version, versionNo, names) {
            Mock.expect(version, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'versionNo' ) {
                        return versionNo;
                    } else if ( attr === 'names' ) {
                        return names;
                    }
                    Y.fail('Unexpected version.get("' + attr + '")');
                },
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the view with a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");

            Assert.isTrue(
                this.view.get('container').hasClass(IS_LOADING_CLASS),
                "The container should have the loading class"
            );
        },

        _checkTemplateVariables: function (variables, legend, source) {
            Assert.isObject(variables, "The template should receive some variables");
            Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
            Assert.isObject(variables.mode, "mode should be available in the template and should be an object");
            Assert.areSame(
                legend,
                variables.legend,
                "preview title should be translated"
            );
            Assert.areSame(
                source,
                variables.source,
                "source should be made with versionNo, contentID, and languageCode"
            );
        },

        "Should render the preview of the `version`": function () {
            var origTpl = this.view.template;

            this.view.template = Y.bind(function (variables) {
                this._checkTemplateVariables(
                    variables,
                    this.versionName,
                    '/content/versionview/' + this.contentId + '/' + this.versionNo + '/' + this.languageCode
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should render the preview of the content `currentVersion`": function () {
            var origTpl = this.view.template;

            this.versionIsNew = true;
            this.view.template = Y.bind(function (variables) {
                this._checkTemplateVariables(
                    variables,
                    this.currentVersionName,
                    '/content/versionview/' + this.contentId + '/' + this.currentVersionNo + '/' + this.languageCode
                );
                return origTpl.apply(this.view, arguments);
            }, this);
            this.view.render();
        },

        "Should show itself when needed": function () {
            var previewNode,
                height,
                newWidth = 600,
                oneMoreWidth = 700,
                xy;

            this.view.render();
            this.view.show(newWidth);
            previewNode = this.view.get('container').get('parentNode');
            previewNode.scrollIntoView();
            xy = previewNode.getXY();

            height = previewNode.get('winHeight');
            Assert.areEqual(
                newWidth, previewNode.get('offsetWidth'),
                "The width of the preview should be set to the expected with"
            );
            Assert.areEqual(
                height, previewNode.get('offsetHeight'),
                "The height of the preview should be set to the viewport height"
            );
            Assert.areEqual(
                newWidth*2, xy[0],
                "x should be twice the width"
            );
            Assert.areEqual(
                previewNode.get('docScrollY'), xy[1],
                "y should be the Y scroll position"
            );
            Assert.isFalse(
                previewNode.hasClass(IS_HIDDEN_CLASS),
                "Container's parent node should NOT have the hidden class"
            );

            this.view.show(oneMoreWidth);

            Assert.areEqual(
                newWidth, previewNode.get('offsetWidth'),
                "The width of the preview should be set to the expected with"
            );
            Assert.areEqual(
                height, previewNode.get('offsetHeight'),
                "The height of the preview should be set to the viewport height"
            );
            Assert.areEqual(
                newWidth*2, xy[0],
                "x should be twice the width"
            );
            Assert.areEqual(
                previewNode.get('docScrollY'), xy[1],
                "y should be the Y scroll position"
            );

        },

        "Should show iframe loader once it begins to load": function () {
            this.view.render();

            Assert.isTrue(
                this.view.get('container').hasClass(IS_LOADING_CLASS),
                "The view should be in loading mode"
            );

        },

        "Should hide iframe loader once it is done loading": function () {
            var iframeLoaded = false;

            this.view.render();
            this.view.get('container').one('iframe').onceAfter('load', function () {
                iframeLoaded = true;
            });
            this.waitFor(function () {
                return iframeLoaded;
            }, function () {
                Assert.isFalse(
                    this.view.get('container').hasClass(IS_LOADING_CLASS),
                    "The view should not be in loading mode when the iframe is loaded"
                );
            });
        },

        "Should hide itself once 'Close preview' link is tapped": function () {
            var previewNode, that = this;

            this.view.render();

            previewNode = this.view.get('container').get('parentNode');
            previewNode.one('.ez-preview-hide').simulateGesture('tap', function () {
                that.resume(function () {
                    Y.assert(
                        previewNode.hasClass(IS_HIDDEN_CLASS),
                        "After tapping 'Close preview' tap, the preview should be hidden"
                    );
                });
            });
            this.wait();
        }
    });

    isHiddenTest = new Y.Test.Case({
        name: "eZ Edit Preview View isHiddenTest test",

        setUp: function () {
            this.versionNames = {
                'eng-GB': 'Test name',
            };
            this.contentMock = new Mock();
            Mock.expect(this.contentMock, {
                method: 'get',
                args: [Mock.Value.Any],
                returns: 42,
            });
            this.versionMock = new Mock();
            Mock.expect(this.versionMock, {
                method: 'isNew',
                returns: false,
            });
            Mock.expect(this.versionMock, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'versionNo' ) {
                        return 32;
                    } else if ( attr === 'names' ) {
                        return {'eng-GB': 'Test name'};
                    }
                    Y.fail('Unexpected version.get("' + attr + '")');
                },
            });

            this.view = new Y.eZ.EditPreviewView({
                container: '.container',
                content: this.contentMock,
                version: this.versionMock,
                languageCode: 'eng-GB',
            });
            this.view.render();
        },

        "Should return true": function () {
            Assert.isTrue(
                this.view.isHidden(),
                "The view is hidden by default"
            );
        },

        "Should return false": function () {
            this.view.show(0);
            Assert.isFalse(
                this.view.isHidden(),
                "The view should not be hidden"
            );
        },

        tearDown: function () {
            this.view.destroy();
        },
    });

    Y.Test.Runner.setName("eZ Edit Preview View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(isHiddenTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-editpreviewview']});
