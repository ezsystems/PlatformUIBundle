/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-expandable', function (Y) {
    "use strict";
    /**
     * The expandable extension
     *
     * @module ez-expandable
     */
    Y.namespace('eZ');

    var IS_EXPANDED = "is-expanded";

    /**
     * Views extension providing the concept of expanded state. When `expanded`,
     * the view container gets the `is-expanded` class which allows to style the
     * view accordingly.
     *
     * @namespace eZ
     * @class Expandable
     * @extensionfor Y.View
     */
    Y.eZ.Expandable = Y.Base.create('expandableExtension', Y.View, [], {
        initializer: function () {
            this.after('expandedChange', function (e) {
                var container = this.get('container');

                if ( e.newVal ) {
                    container.addClass(IS_EXPANDED);
                } else {
                    container.removeClass(IS_EXPANDED);
                }
            });
        },
    }, {
        ATTRS: {
            /**
             * Expanded state
             *
             * @attribute expanded
             * @default false
             * @type Boolean
             */
            expanded: {
                value: false
            },

            /**
             * The node which is expanded
             *
             * @attribute expandableNode
             * @type Y.Node
             * @readOnly
             */
            expandableNode: {
                readOnly: true,
                getter: function () {
                    return this.get('container').one('.ez-expandable-area');
                },
            },
        }
    });
});
