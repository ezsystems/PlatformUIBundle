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
                    return [
                        new Y.eZ.ButtonActionView({
                            actionId: "minimizeActionBar",
                            disabled: false,
                            label:  Y.eZ.Translator.trans('action.minimizeActionBar', {}, 'editorial'),
                            priority: 1000
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "edit",
                            disabled: false,
                            label: Y.eZ.Translator.trans('action.edit', {}, 'editorial'),
                            priority: 200,
                            content: this.get('content')
                        }),
                        new Y.eZ.MoveContentActionView({
                            actionId: "move",
                            label: Y.eZ.Translator.trans('action.move', {}, 'editorial'),
                            priority: 190,
                            location: this.get('location')
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: "copy",
                            disabled: false,
                            label: Y.eZ.Translator.trans('action.copy', {}, 'editorial'),
                            priority: 180
                        }),
                        new Y.eZ.CreateContentActionView({
                            actionId: 'createContent',
                            label: Y.eZ.Translator.trans('action.createContent', {}, 'editorial'),
                            priority: 210,
                            contentType: this.get('contentType')
                        }),
                        new Y.eZ.TranslateActionView({
                            actionId: "translate",
                            disabled: false,
                            label: Y.eZ.Translator.trans('action.translate',{}, 'editorial'),
                            priority: 170,
                            location: this.get('location'),
                            content: this.get('content')
                        }),
                        new Y.eZ.ButtonActionView({
                            actionId: 'sendToTrash',
                            disabled: false,
                            label: Y.eZ.Translator.trans('action.sendToTrash', {}, 'editorial'),
                            priority: 10
                        }),
                    ];
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
