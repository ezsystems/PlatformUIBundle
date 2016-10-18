/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorremoveanchors', function (Y) {
    "use strict";
    /**
     * Provides the remove anchors EditorContentProcessor
     *
     * @module ez-editorcontentprocessorremoveanchors
     */

    Y.namespace('eZ');

    /**
     * Remove anchors EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorRemoveAnchors
     * @constructor
     * @extends eZ.EditorContentProcessorBase
     */
    var RemoveAnchors = function () {},
        removeElement = function(element) {
            element.parentNode.removeChild(element);
        };

    Y.extend(RemoveAnchors, Y.eZ.EditorContentProcessorBase);

    /**
     * Remove anchor elements (`a` without `href` attribute)
     *
     * @method process
     * @param {String} data
     * @return {String}
     */
    RemoveAnchors.prototype.process = function (data) {
        var doc = document.createDocumentFragment(),
            root = document.createElement('div'),
            forEach = Array.prototype.forEach;

        root.innerHTML = data;
        doc.appendChild(root);
        forEach.call(doc.querySelectorAll('a:not([href])'), removeElement, this);

        return root.innerHTML;
    };

    Y.eZ.EditorContentProcessorRemoveAnchors = RemoveAnchors;
});
