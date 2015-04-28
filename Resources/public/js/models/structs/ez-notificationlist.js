/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notificationlist', function (Y) {
    "use strict";
    /**
     * Provides the notification model list
     *
     * @method ez-notificationlist
     */

    /**
     * The Notification Model List
     *
     * @namespace eZ
     * @class NotificationList
     * @constructor
     * @extends ModelList
     */
    Y.eZ.NotificationList = Y.Base.create('notificationModelList', Y.ModelList, [], {
        model: Y.eZ.Notification,
    });
});
