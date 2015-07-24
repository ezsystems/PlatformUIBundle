/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
// **NOTICE:**
// THIS IS AN AUTO-GENERATED FILE
// DO YOUR MODIFICATIONS IN THE CORRESPONDING .jsx FILE
// AND REGENERATE IT WITH: grunt jsx
// END OF NOTICE
YUI.add('ez-alloyeditor-toolbar-addcontent', function (Y) {
    "use strict";

    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ToolbarAddContent;

    /**
     * The ToolbarAddContent is a toolbar displayed when the user clicks on the
     * add content button.
     *
     * @uses AlloyEditor.WidgetExclusive
     * @uses AlloyEditor.WidgetDropdown
     * @uses AlloyEditor.WidgetFocusManager
     * @uses AlloyEditor.ToolbarButtons
     *
     * @class eZ.AlloyEditor.ToolbarAddContent
     */
    ToolbarAddContent = React.createClass({displayName: "ToolbarAddContent",
        mixins: [
            AlloyEditor.WidgetExclusive,
            AlloyEditor.WidgetDropdown,
            AlloyEditor.WidgetFocusManager,
            AlloyEditor.ToolbarButtons,
        ],

        statics: {
            key: 'addcontent'
        },

        propTypes: {
            /**
             * Holds the configuration for the addcontent toolbar. It must
             * contain a property `addContentButtonClass` with a string. If
             * an editorInteraction event occurs and the target element of the
             * corresponding native event has this class, the toolbar is shown.
             *
             * @property config
             * @type Object
             * @required
             */
            config: React.PropTypes.object.isRequired,

            /**
             * Holds the AlloyEditor instance
             *
             * @property editor
             * @type AlloyEditor.Core
             * @required
             */
            editor: React.PropTypes.object.isRequired,

            /**
             * The last editor event
             *
             * @property editorEvent
             * @type Object
             */
            editorEvent: React.PropTypes.object,
        },

        getInitialState: function () {
            return {
                visible: false,
                itemExclusive: null
            };
        },

        componentWillReceiveProps: function (newProps) {
            var nativeEventTarget,
                visible = false;

            if ( newProps.editorEvent ) {
                nativeEventTarget = newProps.editorEvent.data.nativeEvent.target;
                visible = (
                    nativeEventTarget &&
                    nativeEventTarget.classList &&
                    nativeEventTarget.classList.contains(
                        newProps.config.addContentButtonClass
                    )
                );
            }
            this.setState({
                visible: visible,
            });
        },

        componentDidMount: function () {
            this._updatePosition();
        },

        componentDidUpdate: function (prevProps, prevState) {
            this._updatePosition();
        },

        /**
         * Updates the position of the toolbar so that it appears on top of the
         * add content button and in the center (horizontal) of the editor.
         *
         * @method _updatePosition
         * @private
         */
        _updatePosition: function () {
            var edRoot = this.props.editor.get('nativeEditor').element,
                staticToolbar = edRoot.findOne('.ez-ae-static-toolbar'),
                toolbarRect = staticToolbar.getClientRect(),
                container = React.findDOMNode(this);

            if ( container ) {
                container.style.top = (toolbarRect.top - container.clientHeight) + 'px';
                container.style.left = (toolbarRect.left + toolbarRect.width/2 - container.clientWidth/2) + 'px';
                container.style.opacity = 1;
            }
        },

        getDefaultProps: function () {
            return {
                circular: true,
                descendants: '.ae-button, .ae-toolbar-element',
                keys: {
                    next: [38, 39],
                    prev: [37, 40]
                }
            };
        },

        render: function () {
            var buttons = this.getToolbarButtons(this.props.config.buttons),
                css = "ae-toolbar-addcontent ae-toolbar-transition ae-arrow-box ae-arrow-box-bottom";

            if ( !this.state.visible ) {
                return null;
            }
            // TODO: remove that config and switch to ESLint
            // see https://jira.ez.no/browse/EZP-23209
            /* jshint maxlen: false */
            return (
                React.createElement("div", {className: css, "data-tabindex": this.props.config.tabIndex || 0, onFocus: this.focus, onKeyDown: this.handleKey, tabIndex: "-1", role: "toolbar"}, 
                    React.createElement("div", {className: "ae-container"}, 
                        buttons
                    )
                )
            );
            /* jshint maxlen: 120 */
        },
    });

    AlloyEditor.Toolbars[ToolbarAddContent.key] = AlloyEditor.ToolbarAddContent = ToolbarAddContent;
});
