/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessoremptyembed', function (Y) {
    "use strict";
    /**
     * Provides the empty embed EditorContentProcessor
     *
     * @module ez-editorcontentprocessorxhtml5edit
     */

    Y.namespace('eZ');

    /**
     * empty embed EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorXHTML5Edit
     * @constructor
     * @extends eZ.EditorContentProcessorBase
     */
    var EmptyEmbed = function () {};

    Y.extend(EmptyEmbed, Y.eZ.EditorContentProcessorBase);

    /**
     * Empty the embed node while keeping the embed config if any
     *
     * @method _emptyEmbed
     * @protected
     * @param {DOMNode} embedNode
     */
    EmptyEmbed.prototype._emptyEmbed = function (embedNode) {
        var element = embedNode.firstChild, next;

        while ( element ) {
            next = element.nextSibling;
            if ( !element.getAttribute || !element.getAttribute('data-ezelement') ) {
                embedNode.removeChild(element);
            }
            element = next;
        }
    };

    /**
     * Make sure the embed node are empty.
     *
     * @method process
     * @param {String} data
     * @return {String}
     */
    EmptyEmbed.prototype.process = function (data) {
        var doc = document.createDocumentFragment(),
            root = document.createElement('div'),
            forEach = Array.prototype.forEach;

        root.innerHTML = data;
        doc.appendChild(root);
        forEach.call(
            doc.querySelectorAll('[data-ezelement="ezembed"]'),
            this._emptyEmbed, this
        );

        return root.innerHTML;
    };

    Y.eZ.EditorContentProcessorEmptyEmbed = EmptyEmbed;
});
