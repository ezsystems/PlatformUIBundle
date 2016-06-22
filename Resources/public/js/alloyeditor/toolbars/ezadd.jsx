/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-alloyeditor-toolbar-ezadd', function (Y) {
    "use strict";
    /**
     * Provides the `ezadd` toolbar
     *
     * @module ez-alloyeditor-toolbar-ezadd
     */
    Y.namespace('eZ');

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ToolbarAdd = Y.extend(
            React.createClass({render: function () {}}), AlloyEditor.Toolbars.add,
            {}, AlloyEditor.Toolbars.add
        );

    /**
     * The `ezadd` toolbar. It extends the AlloyEditor's `add` toolbar to be
     * rendered even if the focused element in the editor is a non editable
     * element. This is useful so that it's possible to add something after a
     * CKEditor widget (ie embed or image).
     *
     * @namespace eZ.AlloyEditor.Toolbars
     * @class ezadd
     * @constructor
     * @extends AlloyEditor.Toolbars.add
     */

    ToolbarAdd.key = 'ezadd';

    /**
     * Renders the `ezadd` toolbar. It overrides the AlloyEditor `add` toolbar
     * implementation to render the toolbar even if the focused element is not
     * contenteditable.
     *
     * @method render
     */
    ToolbarAdd.prototype.render = function () {
        var buttons = this._getButtons(),
            className = this._getToolbarClassName();

        return (
            <div
                aria-label={AlloyEditor.Strings.add} className={className}
                data-tabindex={this.props.config.tabIndex || 0} onFocus={this.focus}
                onKeyDown={this.handleKey} role="toolbar" tabIndex="-1">
                <div className="ae-container">
                    {buttons}
                </div>
            </div>
        );
    };

    AlloyEditor.Toolbars[ToolbarAdd.key] = ToolbarAdd;
});
