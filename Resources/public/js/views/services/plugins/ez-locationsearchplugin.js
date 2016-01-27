/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationsearchplugin', function (Y) {
    "use strict";
    /**
     * Provides the location search plugin. As of 1.2, this module is
     * deprecated.
     *
     * @module ez-locationsearchplugin
     * @deprecated Use ez-searchplugin instead.
     */
    Y.namespace('eZ.Plugin');

    console.warn('[DEPRECATED] ez-locationsearchplugin module and Y.eZ.Plugin.LocationSearch are deprecated');
    console.warn('[DEPRECATED] ez-locationsearchplugin module and Y.eZ.Plugin.LocationSearch will be removed in PlatformUI 2.0');
    console.warn('[DEPRECATED] use ez-searchplugin and Y.eZ.Plugin.Search instead');

    Y.eZ.Plugin.LocationSearch = Y.eZ.Plugin.Search;
    Y.eZ.Plugin.LocationSearch.NS = 'locationSearch';
});
