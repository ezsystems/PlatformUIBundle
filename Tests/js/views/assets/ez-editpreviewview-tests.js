/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editpreviewview-tests', function (Y) {
    var IS_HIDDEN_CLASS = 'is-editpreview-hidden',
        IS_LOADING_CLASS = 'is-loading',
        viewTest;

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
            var previewNode = this.view.get('container').get('parentNode'),
                newWidth = 600,
                oneMoreWidth = 700;

            this.view.show(newWidth);

            Y.Assert.areEqual(parseInt(previewNode.getComputedStyle('width'),10), newWidth);
            Y.assert(!previewNode.hasClass(IS_HIDDEN_CLASS), "Container's parent node should NOT have certain class" );

            this.view.show(oneMoreWidth);

            Y.assert(
                parseInt(previewNode.getComputedStyle('width'),10) == newWidth,
                "Should correctly interpret 'show' command even if already visible"
            );
            Y.assert(!previewNode.hasClass(IS_HIDDEN_CLASS), "Container's parent node should NOT have certain class" );
        },

        "Should show iframe loader once it begins to load": function () {
            var loader;

            this.view.render();
            loader = this.view.get('container').one('.ez-loader');

            Y.assert(loader.hasClass(IS_LOADING_CLASS), "Right after rendering, iframe loader should have certain class");

        },

        "Should hide iframe loader once it is done loading": function () {
            var loader;

            this.view.render();
            loader = this.view.get('container').one('.ez-loader');

            this.wait(function () {
                Y.assert(!loader.hasClass(IS_LOADING_CLASS), "After iframe is done loading, iframe loader should NOT have certain class");
            }, 800);
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
