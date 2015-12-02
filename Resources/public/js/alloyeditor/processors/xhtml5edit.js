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
     * Transforms `data` into a XHTML5Edit document.
     *
     * @method process
     * @param {String} data
     * @return {String}
     */
    XHTML5Edit.prototype.process = function (data) {
        // building the XML document by concatening strings is required to get
        // the xhtml5edit format expected by the RichText parser where the
        // section root element has a custom default namespace but it's content
        // is supposed to be a valid XHTML document but in that namespace as
        // well...
        return '<' + ROOT_TAG + ' xmlns="' + NAMESPACE + '">' + data + '</' + ROOT_TAG + '>';
    };

    Y.eZ.EditorContentProcessorXHTML5Edit = XHTML5Edit;
});
