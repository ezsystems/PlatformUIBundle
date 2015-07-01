/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewtabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View Tab View base class
     *
     * @module ez-universaldiscoveryview
     */
    Y.namespace('eZ');

    /**
     * The location view tab view base class. It defines the minimum required
     * attributes for a tab in the location view.
     *
     * @namespace eZ
     * @class LocationViewTabView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.LocationViewTabView = Y.Base.create('locationViewTabView', Y.eZ.TemplateBasedView, [], {
    }, {
        ATTRS: {
            /**
             * The title of the tab displayed in the label lists
             *
             * @attribute title
             * @type {String}
             * @required
             */
            title: {},

            /**
             * The identifier of the tab. 
             *
             * @attribute identifier
             * @type {String}
             * @required
             */
            identifier: {},

            /**
             * The priority of the tab in the list.
             *
             * @attribute priority
             * @type {Number}
             * @default 0
             */
            priority: {
                value: 0
            },

            /**
             * The current selected state of the tab. It becomes true when the
             * tab is visible.
             *
             * @attribute selected
             * @type {Boolean}
             * @default false
             */
            selected: {
                value: false,
            },
        }
    });
});
