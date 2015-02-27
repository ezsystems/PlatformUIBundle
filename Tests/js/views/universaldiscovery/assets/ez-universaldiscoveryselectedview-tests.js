/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryselectedview-tests', function (Y) {
    var renderTest, domEventTest,
        Assert = Y.Assert, Mock = Y.Mock;

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

        "Should pass the content, location and contentType to the template": function () {
            var origTpl = this.view.template,
                location, content, type,
                tplLocation = {}, tplContent = {}, tplType = {};
                
            location = new Mock();
            content = new Mock();
            type = new Mock();

            Mock.expect(location, {
                method: 'toJSON',
                returns: tplLocation,
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
                location: location,
                content: content,
                contentType: type,
            });
            this.view.set('confirmButton', true);
            this.view.template = function (variables) {
                Assert.areSame(
                    tplLocation, variables.location,
                    "The toJSON result of the location should be available in the template"
                );
                Assert.areSame(
                    tplContent, variables.content,
                    "The toJSON result of the content should be available in the template"
                );
                Assert.areSame(
                    tplType, variables.contentType,
                    "The toJSON result of the content type should be available in the template"
                );
                Assert.isTrue(
                    variables.confirmButton,
                    "The confirmButton flag should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };

            this.view.render();
        },

        "Should pass false as the content, location and type if no content struct is set": function () {
            var origTpl = this.view.template;
            
            this.view.template = function (variables) {
                Assert.isFalse(variables.content, "The content variable should be false");
                Assert.isFalse(variables.location, "The location variable should be false");
                Assert.isFalse(variables.contentType, "The contentType variable should be false");
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },

        "Should rerender the view when the contentStruct changes": function () {
            var rerendered = false,
                origTpl = this.view.template;
            
            this.view.render();
            this.view.template = function () {
                rerendered = true;
                return origTpl.apply(this, arguments);
            };

            this.view.set('contentStruct', {});
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
                struct = {},
                that = this;

            this.view.set('contentStruct', struct);
            this.view.render();

            this.view.on('confirmSelectedContent', function (e) {
                that.resume(function () {
                    Assert.areSame(
                        struct, e.selection,
                        "The contentStruct being displayed should be available in the event facade"
                    );
                });
            });
            container.one('.ez-ud-selected-confirm').simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Selected View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(domEventTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryselectedview']});
