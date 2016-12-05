/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessoremptyembed', function (Y) {
    "use strict";
    /**
     * Provides the empty embed EditorContentProcessor
     *
     * @module ez-editorcontentprocessoremptyembed
     */

    Y.namespace('eZ');

    /**
     * empty embed EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorEmptyEmbed
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
        var element = embedNode.firstChild, next,
            forEach = Array.prototype.forEach, // for PhantomJS 1.9...
            removeClass = function () {};

        while ( element ) {
            next = element.nextSibling;
            if ( !element.getAttribute || !element.getAttribute('data-ezelement') ) {
                embedNode.removeChild(element);
            }
            element = next;
        }
        forEach.call(embedNode.classList, function (cl) {
            var prevRemoveClass = removeClass;
            if ( cl.indexOf('is-embed-') === 0 ) {
                removeClass = function () {
                    embedNode.classList.remove(cl);
                    prevRemoveClass();
                };
            }
        });
        removeClass();
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
