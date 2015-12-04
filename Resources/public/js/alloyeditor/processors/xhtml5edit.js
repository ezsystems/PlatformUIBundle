/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorxhtml5edit', function (Y) {
    "use strict";
    /**
     * Provides the xhtml5edit EditorContentProcessor
     *
     * @module ez-editorcontentprocessorxhtml5edit
     */

    Y.namespace('eZ');

    var NAMESPACE = 'http://ez.no/namespaces/ezpublish5/xhtml5/edit',
        XHTML_NS = 'http://www.w3.org/1999/xhtml',
        ROOT_TAG = 'section';

    /**
     * xhtml5edit EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorXHTML5Edit
     * @constructor
     * @extends eZ.EditorContentProcessorBase
     */
    var XHTML5Edit = function () {};

    Y.extend(XHTML5Edit, Y.eZ.EditorContentProcessorBase);

    /**
     * Converts `data` to an XHTML fragment with a `section` root element.
     *
     * @method _xhtmlify
     * @protected
     * @param {String} data
     * @return {String}
     */
    XHTML5Edit.prototype._xhtmlify = function (data) {
        var doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null),
            htmlDoc =  document.implementation.createHTMLDocument(""),
            body = htmlDoc.createElement('body'),
            section = htmlDoc.createElement(ROOT_TAG);

        section.innerHTML = data;
        body.appendChild(section);
        body = doc.importNode(body, true);
        doc.documentElement.appendChild(body);

        return body.innerHTML;
    };

    /**
     * Transforms `data` into a XHTML5Edit document.
     *
     * @method process
     * @param {String} data
     * @return {String}
     */
    XHTML5Edit.prototype.process = function (data) {
        // that's ugly^W^W^Wweird but this allows to get a XHTML5Edit document
        // in relatively clean way.
        return this._xhtmlify(data).replace(XHTML_NS, NAMESPACE);
    };

    Y.eZ.EditorContentProcessorXHTML5Edit = XHTML5Edit;
});
