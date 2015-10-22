/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeeditserversideview-tests', function (Y) {
    var relationPickRootTest,
        Assert = Y.Assert, Mock = Y.Mock;

    relationPickRootTest = new Y.Test.Case({
        name: "eZ Content Type Edit Server Side pick default root for relations tests",

        init: function () {
            this.content = Y.one('.container').getHTML();
        },

        setUp: function () {
            this.view = new Y.eZ.ContentTypeEditServerSideView({
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
                button = container.one('.ez-relation-pick-root-button'),
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
                    Assert.isFalse(
                        e.config.multiple,
                        "The universal discovery should be configured in single location selection mode"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },

        "Should set selected locationId in input": function () {
            var container = this.view.get('container'),
                button = container.one('.ez-relation-pick-root-button'),
                that = this,
                locationMock = new Mock(),
                contentInfoMock = new Mock(),
                fakeEventFacade = {selection: {location: locationMock, contentInfo: contentInfoMock}};

            Mock.expect(locationMock, {
                method: 'get',
                args: ['locationId'],
                returns: 57
            });
            Mock.expect(contentInfoMock, {
                method: 'get',
                args: ['name'],
                returns: 'jerzy-engel'
            });

            this.view.on('contentDiscover', function (e) {
                that.resume(function () {

                    e.config.contentDiscoveredHandler.call(this, fakeEventFacade);
                    Assert.isNotNull(
                        button.getAttribute('data-relation-root-input-selector'),
                        "Button should have the input selector being set"
                    );
                    Assert.isNotNull(
                        container.one(button.getAttribute('data-relation-root-input-selector')),
                        "Input with passed selector in button's attribute should exist"
                    );
                    Assert.areEqual(
                        container.one(button.getAttribute('data-relation-root-input-selector')).get('value'),
                        locationMock.get('locationId'),
                        "locationId in input should be the same as locationId of selected location"
                    );
                    Assert.isNotNull(
                        button.getAttribute('data-relation-selected-root-name-selector'),
                        "Button should have the content's name container selector being set"
                    );
                    Assert.isNotNull(
                        container.one(button.getAttribute('data-relation-selected-root-name-selector')),
                        "Node for displaying name with passed selector in button's attribute should exist"
                    );
                    Assert.areEqual(
                        container.one(button.getAttribute('data-relation-selected-root-name-selector')).getContent(),
                        contentInfoMock.get('name'),
                        "Name of selected content should be set"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        }
    });

    Y.Test.Runner.setName("eZ Content Type Edit Server Side View tests");
    Y.Test.Runner.add(relationPickRootTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-contenttypeeditserversideview']});
