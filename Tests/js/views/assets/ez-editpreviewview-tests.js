/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editpreviewview-tests', function (Y) {
    var IS_HIDDEN_CLASS = 'is-editpreview-hidden',
        IS_LOADING_CLASS = 'is-loading',
        viewTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Edit Preview View test",

        setUp: function () {
            this.mockContent = new Y.eZ.Content({
                contentId: 59,
                name: "Test name"
            });
            this.mockVersion = new Y.eZ.Version({
                versionNo: 42,
                names: {value: [{'_languageCode': 'eng-GB', '#text': 'Test name'}]}
            });

            this.view = new Y.eZ.EditPreviewView({
                container: '.container',
                content: this.mockContent,
                version: this.mockVersion
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Test render": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Y.Assert.isTrue(templateCalled, "The template should have used to render the this.view");
            Y.Assert.areNotEqual("", this.view.get('container').getHTML(), "View container should contain the result of the this.view");

            Assert.isTrue(
                this.view.get('container').hasClass(IS_LOADING_CLASS),
                "The container should have the loading class"
            );
        },

        "Test available variable in template": function () {
            var origTpl = this.view.template;
            this.view.template = function (variables) {
                Y.Assert.isObject(variables, "The template should receive some variables");
                Y.Assert.areEqual(3, Y.Object.keys(variables).length, "The template should receive 3 variables");
                Y.Assert.isObject(variables.mode, "mode should be available in the template and should be an object");
                Y.Assert.isString(variables.legend, "legend should be available in the template and should be a string");
                Y.Assert.isString(variables.source, "source should be available in the template and should be a string");
                return origTpl.apply(this, arguments);
            };
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

    Y.Test.Runner.setName("eZ Edit Preview View tests");
    Y.Test.Runner.add(viewTest);

}, '', {requires: ['test', 'node-event-simulate', 'ez-editpreviewview', 'ez-contentmodel', 'ez-versionmodel']});
