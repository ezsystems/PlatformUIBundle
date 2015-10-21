/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-roleserversideview-tests', function (Y) {
    var assignTest,
        Assert = Y.Assert;

    assignTest = new Y.Test.Case({
        name: "eZ Role Server Side assign role tests",

        init: function () {
            this.content = Y.one('.container').getHTML();
        },

        setUp: function () {
            this.view = new Y.eZ.RoleServerSideView({
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
                button = container.one('.ez-role-assign-button'),
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
                        button.getAttribute('data-role-rest-id'),
                        e.config.data.roleId,
                        "The role id should be available in the config data"
                    );
                    Assert.areEqual(
                        button.getAttribute('data-role-name'),
                        e.config.data.roleName,
                        "The role name should be available in the config data"
                    );
                    Assert.areSame(
                        e.config.cancelDiscoverHandler,
                        e.config.data.afterUpdateCallback,
                        "The config data should contain the unset loading function"
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
                button = container.one('.ez-role-assign-button'),
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

        "Should unset the loading state of button": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-role-assign-button'),
                that = this;

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
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Role Server Side View tests");
    Y.Test.Runner.add(assignTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-roleserversideview']});
