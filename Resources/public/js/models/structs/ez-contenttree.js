/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttree', function (Y) {
    "use strict";
    /**
     * Provides the content tree structure based on Y.Tree and different plugins
     *
     * @module ez-contenttree
     */
    Y.namespace('eZ');

    console.log('[DEPRECRATED] eZ.ContentTree is deprecated');
    console.log('[DEPRECRATED] it will be removed from PlatformUI 2.0');
    
    /**
     * Content tree structure
     *
     * @namespace eZ
     * @class ContentTree
     * @constructor
     * @extends Tree
     */
    Y.eZ.ContentTree = Y.Base.create('contentTree', Y.Tree, [
        Y.Tree.Openable,
        Y.Tree.Selectable
    ]);
});
