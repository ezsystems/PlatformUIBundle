/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorbase', function (Y) {
    "use strict";
    /**
     * Provides the base EditorContentProcessor
     *
     * @module ez-editorcontentprocessorbase
     */

    Y.namespace('eZ');

    /**
     * The base EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorBase
     * @constructor
     */
    var Processor = function () {};

    /**
     * Process the `data` and returns a new string version of.
     *
     * @method process
     * @param {String} data the data to process
     * @return {String}
     */
    Processor.prototype.process = function (data) {
        return data;
    };

    Y.eZ.EditorContentProcessorBase = Processor;
});
