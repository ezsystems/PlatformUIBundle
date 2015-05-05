/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopresentationview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Studio Presentation View test",

        setUp: function () {
            this.view = new Y.eZ.StudioPresentationView({container: '.container'});
            this.dummyIframeFile = '/Tests/js/assets/dummy-iframe.htm';
            this.view._set('iframeSource', this.dummyIframeFile);
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
            Y.Assert.isTrue(templateCalled, "The template should have been used to render this.view");
        },

        "Test height fit": function () {
            var container = this.view.get('container');
            this.view.render();
            this.view.set('active', true);

            Y.Assert.areSame(
                container.get('winHeight') - container.getY() + "px",
                container.getStyle('height'),
                "The height of the container should have been adapted to the windows size"
            );
        },

        "Should refresh the height of the view": function () {
            var height,
                offset = -42;

            this["Test height fit"]();
            height = parseInt(this.view.get('container').getStyle('height'), 10);

            this.view.refreshTopPosition(offset);
            Y.Assert.areEqual(
                height - offset,
                parseInt(this.view.get('container').getStyle('height'), 10),
                "The height of the view should have been adjusted"
            );
        },

        "Test iframe link": function () {
            var iframeSource;
            this.view.render();
            this.view.set('active', true);

            iframeSource = this.view.get('container').one('.ez-studiopresentation-content').get('src');

            Y.Assert.isTrue(
                iframeSource.indexOf(
                    this.dummyIframeFile,
                    iframeSource.length - this.dummyIframeFile.length
                ) !== -1,
                'Link of the iframe should have been replaced'
            );
        }
    });

    Y.Test.Runner.setName("eZ Studio Presentation View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-studiopresentationview']});
