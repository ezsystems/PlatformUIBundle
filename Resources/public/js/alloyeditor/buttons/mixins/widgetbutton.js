/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-button-mixin-widgetbutton', function (Y) {
    "use strict";

    /**
     * Provides the WidgetButton mixin
     *
     * @module ez-alloyeditor-button-mixin-widgetbutton
     */
    Y.namespace('eZ.AlloyEditorButton');

    var React = Y.eZ.React;

    /**
     * WidgetButton is a mixin to represent a button related to a CKEditor
     * widget.
     *
     * @class WidgetButton
     * @namespace eZ.AlloyEditorButton
     */
    Y.eZ.AlloyEditorButton.WidgetButton = {
        propTypes: {
            /**
             * The editor instance where the component is being used.
             *
             * @property {Object} editor
             */
            editor: React.PropTypes.object.isRequired,
        },

        /**
         * Returns the ezembed widget instance for the current selection.
         *
         * @method _getWidget
         * @return CKEDITOR.plugins.widget
         */
        _getWidget: function () {
            var editor = this.props.editor.get('nativeEditor'),
                wrapper;

            wrapper = editor.getSelection().getStartElement();
            return editor.widgets.getByElement(wrapper);
        },
    };
});
