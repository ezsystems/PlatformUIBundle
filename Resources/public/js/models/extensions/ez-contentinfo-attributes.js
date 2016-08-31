/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentinfo-attributes', function (Y) {
    "use strict";
    /**
     * The content info attributes extension. As of 1.6 it is deprecated.
     *
     * @module ez-contentinfo-attributes
     * @deprecated use ez-contentinfo-base instead
     */
    Y.namespace('eZ');

    console.warn('[DEPRECATED] ez-contentinfo-attributes module and Y.eZ.ContentInfoAttributes are deprecated');
    console.warn('[DEPRECATED] ez-contentinfo-attributes module and Y.eZ.ContentInfoAttributes will be removed in PlatformUI 2.0');
    console.warn('[DEPRECATED] use ez-contentinfo-base and Y.eZ.ContentInfoBase instead');

    Y.eZ.ContentInfoAttributes = Y.eZ.ContentInfoBase;
});
