/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtextfocusmodebarview', function (Y) {
    "use strict";
    /**
     * Provides the rich text focus mode bar view
     *
     * @module ez-richtextfocusmodebarview
     */
    Y.namespace('eZ');

    /**
     * The rich text focus mode bar
     *
     * @namespace eZ
     * @class RichTextFocusModeBarView
     * @constructor
     * @extends eZ.BarView
     */
    Y.eZ.RichTextFocusModeBarView = Y.Base.create('richTextFocusModeBarView', Y.eZ.BarView, [], {
    }, {
        ATTRS: {
            actionsList: {
                valueFn: function () {
                    return [
                        new Y.eZ.ButtonActionView({
                            actionId: "saveReturn",
                            disabled: false,
                            label: "Save and return",
                            priority: 1000
                        }),
                    ];
                }
            },
        }
    });
});
