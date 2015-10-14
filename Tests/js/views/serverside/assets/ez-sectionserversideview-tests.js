/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-sectionserversideview-tests', function (Y) {
    var assignTest,
        Assert = Y.Assert;

    assignTest = new Y.Test.Case({
        name: "eZ Section Server Side assign section tests",

        init: function () {
            this.content = Y.one('.container').getHTML();
        },

        setUp: function () {
            this.view = new Y.eZ.SectionServerSideView({
                container: '.container',
            });
            this.view.render();
            this.view.set('active', true);
            this.view.set('html', this.content);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the contentDiscover event": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-section-assign-button'),
                that = this;

            container.once('tap', function (e) {
                Assert.isTrue(!!e.prevented, "The tap event should have been prevented");
            });
            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        button.getAttribute('data-universaldiscovery-title'),
                        e.config.title,
                        "The event facade should contain a custom title"
                    );
                    Assert.isFunction(
                        e.config.cancelDiscoverHandler,
                        "The event facade should contain the cancelDiscover event handler"
                    );
                    Assert.areEqual(
                        button.getAttribute('data-section-rest-id'),
                        e.config.data.sectionId,
                        "The section id should be available in the config data"
                    );
                    Assert.areEqual(
                        button.getAttribute('data-section-name'),
                        e.config.data.sectionName,
                        "The section name should be available in the config data"
                    );
                    Assert.isFunction(
                        e.config.data.afterUpdateCallback,
                        "The event facade should contain the afterUpdateCallback event handler"
                    );
                    Assert.isTrue(
                        e.config.multiple,
                        "The universal discovery should be configured in multiple mode"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },

        "Should set the loading state of button": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-section-assign-button'),
                that = this;

            button.simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        button.get('disabled'),
                        "The button should be disabled"
                    );
                    Assert.isTrue(
                        button.hasClass('is-loading'),
                        "The button should have the loading class"
                    );
                });
            });
            this.wait();
        },

        "Should unset the loading state of button when cancel is pressed": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-section-assign-button'),
                that = this,
                refreshViewCalled = false;

            this.view.on('refreshView', function (e) {
                refreshViewCalled = true;
            });

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.cancelDiscoverHandler.apply(this);
                    Assert.isFalse(
                        button.get('disabled'),
                        "The button should be enabled"
                    );
                    Assert.isFalse(
                        button.hasClass('is-loading'),
                        "The button should not have the loading class"
                    );
                    Assert.isFalse(
                        refreshViewCalled,
                        "Event `refreshView` should have been fired"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },

        "Should refresh the list after section is assigned": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-section-assign-button'),
                that = this,
                refreshViewCalled = false;

            this.view.on('refreshView', function (e) {
                refreshViewCalled = true;
            });

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {
                    e.config.data.afterUpdateCallback.apply(this);

                    Assert.isTrue(
                        refreshViewCalled,
                        "Event `refreshView` should have been fired"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Section Server Side View tests");
    Y.Test.Runner.add(assignTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-sectionserversideview']});
