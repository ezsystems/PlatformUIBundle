/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationhubview-tests', function (Y) {
    var renderTest, listEventTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Notification Hub View render test",

        setUp: function () {
            this.notificationList = new Y.eZ.NotificationList();
            this.notificationList.add([{
                identifier: 'music',
                text: 'Red Hot Chili Peppers - Strip My Mind',
                state: 'playing'
            }, {
                identifier: 'email',
                text: '11 unread emails',
                state: 'unread'
            }]);
            this.view = new Y.eZ.NotificationHubView({
                notificationList: this.notificationList,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should use a UL element as container": function () {
            this.view.render();

            Assert.areEqual(
                'UL', this.view.get('container').get('tagName'),
                "The container should be a UL element"
            );
        },

        "Should render each notification": function () {
            var container = this.view.get('container');

            this.view.render();
            Assert.areEqual(
                this.notificationList.size(),
                container.all('li').size(),
                "The container should contain as many li element as the notification list"
            );
        },
    });

    listEventTest = new Y.Test.Case({
        name: "eZ Notification Hub View list event test test",

        setUp: function () {
            this.identifier = 'music';
            this.notificationList = new Y.eZ.NotificationList();
            this.view = new Y.eZ.NotificationHubView({
                notificationList: this.notificationList,
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should render the added notification": function () {
            this.view.render();
            this.notificationList.add({
                identifier: this.identifier,
                text: 'Foo Fighters',
                state: 'playing',
            });
            Assert.areEqual(
                this.notificationList.size(),
                this.view.get('container').all('li').size(),
                "The container should contain as many li element as the notification list"
            );
        },

        "Should remove the rendered notification": function () {
            var notification;

            this["Should render the added notification"]();
            notification = this.notificationList.getById(this.identifier);
            notification.destroy();

            Assert.areEqual(
                0, this.view.get('container').get('children').size(),
                "The view container should be empty"
            );
        },
    });

    Y.Test.Runner.setName("eZ Notification Hub View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(listEventTest);
}, '', {requires: ['test', 'ez-notificationhubview']});
