/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxview-tests', function (Y) {
    var renderTest, confirmEventTest,
        cancelEventTest, updateTitleTest, buttonsTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Confirm Box View render test",

        setUp: function () {
            this.title = "Airbourne - Too Much, Too Young, Too Fast";
            this.view = new Y.eZ.ConfirmBoxView({
                container: '.container',
                title: this.title,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },

        "Test available variables in the template": function () {
            var origTpl = this.view.template,
                that = this;

            this.view.template = function (variables) {
                Assert.isObject(variables, "The template should receive some variables");
                Assert.areEqual(2, Y.Object.keys(variables).length, "The template should receive 2 variables");
                Assert.areSame(
                    that.title, variables.title,
                    "The title should be available in the template"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
        },
    });

    confirmEventTest = new Y.Test.Case({
        name: "eZ Confirm Box View confirm event test",

        setUp: function () {
            this.view = new Y.eZ.ConfirmBoxView({
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the confirmBoxClose event": function () {
            var confirmBoxCloseFired = false;

            this.view.on('confirmBoxClose', function (e) {
                confirmBoxCloseFired = true;
            });
            this.view.fire('confirm');
            Assert.isTrue(
                confirmBoxCloseFired,
                "The confirmBoxClose should have been fired"
            );
        },

        "Should call the confirmHandler function": function () {
            var confirm2 = false,
                customAttrValue = {},
                handler1 = function () {
                    Assert.fail("This handler should have been replaced");
                },
                handler2 = function (e) {
                    Assert.isObject(
                        e, "The handler should receive the event facade"
                    );
                    Assert.areSame(
                        customAttrValue, e.customAttr,
                        "The handler should receive the event facade"
                    );
                    confirm2 = true;
                };
            
            this.view.set('confirmHandler', handler1);
            this.view.set('confirmHandler', handler2);
            this.view.fire('confirm', {
                customAttr: customAttrValue,
            });
            Assert.isTrue(
                confirm2, "The second handler should have been called"
            );
        },

        "Should reset the state of the view": function () {
            this.view.set('title', "Random title");
            this.view.set('confirmHandler', function () { });
            this.view.set('cancelHandler', function () { });

            this.view.fire('confirm');
            Assert.areEqual(
                "", this.view.get('title'),
                "The title should be resetted"
            );
            Assert.isNull(
                this.view.get('confirmHandler'),
                "The confirmHandler should be set to null"
            );
            Assert.isNull(
                this.view.get('cancelHandler'),
                "The cancelHandler should be set to null"
            );
        },

        "Should reset the state of the view without handlers": function () {
            this.view.set('title', "Random title");

            this.view.fire('confirm');
            Assert.areEqual(
                "", this.view.get('title'),
                "The title should be resetted"
            );
        },
    });

    cancelEventTest = new Y.Test.Case({
        name: "eZ Confirm Box View cancel event test",

        setUp: function () {
            this.view = new Y.eZ.ConfirmBoxView({
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the confirmBoxClose event": function () {
            var confirmBoxCloseFired = false;

            this.view.on('confirmBoxClose', function (e) {
                confirmBoxCloseFired = true;
            });
            this.view.fire('cancel');
            Assert.isTrue(
                confirmBoxCloseFired,
                "The confirmBoxClose should have been fired"
            );
        },

        "Should call the cancelHandler function": function () {
            var cancel2 = false,
                customAttrValue = {},
                handler1 = function () {
                    Assert.fail("This handler should have been replaced");
                },
                handler2 = function (e) {
                    Assert.isObject(
                        e, "The handler should receive the event facade"
                    );
                    Assert.areSame(
                        customAttrValue, e.customAttr,
                        "The handler should receive the event facade"
                    );
                    cancel2 = true;
                };
            
            this.view.set('cancelHandler', handler1);
            this.view.set('cancelHandler', handler2);
            this.view.fire('cancel', {
                customAttr: customAttrValue,
            });
            Assert.isTrue(
                cancel2, "The second handler should have been called"
            );
        },

        "Should reset the state of the view": function () {
            this.view.set('title', "Random title");
            this.view.set('cancelHandler', function () { });
            this.view.set('cancelHandler', function () { });

            this.view.fire('cancel');
            Assert.areEqual(
                "", this.view.get('title'),
                "The title should be resetted"
            );
            Assert.isNull(
                this.view.get('confirmHandler'),
                "The confirmHandler should be set to null"
            );
            Assert.isNull(
                this.view.get('cancelHandler'),
                "The cancelHandler should be set to null"
            );
        },

        "Should reset the state of the view without handlers": function () {
            this.view.set('title', "Random title");

            this.view.fire('cancel');
            Assert.areEqual(
                "", this.view.get('title'),
                "The title should be resetted"
            );
        },
    });

    updateTitleTest = new Y.Test.Case({
        name: "eZ Confirm Box View update title test",

        setUp: function () {
            this.view = new Y.eZ.ConfirmBoxView({
                container: '.container',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should update the title in the rendered view": function () {
            var title = "Airboure - What's Eatin' You";

            this.view.render();
            this.view.set('title', title);
            this.view.set('active', true);

            console.log( this.view.get('container').one('.ez-confirmbox-title').get('innerHTML'));
            Assert.areEqual(
                title, this.view.get('container').one('.ez-confirmbox-title').get('text'),
                "The title should have been updated"
            );
        },
    });

    buttonsTest = new Y.Test.Case({
        name: "eZ Confirm Box View update title test",

        setUp: function () {
            this.view = new Y.eZ.ConfirmBoxView({
                container: '.container',
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the `confirm` event": function () {
            var that = this;

            this.view.on('confirm', function () {
                that.resume();
            });
            this.view.get('container').one('.ez-confirmbox-confirm').simulateGesture('tap');
            this.wait();
        },

        "Should fire the `cancel` event": function () {
            var that = this;

            this.view.on('cancel', function () {
                that.resume();
            });
            this.view.get('container').one('.ez-confirmbox-close').simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Confirm Box View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(confirmEventTest);
    Y.Test.Runner.add(cancelEventTest);
    Y.Test.Runner.add(updateTitleTest);
    Y.Test.Runner.add(buttonsTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-confirmboxview']});
