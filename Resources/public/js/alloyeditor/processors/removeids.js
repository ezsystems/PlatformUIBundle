/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editorcontentprocessorremoveids', function (Y) {
    "use strict";
    /**
     * Provides the removeids EditorContentProcessor
     *
     * @module ez-editorcontentprocessorremoveids
     */

    Y.namespace('eZ');

    /**
     * removeids EditorContentProcessor.
     *
     * @namespace eZ
     * @class EditorContentProcessorRemoveIds
     * @constructor
     * @extends eZ.EditorContentProcessorBase
     */
    var RemoveIds = function () {};

    Y.extend(RemoveIds, Y.eZ.EditorContentProcessorBase);

    /**
     * Removes the `id` attributes in `data`.
     *
     * @method process
     * @param {String} data
     * @return {String}
     */
    RemoveIds.prototype.process = function (data) {
        var doc = document.createDocumentFragment(),
            root = document.createElement('div'),
            list, i;

        root.innerHTML = data;
        doc.appendChild(root);

        list = doc.querySelectorAll('[id]');
        for (i = 0; i != list.length; ++i) {
            list[i].removeAttribute("id");
        }

        return root.innerHTML;
    };

    Y.eZ.EditorContentProcessorRemoveIds = RemoveIds;
});
