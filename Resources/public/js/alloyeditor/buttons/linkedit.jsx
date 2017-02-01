YUI.add('ez-alloyeditor-button-linkedit', function (Y) {
    "use strict";
    /**
     * Provides the link edit button
     *
     * @module ez-alloyeditor-button-linkedit
     */
    Y.namespace('eZ.AlloyEditorButton');

    /* global CKEDITOR */
    var AlloyEditor = Y.eZ.AlloyEditor,
        React = Y.eZ.React,
        ButtonLinkEdit;

    /**
     * The ButtonLinkEdit class provides functionality for creating and editing
     * a link in a document.
     *
     * Note: This component overrides the one provided by AlloyEditor by default
     * to give more options and improve the UI.
     *
     * @class ButtonLinkEdit
     * @namespace eZ.AlloyEditorButton
     */
    ButtonLinkEdit = React.createClass({
        propTypes: {
            /**
             * The editor instance where the component is being used.
             *
             * @property {Object} editor
             */
            editor: React.PropTypes.object.isRequired,
        },

        statics: {
            /**
             * The name which will be used as an alias of the button in the
             * configuration.
             *
             * @static
             * @property {String} key
             * @default linkEdit
             */
            key: 'linkEdit'
        },

        componentWillReceiveProps: function(nextProps) {
            this.replaceState(this.getInitialState());
        },

        componentWillUnmount: function () {
            if ( !this.state.discoveringContent && this.state.isTemporary ) {
                this._removeLink();
            }
        },

        /**
         * Lifecycle. Invoked once before the component is mounted.
         * The return value will be used as the initial value of this.state.
         *
         * @method getInitialState
         */
        getInitialState: function() {
            var linkUtils = new CKEDITOR.Link(this.props.editor.get('nativeEditor'), {appendProtocol: false}),
                link = linkUtils.getFromSelection(),
                href = '', target = '', title = '', isTemporary = false;

            if ( link ) {
                href = link.getAttribute('href');
                target = link.hasAttribute('target') ? link.getAttribute('target') : target;
                title = link.getAttribute('title');
                isTemporary = link.hasAttribute('data-ez-temporary-link');
            } else {
                linkUtils.create(href, {"data-ez-temporary-link": true});
                link = linkUtils.getFromSelection();
                isTemporary = true;
            }

            return {
                element: link,
                linkHref: href,
                linkTarget: target,
                linkTitle: title,
                isTemporary: isTemporary,
            };
        },

        /**
         * Runs the Universal Discovery Widget so that the user can pick a
         * Content.
         *
         * @method _selectContent
         * @protected
         */
        _selectContent: function () {
            var editor = this.props.editor.get('nativeEditor');

            this.setState({
                discoveringContent: true,
            }, function () {
                editor.fire('contentDiscover', {
                    config: {
                        title: Y.eZ.trans('select.a.content.to.link.to', {}, 'onlineeditor'),
                        multiple: false,
                        contentDiscoveredHandler: function (e) {
                            this.state.element.setAttribute(
                                'href', 'ezlocation://' + e.selection.location.get('locationId')
                            );
                            this._focusEditedLink();
                        }.bind(this),
                        cancelDiscoverHandler: this._focusEditedLink,
                    }
                });
            });
        },

        /**
         * Gives the focus to the edited link by moving the caret in it.
         *
         * @method _focusEditedLink
         * @protected
         */
        _focusEditedLink: function () {
            var editor = this.props.editor.get('nativeEditor');

            editor.focus();
            editor.eZ.moveCaretToElement(editor, this.state.element);
            editor.fire('actionPerformed', this);
        },

        /**
         * Lifecycle. Renders the UI of the button.
         *
         * @method render
         * @return {Object} The content which should be rendered.
         */
        render: function() {
            var containerClass = "ez-ae-container-edit-link",
                target = this.state.linkTarget;

            if ( this.state.linkHref ) {
                containerClass += " is-linked";
            }
            return (
                <div className={containerClass}>
                    <div className="ez-ae-edit-link-row">
                        <div className="ez-ae-edit-link-block ez-ae-edit-link-block-discover">
                            <label className="ez-ae-edit-label">.</label>
                            <button className="ez-ae-button ez-ae-button-discover" onClick={this._selectContent}>
                                {Y.eZ.trans('select.content', {}, 'onlineeditor')}
                            </button> or
                        </div>
                        <div className="ez-ae-edit-link-block ez-ae-edit-link-block-url">
                            <label className="ez-ae-edit-label">{Y.eZ.trans('link.to', {}, 'onlineeditor')}</label>
                            <input className="ae-input ez-ae-link-href-input"
                                onChange={this._setHref} onKeyDown={this._handleKeyDown}
                                placeholder={Y.eZ.trans('type.or.paste.link', {}, 'onlineeditor')}
                                type="text" value={this.state.linkHref}
                            ></input>
                            <button aria-label={AlloyEditor.Strings.clearInput}
                                className="ez-ae-edit-link-clear ae-button ae-icon-remove"
                                onClick={this._clearLink} title={AlloyEditor.Strings.clear}
                            ></button>
                        </div>
                    </div>
                    <div className="ez-ae-edit-link-row">
                        <div className="ez-ae-edit-link-block">
                            <label className="ez-ae-edit-label">{Y.eZ.trans('title', {}, 'onlineeditor')}</label>
                            <input type="text"
                                className="ae-input ez-ae-link-title-input" onChange={this._setTitle}
                                value={this.state.linkTitle}
                            ></input>
                        </div>
                        <div className="ez-ae-edit-link-block ez-ae-edit-link-block-target">
                            <label className="ez-ae-edit-label">{Y.eZ.trans('open.in', {}, 'onlineeditor')}</label>
                            <label htmlFor="ez-ae-link-target-same" className="ez-ae-edit-link-target-choice">
                                <input type="radio" name="target" id="ez-ae-link-target-same"
                                    value="" defaultChecked={target === ''}
                                    onChange={this._setTarget}
                                />
                                <span className="ez-ae-edit-link-target-name">
                                    {Y.eZ.trans('same.tab', {}, 'onlineeditor')}
                                </span>
                            </label>
                            <label htmlFor="ez-ae-link-target-blank" className="ez-ae-edit-link-target-choice">
                                <input type="radio" name="target" id="ez-ae-link-target-blank"
                                    value="_blank" defaultChecked={target === '_blank'}
                                    onChange={this._setTarget}
                                />
                                <span className="ez-ae-edit-link-target-name">
                                    {Y.eZ.trans('new.tab', {}, 'onlineeditor')}
                                </span>
                            </label>
                        </div>
                    </div>
                    <div className="ez-ae-edit-link-row ez-ae-edit-link-row-buttons">
                        <button className="ez-ae-button ez-ae-remove-link"
                            disabled={this.state.isTemporary} onClick={this._removeLink}>
                            {Y.eZ.trans('link.remove', {}, 'onlineeditor')}
                        </button>
                        <button className="ez-ae-button ez-ae-save-link"
                            disabled={!this.state.linkHref} onClick={this._saveLink}>
                            {Y.eZ.trans('link.save', {}, 'onlineeditor')}
                        </button>
                    </div>
                </div>
            );
        },

        /**
         * Clears the link input. This only changes the component internal
         * state, but does not affect the link element of the editor. Only the
         * _removeLink and _updateLink methods are translated to the editor
         * element.
         *
         * @protected
         * @method _clearLink
         */
        _clearLink: function() {
            this.setState({
                linkHref: ''
            });
        },

        /**
         * Monitors key interaction inside the input element to respond to the
         * keys:
         * - Enter: Creates/updates the link.
         * - Escape: Discards the changes.
         *
         * @protected
         * @method _handleKeyDown
         * @param {SyntheticEvent} event The keyboard event.
         */
        _handleKeyDown: function(event) {
            var editor;

            if (event.keyCode === 13 || event.keyCode === 27) {
                event.preventDefault();
            }

            if (event.keyCode === 13 && event.target.value ) {
                this._saveLink();
            } else if (event.keyCode === 27) {
                editor = this.props.editor.get('nativeEditor');
                new CKEDITOR.Link(editor).advanceSelection();
                editor.fire('actionPerformed', this);
            }
        },

        /**
         * Updates the component state when the link input changes on user
         * interaction.
         *
         * @protected
         * @method _setHref
         * @param {SyntheticEvent} event The change event.
         */
        _setHref: function(event) {
            this.setState({
                linkHref: event.target.value
            });
        },

        /**
         * Sets the link title
         *
         * @method _setTitle
         * @protected
         * @param {SyntheticEvent} e
         */
        _setTitle: function (e) {
            this.setState({
                linkTitle: e.target.value,
            });
        },

        /**
         * Sets the target of the link
         *
         * @method _setTarget
         * @protected
         * @param {SyntheticEvent} e
         */
        _setTarget: function (e) {
            this.setState({
                linkTarget: e.target.value,
            });
        },

        /**
         * Removes the link in the editor element.
         *
         * @protected
         * @method _removeLink
         */
        _removeLink: function() {
            var editor = this.props.editor.get('nativeEditor'),
                linkUtils = new CKEDITOR.Link(editor),
                selection = editor.getSelection(),
                bookmarks = selection.createBookmarks();

            linkUtils.remove(this.state.element, {advance: true});

            selection.selectBookmarks(bookmarks);

            this.props.cancelExclusive();

            editor.fire('actionPerformed', this);
        },

        /**
         * Saves the link with the current href, title and target.
         *
         * @method _saveLink
         * @protected
         */
        _saveLink: function () {
            this.setState({
                isTemporary: false,
            }, function () {
                this._updateLink();
            });
        },

        /**
         * Updates the link in the editor element. If the element didn't exist
         * previously, it will create a new <a> element with the href specified
         * in the link input.
         *
         * @protected
         * @method _updateLink
         */
        _updateLink: function () {
            var editor = this.props.editor.get('nativeEditor'),
                linkUtils = new CKEDITOR.Link(editor),
                linkAttrs = {
                    target: this.state.linkTarget,
                    title: this.state.linkTitle,
                    "data-ez-temporary-link": this.state.isTemporary ? true : null,
                },
                modifySelection = {advance: true};

            if (this.state.linkHref) {
                linkAttrs.href = this.state.linkHref;
                linkUtils.update(linkAttrs, this.state.element, modifySelection);

                editor.fire('actionPerformed', this);
            }

            // We need to cancelExclusive with the bound parameters in case the
            // button is used inside another component in exclusive mode (such
            // is the case of the link button)
            this.props.cancelExclusive();
        }
    });

    AlloyEditor.Buttons[ButtonLinkEdit.key] = AlloyEditor.ButtonLinkEdit = ButtonLinkEdit;

    Y.eZ.AlloyEditorButton.ButtonLinkEdit = ButtonLinkEdit;
});
