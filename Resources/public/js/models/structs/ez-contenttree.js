YUI.add('ez-contenttree', function (Y) {
    "user strict";
    /**
     * Provides the content tree structure based on Y.Tree and different plugins
     *
     * @module ez-contenttree
     */
    Y.namespace('eZ');

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
