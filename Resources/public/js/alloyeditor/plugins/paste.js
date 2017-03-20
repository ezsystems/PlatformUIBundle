/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-paste', function (Y) {
    "use strict";

    if (CKEDITOR.plugins.get('ezpaste')) {
        return;
    }

    /**
     * Strips the paragraph from the list item ie transform
     *
     *     <ul><li><p>Foo <b>bar</b></p></li></ul>
     *
     * into
     *
     *     <ul><li>Foo <b>bar</b></li></ul>
     *
     * @method stripParagraphFromListItem
     * @private
     * @param {String} htmlCode
     * @return {String}
     */
    function stripParagraphFromListItem (htmlCode) {
        var doc = document.createDocumentFragment(),
            root = document.createElement('div'),
            forEach = Array.prototype.forEach;

        doc.appendChild(root);
        root.innerHTML = htmlCode;
        forEach.call(root.querySelectorAll('li p'), function (paragraph) {
            var li = paragraph.parentNode;

            while ( paragraph.firstChild ) {
                li.appendChild(paragraph.firstChild);
            }
            li.removeChild(paragraph);
        });
        return root.innerHTML;
    }

    /**
     * Applies the paste filter to the given html code.
     *
     * @method applyPasteFilter
     * @param {CKEDITOR.editor} editor
     * @param {String} htmlCode
     * @private
     * @return {String}
     */
    function applyPasteFilter (editor, htmlCode) {
        var fragment = CKEDITOR.htmlParser.fragment.fromHtml(htmlCode),
            writer = new CKEDITOR.htmlParser.basicWriter();

        editor.pasteFilter.applyTo(fragment);
        fragment.writeHtml(writer);
        return writer.getHtml();
    }

    /**
     * Configure the paste behaviour so that it matches what RichText and our
     * current implementation of AlloyEditor/CKEditor actually support.
     *
     * @class ezpaste
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezpaste', {
        requires: 'clipboard',
        init: function (editor) {
            editor.pasteFilter = new CKEDITOR.filter({
                'p h1 h2 h3 h4 h5 h6 ul li ol thead th tbody tfoot tr': true,
                'td th': {
                    attributes: ['colspan', 'rowspan'],
                },
                'table': {
                    attributes: 'border',
                },
                'strong b i em u': true,
                'a': {
                    attributes: '!href',
                },
            });

            editor.on('paste', function (e) {
                if ( e.data.dontFilter ) {
                    // even if `dontFilter` was set, we DO want to apply the
                    // paste filter because pastefromword filtering is not good
                    // enough for our very strict and restrictive html5edit
                    // RichText parser.
                    // See https://jira.ez.no/browse/EZP-26390
                    e.data.dataValue = applyPasteFilter(editor, e.data.dataValue);
                }
                e.data.dataValue = stripParagraphFromListItem(e.data.dataValue);
            });
        },
    });
});
