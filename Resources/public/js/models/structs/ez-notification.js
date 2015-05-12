/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notification', function (Y) {
    "use strict";
    /**
     * Provides the notification model
     *
     * @method ez-notification
     */

    /**
     * The Notification Model
     *
     * @namespace eZ
     * @class Notification
     * @constructor
     * @extends Model
     */
    Y.eZ.Notification = Y.Base.create('notification', Y.Model, [], {
        idAttribute: 'identifier',
    }, {
        ATTRS: {
            /**
             * The identifier of the notification. It is used as the `id` of the
             * notification so that it's possible to change the attributes of
             * the notification.
             *
             * @attribute identifier
             * @writeOnce
             * @required
             */
            identifier: {
                writeOnce: true,
            },

            /**
             * The text of the notification
             *
             * @attribute text
             * @type {String}
             * @default ''
             */
            text: {
                value: '',
            },

            /**
             * The state of the notification. This state is used to generate and
             * set a state class on the container of the eZ.NotifcationView.
             *
             * @attribute state
             * @type {String|Null}
             * @default null
             */
            state: {
                value: null
            },

            /**
             * The duration in second after which the notification should disappear.
             * Zero means the notification should not automatically disappear.
             *
             * @attribute timeout
             * @type {Number}
             * @default 0
             */
            timeout: {
                value: 0
            },
        }
    });
});
