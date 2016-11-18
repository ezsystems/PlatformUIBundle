/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryselectedview-tests', function (Y) {
    var renderTest, domEventTest, startAnimationTest, confirmButtonStateTest, imageTest,
        openContentPeekTest,
        Assert = Y.Assert, Mock = Y.Mock,
        _configureMock = function (type, content, currentVersion, translations, imageFieldTab) {
            Mock.expect(type, {
                method: 'toJSON',
                returns: {},
            });
            Mock.expect(content, {
                method: 'toJSON',
                returns: {},
            });
            Mock.expect(content, {
                method: 'getFieldsOfType',
                args: [type, 'ezimage', translations[0]],
                returns: imageFieldTab,
            });
            Mock.expect(content, {
                method: 'get',
                args: [Mock.Value.String],
                run: function (attr) {
                    if ( attr === 'currentVersion' ) {
                        return currentVersion;
                    } else if ( attr === 'mainLanguageCode' ) {
                        return translations[0];
                    }
                    Assert.fail('Unexpect content.get("' + attr + '")');
                },
            });
            Mock.expect(currentVersion, {
                method: 'getTranslationsList',
                returns: translations,
            });
        };

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected render tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoverySelectedView();
        },

        "Should use the template": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };

            this.view.render();
            Assert.isTrue(templateCalled, "render should use the template");
        },

        "Should pass the content, contentInfo, location, contentType and translations to the template": function () {
            var origTpl = this.view.template,
                translations = ['LYO-69', 'FRA-fr'],
                location, contentInfo, type, content, currentVersion,
                tplLocation = {}, tplContentInfo = {}, tplType = {}, tplContent = {};

            location = new Mock();
            content = new Mock();
            contentInfo = new Mock();
            type = new Mock();
            currentVersion = new Mock();

            _configureMock(type, content, currentVersion, translations, []);

            Mock.expect(location, {
                method: 'toJSON',
                returns: tplLocation,
            });
            Mock.expect(contentInfo, {
                method: 'toJSON',
                returns: tplContentInfo,
            });
            Mock.expect(content, {
                method: 'toJSON',
                returns: tplContent,
            });

            Mock.expect(type, {
                method: 'toJSON',
                returns: tplType,
            });
            this.view.set('contentStruct', {
                content: content,
                location: location,
                contentInfo: contentInfo,
                contentType: type,
            });
            this.view.set('addConfirmButton', true);
            this.view.template = function (variables) {
                Assert.areSame(
                    tplLocation, variables.location,
                    "The toJSON result of the location should be available in the template"
                );
                Assert.areSame(
                    tplContentInfo, variables.contentInfo,
                    "The toJSON result of the content info should be available in the template"
                );
                Assert.areSame(
                    tplContent, variables.content,
                    "The toJSON result of the content should be available in the template"
                );
                Assert.areSame(
                    tplType, variables.contentType,
                    "The toJSON result of the content type should be available in the template"
                );
                Assert.areSame(
                    translations.join(', '), variables.translations,
                    "The toJSON result of the content type should be available in the template"
                );
                Assert.isTrue(
                    variables.addConfirmButton,
                    "The addConfirmButton flag should be available in the template"
                );
                Assert.isTrue(
                    variables.confirmButtonEnabled,
                    "The confirmButtonEnabled flag should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };

            this.view.render();
        },

        "Should pass false as the contentInfo, location and type if no content struct is set": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Assert.isFalse(variables.content, "The content variable should be false");
                Assert.isFalse(variables.contentInfo, "The content variable should be false");
                Assert.isFalse(variables.location, "The location variable should be false");
                Assert.isFalse(variables.contentType, "The contentType variable should be false");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should rerender the view when the contentStruct changes": function () {
            var rerendered = false,
                origTpl = this.view.template,
                type, content, currentVersion;

            type = new Mock();
            content = new Mock();
            currentVersion = new Mock();

            _configureMock(type, content, currentVersion, [], []);

            this.view.render();
            this.view.template = function () {
                rerendered = true;
                return origTpl.apply(this, arguments);
            };

            this.view.set('contentStruct', {content: content, contentType: type});
            Assert.isTrue(rerendered, "The view should have been rerendered");
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },
    });

    domEventTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected DOM event tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoverySelectedView({container: '.container'});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the confirmSelectedContent event": function () {
            var container = this.view.get('container'),
                type = new Mock(),
                content = new Mock(),
                currentVersion = new Mock(),
                struct = {content: content, contentType: type},
                that = this;

            _configureMock(type, content, currentVersion, ['fre-FR'], []);

            this.view.set('addConfirmButton', true);
            this.view.set('contentStruct', struct);
            this.view.render();

            this.view.on('confirmSelectedContent', function (e) {
                that.resume(function () {
                    Assert.areSame(
                        struct, e.selection,
                        "The contentStruct being displayed should be available in the event facade"
                    );

                    Assert.isFalse(
                        this.view.get('confirmButtonEnabled'),
                        "The confirm button should be disabled"
                    );
                });
            });
            container.one('.ez-ud-selected-confirm').simulateGesture('tap');
            this.wait();
        },
    });

    startAnimationTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected startAnimation tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoverySelectedView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should return null if the animation element is not there": function () {
            Assert.isNull(
                this.view.startAnimation(),
                "startAnimation should return null"
            );
        },

        "Should return the animation element with the is-animated class": function () {
            var elt;

            this.view.render();
            elt = this.view.startAnimation();
            Assert.isInstanceOf(
                Y.Node, elt,
                "startAnimation should return a Y.Node"
            );
            Assert.isTrue(
                elt.hasClass('is-animated'),
                "startAnimation should add the is-animated class"
            );
        },

    });

    confirmButtonStateTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected confirm button state tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoverySelectedView({'addConfirmButton': true});
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not try to update the state of the button": function () {
            this.view.set('addConfirmButton', false);
            this.view.set('confirmButtonEnabled', false);

            Assert.isFalse(
                this.view.get('container').one('.ez-ud-selected-confirm').get('disabled'),
                "The button should not be disabled"
            );
        },

        "Should disable the button": function () {
            this["Should enable the button"]();
            this.view.set('confirmButtonEnabled', false);

            Assert.isTrue(
                this.view.get('container').one('.ez-ud-selected-confirm').get('disabled'),
                "The button should be disabled"
            );
        },

        "Should enable the button": function () {
            this.view.set('confirmButtonEnabled', true);

            Assert.isFalse(
                this.view.get('container').one('.ez-ud-selected-confirm').get('disabled'),
                "The button should not be disabled"
            );
        },

        "Should reset the animation": function () {
            var elt, style;

            this["Should disable the button"]();
            elt = this.view.startAnimation();
            elt.setStyle('left', "42px");
            style = elt.getAttribute('style');

            this.view.set('confirmButtonEnabled', true);
            Assert.isFalse(
                elt.hasClass('is-animated'),
                "The animated element should not have the animated class"
            );
            Assert.areNotEqual(
                style, elt.getAttribute('style'),
                "The style attribute should be removed"
            );
        },

        "Should set confirm button state when the contentStruct changes": function () {
            var isAlreadySelected1 = function (contentStruct) {return false;},
                isAlreadySelected2 = function (contentStruct) {return true;},
                isselectable1 = function (contentStruct) {return false;},
                isselectable2 = function (contentStruct) {return true;},
                location = new Mock(),
                content = new Mock(),
                contentInfo = new Mock(),
                type = new Mock(),
                currentVersion = new Mock(),
                contentStruct = {
                    location: location,
                    contentInfo: contentInfo,
                    contentType: type,
                    content: content,
                };

            Mock.expect(location, {
                method: 'toJSON',
                returns: {},
            });
            Mock.expect(contentInfo, {
                method: 'toJSON',
                returns: {},
            });
            _configureMock(type, content, currentVersion, ['fre-FR'], []);

            this.view.set('isAlreadySelected', isAlreadySelected1);
            this.view.set('isSelectable', isselectable1);
            this.view.set('contentStruct', contentStruct);
            Assert.isFalse(this.view.get('confirmButtonEnabled'), "The confirm button should be disabled");

            this.view.set('isAlreadySelected', isAlreadySelected2);
            this.view.set('isSelectable', isselectable1);
            this.view.set('contentStruct', contentStruct);
            Assert.isFalse(this.view.get('confirmButtonEnabled'), "The confirm button should be disabled");

            this.view.set('isAlreadySelected', isAlreadySelected1);
            this.view.set('isSelectable', isselectable2);
            this.view.set('contentStruct', contentStruct);
            Assert.isTrue(this.view.get('confirmButtonEnabled'), "The confirm button should be enabled");

            this.view.set('isAlreadySelected', isAlreadySelected2);
            this.view.set('isSelectable', isselectable2);
            this.view.set('contentStruct', contentStruct);
            Assert.isFalse(this.view.get('confirmButtonEnabled'), "The confirm button should be disabled");
        },
    });

    imageTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected image tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoverySelectedView({container: '.container'});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should set the imageField attribute when content have an image field": function () {
            var type = new Mock(),
                content = new Mock(),
                currentVersion = new Mock(),
                struct = {content: content, contentType: type},
                imageField = {fieldValue: "42"},
                imageFieldTab = [imageField];

            _configureMock(type, content, currentVersion, ['fre-FR'], imageFieldTab);

            this.view.render();
            this.view.set('contentStruct', struct);

            Assert.areSame(
                this.view.get('imageField'),
                imageField,
                "Should set the imageField attribute"
            );
            Assert.areSame(
                this.view.get('imageState'),
                'image-loading',
                "ImageState should be set to loading"
            );
        },

        "Should NOT set the imageField attribute when content do not have an image field": function () {
            var type = new Mock(),
                content = new Mock(),
                currentVersion = new Mock(),
                struct = {content: content, contentType: type};

            _configureMock(type, content, currentVersion, ['fre-FR'], '');

            this.view.render();
            this.view.set('contentStruct', struct);

            Assert.isNull(
                this.view.get('imageField'),
                "Should NOT set the imageField attribute"
            );
            Assert.areSame(
                this.view.get('imageState'),
                'no-image',
                "ImageState should be set to no-image"
            );
            Assert.isNull(
                this.view.get('imageVariation'),
                "imageVarriation should be set to null"
            );
        },

        "Should render image variation on imageVariationChange": function () {
            var imageVariation = {uri:  "http://ezplatform/var/site/storage/images/images.jpg"},
                container = this.view.get('container');

            this.view.render();
            this.view.set('imageVariation', imageVariation);

            Assert.areSame(
                this.view.get('imageState'),
                'image-loaded',
                "ImageState should be set to loaded"
            );

            Assert.areSame(
                imageVariation.uri,
                container.one('.ez-ud-selected-image').getAttribute('src'),
                "Should render image Variation"
            );
        },

        "Should set the imageState to 'image-error' on error": function () {
            this.view.set('loadingError', true);

            Assert.areEqual(
                "image-error", this.view.get('imageState'),
                "The `imageState` attribute should be set to 'image-error'"
            );
        },

        "Should set the imageState to 'image-loading' after loadImageVariation event": function () {
            this.view.fire('loadImageVariation');

            Assert.areEqual(
                "image-loading", this.view.get('imageState'),
                "The `imageState` attribute should be set to 'image-loading'"
            );
        },

        "Should fire 'loadImageVariation'  event when setting 'imageField'": function () {
            var fired = false,
                variationIdentifier = "oOOOooOOOoo",
                type = new Mock(),
                content = new Mock(),
                currentVersion = new Mock(),
                struct = {content: content, contentType: type},
                imageField = {fieldValue: "42"},
                imageFieldTab = [imageField];

            _configureMock(type, content, currentVersion, ['fre-FR'], imageFieldTab);

            this.view.render();
            this.view.set('variationIdentifier', variationIdentifier);
            this.view.set('contentStruct', struct);

            this.view.on('loadImageVariation', function (e) {
                Assert.areSame(
                    e.field,
                    imageField,
                    "The event should have a field"
                );
                Assert.areSame(
                    e.variation,
                    variationIdentifier,
                    "The event should have a field"
                );
                fired = true;
            });
            this.view.set('imageField', imageField);
            Assert.isTrue(fired, 'Event should have been fired');
        },

        "Should add loaded image state class on the container when image is loaded": function () {
            var container = this.view.get('container');

            this.view._set('imageState', "image-loading");
            Assert.isTrue(container.hasClass('is-state-image-loading'), 'Container should have "is-state-image-loading" class');

            this.view._set('imageState', "image-loaded");
            Assert.isFalse(container.hasClass('is-state-image-loading'), 'Container should NOT have "is-state-image-loading" class');
            Assert.isTrue(container.hasClass('is-state-image-loaded'), 'Container should have "is-state-image-loaded" class');
        },

        "Should add error image state class on the container when image can not load": function () {
            var container = this.view.get('container');

            this.view._set('imageState', "image-loading");
            Assert.isTrue(container.hasClass('is-state-image-loading'), 'Container should have "is-state-image-loading" class');

            this.view._set('imageState', "image-error");
            Assert.isFalse(container.hasClass('is-state-image-loading'), 'Container should NOT have "is-state-image-loading" class');
            Assert.isTrue(container.hasClass('is-state-image-error'), 'Container should have "is-state-image-error" class');
        },
    });

    openContentPeekTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Selected open content peek tests',

        setUp: function () {
            var contentType = new Mock(),
                content = new Mock(),
                location = new Mock(),
                currentVersion = new Mock();

            this.view = new Y.eZ.UniversalDiscoverySelectedView({
                container: '.container',
            });

            _configureMock(contentType, content, currentVersion, ['fre-FR'], []);
            Mock.expect(location, {
                method: 'toJSON',
                returns: {},
            });
            this.view.set('contentStruct', {
                contentType: contentType,
                content: content,
                location: location,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should fire the content peek": function () {
            var container = this.view.get('container'),
                visual = container.one('.ez-ud-selected-visual');

            container.once('tap', function (e) {
                Assert.isTrue(
                    !!e.prevented,
                    "The tap event should have been prevented"
                );
            });
            this.view.on('contentPeekOpen', this.next(function () {}));
            visual.simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Selected View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
    Y.Test.Runner.add(startAnimationTest);
    Y.Test.Runner.add(confirmButtonStateTest);
    Y.Test.Runner.add(imageTest);
    Y.Test.Runner.add(openContentPeekTest);
}, '', {requires: ['test', 'node-style', 'node-event-simulate', 'ez-universaldiscoveryselectedview']});
