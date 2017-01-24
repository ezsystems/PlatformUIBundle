/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-config-link', function (Y) {
    "use strict";
     /**
     * Provides the AlloyEditor `styles` toolbar configuration for paragraphs.
     *
     * @module ez-alloyeditor-toolbar-config-paragraph
     */
    Y.namespace('eZ.AlloyEditorToolbarConfig');

    /* global CKEDITOR */
    var AlloyEditor = Y.eZ.AlloyEditor,
        ReactDOM = Y.eZ.ReactDOM;

    /**
     * `styles` toolbar configuration for links
     *
     * @namespace eZ.AlloyEditorToolbarConfig
     * @class Link
     */
    Y.eZ.AlloyEditorToolbarConfig.Link = {
        name: 'link',
        buttons: ['linkEdit'],
        test: AlloyEditor.SelectionTest.link,
        getArrowBoxClasses: function () {
            return 'ae-arrow-box ae-arrow-box-bottom';
        },
        setPosition: function (payload) {
            var domElement = new CKEDITOR.dom.element(ReactDOM.findDOMNode(this)),
                region = payload.selectionData.region,
                xy = this.getWidgetXYPoint(
                    region.left, region.top,
                    CKEDITOR.SELECTION_BOTTOM_TO_TOP
                );

            domElement.addClass('ae-toolbar-transition');
            domElement.setStyles({left: xy[0] + 'px', top: xy[1] + 'px'});

            return true;
        },
    };
});

