/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubviewservice-tests', function (Y) {
    var getViewParametersTest, notificationTest,
        Assert = Y.Assert;

    getViewParametersTest = new Y.Test.Case({
        name: "eZ Notification Hub View Service getViewParameters test",

        setUp: function () {
            this.service = new Y.eZ.NotificationHubViewService();
        },

        tearDown: function () {
            this.service.destroy();
        },

        "Should return the notification list": function () {
            Assert.areSame(
                this.service.get('notificationList'),
                this.service.getViewParameters().notificationList,
                "The view parameters should contain the notification list"
            );
        },
    });

    notificationTest = new Y.Test.Case({
        name: "eZ Notification Hub View Service notification test",

        setUp: function () {
            this.identifier = 'concert';
            this.service = new Y.eZ.NotificationHubViewService();
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should add the new notification to the list": function () {
            var notification = {
                    identifier: this.identifier,
                    text: 'Foo Fighters',
                    state: 'waiting'
                },
                list = this.service.get('notificationList');

            this.service.set('parameters', {notification: notification});
            Assert.areEqual(
                1, list.size(),
                "The list should contain one notification"
            );
            Assert.isInstanceOf(
                Y.eZ.Notification, list.getById(notification.identifier),
                "The list should contain the new notification"
            );
        },

        "Should update the notification": function () {
            var list = this.service.get('notificationList'),
                newState = 'got-tickets';

            this["Should add the new notification to the list"]();

            this.service.set('parameters', {
                notification: {
                    identifier: this.identifier,
                    state: newState,
                }
            });
            Assert.areEqual(
                newState, list.getById(this.identifier).get('state'),
                "The notification model should have been updated"
            );
        },

        "Should ignore a parameters object without notification": function () {
            this.service.set('parameters', {});

            Assert.areEqual(
                0, this.service.get('notificationList').size(),
                "The notification list should be empty"
            );
        },
    });

    Y.Test.Runner.setName("eZ Notification Hub View Service tests");
    Y.Test.Runner.add(getViewParametersTest);
    Y.Test.Runner.add(notificationTest);
}, '', {requires: ['test', 'ez-notificationhubviewservice']});
