/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-actionbarview', function (Y) {
    "use strict";
    /**
     * Provides the Action Bar class
     *
     * @module ez-actionbarview
     */
    Y.namespace('eZ');

    /**
     * The action bar
     *
     * @namespace eZ
     * @class ActionBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.ActionBarView = Y.Base.create('actionBarView', Y.eZ.BarView, [], {
    }, {
        ATTRS: {
            /**
             * An array of {{#crossLink
             * "eZ.ButtonActionView"}}eZ.ButtonActionView{{/crossLink}}
             *
             * @attribute actionsList
             * @type Array
             */
            actionsList: {
                valueFn: function () {
                    var actionList = [
                        new Y.eZ.ButtonActionView({
                            actionId: "minimizeActionBar",
                            disabled: false,
                            label: "Minimize",
                            priority: 1000
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "edit",
                            disabled: false,
                            label: "Edit",
                            priority: 200,
                            content: this.get('content')
                        }),
                        new Y.eZ.MoveContentActionView({
                            actionId: "move",
                            label: "Move",
                            priority: 190,
                            location: this.get('location')
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "copy",
                            disabled: false,
                            label: "Copy",
                            priority: 180
                        }),
                        new Y.eZ.CreateContentActionView({
                            actionId: 'createContent',
                            label: 'Create',
                            priority: 210,
                            contentType: this.get('contentType'),
                            config: this.get('config'),
                        }),
                        new Y.eZ.TranslateActionView({
                            actionId: "translate",
                            disabled: false,
                            label: "Translations",
                            priority: 170,
                            location: this.get('location'),
                            content: this.get('content')
                        }),
                    ];

                    if ( !this.get('contentType').hasFieldType('ezuser') ) {
                        actionList.push(
                            new Y.eZ.ButtonActionView({
                                actionId: 'sendToTrash',
                                disabled: this.get('location').isRootLocation(),
                                label: 'Send to Trash',
                                priority: 10
                            })
                        );
                    }
                    else {
                        actionList.push(
                            new Y.eZ.ButtonActionView({
                                actionId: 'deleteContent',
                                disabled: false,
                                label: 'Delete',
                                priority: 10
                            })
                        );
                    }

                    return actionList;
                }
            },

            /**
             * The location being rendered
             *
             * @attribute location
             * @type Y.eZ.Location
             * @writeOnce
             */
            location: {
                writeOnce: "initOnly",
            },

            /**
             * The content associated the current location
             *
             * @attribute content
             * @type Y.eZ.Content
             * @writeOnce
             */
            content: {
                writeOnce: "initOnly",
            },

            /**
             * The content type of the content at the current location
             *
             * @attribute contentType
             * @type Y.eZ.ContentType
             * @writeOnce
             */
            contentType: {
                writeOnce: "initOnly",
            },
        }
    });
});
