/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverybrowseview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery browse method
     *
     * @module ez-universaldiscoverybrowseview
     */
    Y.namespace('eZ');

    /**
     * The universal discovery browse method view. It allows the user to pick
     * one or several contents in the repository by browsing using a tree and
     * the children list.
     *
     * @namespace eZ
     * @class UniversalDiscoveryBrowseView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.eZ.UniversalDiscoveryBrowseView = Y.Base.create('universalDiscoveryBrowseView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {
        initializer: function () {
            this._set('title', 'Browse');
            this._set('identifier', 'browse');
        },

        render: function () {
            this.get('container').setHTML(this.template({
                title: this.get('title'),
                identifier: this.get('identifier'),
            }));
            return this;
        },
    });
});
