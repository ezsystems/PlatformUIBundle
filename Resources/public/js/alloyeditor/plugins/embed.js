/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-embed', function (Y) {
    "use strict";

    var IMAGE_TYPE_CLASS = 'ez-embed-type-image',
        DATA_ALIGNMENT_ATTR = 'ezalign',
        reloadEmbedTimeout = null;

    if (CKEDITOR.plugins.get('ezembed')) {
        return;
    }

    /**
     * CKEditor plugin to configure the widget plugin so that it recognizes the
     * `div[data-ezelement="embed"]` elements as widget.
     *
     * @class ezembed
     * @namespace CKEDITOR.plugins
     * @constructor
     */
    CKEDITOR.plugins.add('ezembed', {
        requires: 'widget,ezaddcontent',

        init: function (editor) {
            editor.widgets.add('ezembed', {
                defaults: {
                    href: "ezcontent://57",
                    content: "home",
                    view: "embed",
                },
                draggable: false,
                template: '<div data-ezelement="ezembed" data-href="{href}" data-ezview="{view}">{content}</div>',
                requiredContent: 'div',

                upcast: function (element) {
                    return (
                        element.name === 'div' &&
                        element.attributes['data-ezelement'] === 'ezembed'
                    );
                },

                /**
                 * Insert an `ezembed` widget in the editor. It overrides the
                 * default implementation to make sure that in the case where an
                 * embed widget is focused, a new one is added after it.
                 *
                 * @method insert
                 */
                insert: function () {
                    var element = CKEDITOR.dom.element.createFromHtml(this.template.output(this.defaults)),
                        wrapper = editor.widgets.wrapElement(element, this.name),
                        temp = new CKEDITOR.dom.documentFragment(wrapper.getDocument()),
                        instance;

                    editor.undoManager.lock();

                    temp.append(wrapper);
                    editor.widgets.initOn(element, this.name);
                    editor.eZ.appendElement(wrapper);

                    instance = editor.widgets.getByElement(wrapper);
                    instance.ready = true;
                    instance.fire('ready');
                    instance.focus();
                },

                /**
                 * It's not possible to *edit* an embed widget in AlloyEditor,
                 * so `edit` directly calls `insert` instead. This is needed
                 * because by default, the CKEditor engine calls this method
                 * when an embed widget has the focus and the `ezembed` command
                 * is executed. In AlloyEditor, we want to insert a new widget,
                 * not to `edit` the focused widget as the editing process is
                 * provided by the style toolbar.
                 *
                 * @method edit
                 */
                edit: function () {
                    this.insert();
                },

                init: function () {
                    this.on('focus', this._fireEditorInteraction);
                    this._syncAlignment();
                    this._getEzConfigElement();
                    this.setWidgetContent('');
                    this._cancelEditEvents();
                    this._attachUndoListener();
                },

                /**
                 * Attaches event listener for the undo in CKEditor.
                 *
                 * @method _attachUndoListener
                 * @private
                 */
                _attachUndoListener: function () {
                    editor.on('afterCommandExec', function(e) {
                        if (e.data.name === 'undo') {
                            window.clearTimeout(reloadEmbedTimeout);

                            editor.fire('showLoading');

                            reloadEmbedTimeout = window.setTimeout(function() {
                                editor.fire('snapshotRestored');
                            }, 1000);
                        }
                    });
                },

                /**
                 * Cancels the widget events that trigger the `edit` event as
                 * an embed widget can not be edited in a *CKEditor way*.
                 *
                 * @method _cancelEditEvents
                 * @private
                 */
                _cancelEditEvents: function () {
                    var cancel = function (e) {
                            e.cancel();
                        };

                    this.on('doubleclick', cancel, null, null, 5);
                    this.on('key', cancel, null, null, 5);
                },

                /**
                 * Initializes the alignment on the widget wrapper if the widget
                 * is aligned.
                 *
                 * @method _syncAlignment
                 * @protected
                 */
                _syncAlignment: function () {
                    var align = this.element.data(DATA_ALIGNMENT_ATTR);

                    if ( align ) {
                        this._setAlignment(align);
                    } else {
                        this._unsetAlignment();
                    }
                },

                /**
                 * Sets the alignment of the embed widget to `type`. The
                 * alignment is set by adding the `data-ezalign` attribute
                 * on the widget wrapper and the widget element.
                 *
                 * @method _setAlignment
                 * @protected
                 * @param {String} type
                 */
                _setAlignment: function (type) {
                    this.wrapper.data(DATA_ALIGNMENT_ATTR, type);
                    this.element.data(DATA_ALIGNMENT_ATTR, type);
                },

                /**
                 * Sets the alignment of the embed widget to `type` and fires
                 * the corresponding `editorInteraction` event.
                 *
                 * @method setAlignment
                 * @param {String} type
                 */
                setAlignment: function (type, fireEvent) {
                    this._setAlignment(type);
                    this._fireEditorInteraction('setAlignment' + type);
                },

                /**
                 * Removes the alignment of the widget.
                 *
                 * @method _unsetAlignment
                 * @protected
                 */
                _unsetAlignment: function () {
                    this.wrapper.data(DATA_ALIGNMENT_ATTR, false);
                    this.element.data(DATA_ALIGNMENT_ATTR, false);
                },

                /**
                 * Removes the alignment of the widget and fires the
                 * corresponding `editorInteraction` event.
                 *
                 * @method unsetAlignment
                 */
                unsetAlignment: function () {
                    this._unsetAlignment();
                    this._fireEditorInteraction('unsetAlignment');
                },

                /**
                 * Checks whether the embed is aligned with `type` alignment.
                 *
                 * @method isAligned
                 * @param {String} type
                 * @return {Boolean}
                 */
                isAligned: function (type) {
                    return (this.wrapper.data(DATA_ALIGNMENT_ATTR) === type);
                },

                /**
                 * Set the embed as an embed representing an image
                 *
                 * @method setImageType
                 * @return {CKEDITOR.plugins.widget}
                 */
                setImageType: function () {
                    this.element.addClass(IMAGE_TYPE_CLASS);
                    return this;
                },

                /**
                 * Check whether the embed widget represents an image or not.
                 *
                 * @method isImage
                 * @return {Boolean}
                 */
                isImage: function () {
                    return this.element.hasClass(IMAGE_TYPE_CLASS);
                },

                /**
                 * Sets the `href` of the embed is URI to the embed content or
                 * location. (ezcontent://32 for instance).
                 *
                 * @method setHref
                 * @param {String} href
                 * @return {CKEDITOR.plugins.widget}
                 */
                setHref: function (href) {
                    this.element.data('href', href);
                    return this;
                },

                /**
                 * Returns the `href`of the embed.
                 *
                 * @method getHref
                 * @return {String}
                 */
                getHref: function () {
                    return this.element.data('href');
                },

                /**
                 * Sets the widget content. It makes sure the config element is
                 * not overwritten.
                 *
                 * @method setWidgetContent
                 * @param {String|CKEDITOR.dom.node} content
                 * @return {CKEDITOR.plugins.widget}
                 */
                setWidgetContent: function (content) {
                    var element = this.element.getFirst(), next;

                    while ( element ) {
                        next = element.getNext();
                        if ( !element.data || !element.data('ezelement') ) {
                            element.remove();
                        }
                        element = next;
                    }
                    if ( content instanceof CKEDITOR.dom.node ) {
                        this.element.append(content);
                    } else {
                        this.element.appendText(content);
                    }
                    return this;
                },

                /**
                 * Sets a config value under the `key` for the embed.
                 *
                 * @method setConfig
                 * @param {String} key
                 * @param {String} value
                 * @return {CKEDITOR.plugins.widget}
                 */
                setConfig: function (key, value) {
                    var valueElement = this._getValueElement(key);

                    if ( !valueElement ) {
                        valueElement = new CKEDITOR.dom.element('span');
                        valueElement.data('ezelement', 'ezvalue');
                        valueElement.data('ezvalue-key', key);
                        this._getEzConfigElement().append(valueElement);
                    }
                    valueElement.setText(value);
                    return this;
                },

                /**
                 * Returns the config value for the `key` or undefined if the
                 * config key is not found.
                 *
                 * @method getConfig
                 * @return {String}
                 */
                getConfig: function (key) {
                    var valueElement = this._getValueElement(key);

                    return valueElement ? valueElement.getText() : undefined;
                },

                /**
                 * Returns the Element holding the config under `key`
                 *
                 * @method _getValueElement
                 * @param {String} key
                 * @return {CKEDITOR.dom.element}
                 */
                _getValueElement: function (key) {
                    return this.element.findOne('[data-ezelement="ezvalue"][data-ezvalue-key="' + key + '"]');
                },

                /**
                 * Returns the element used as a container the config values. if
                 * it does not exist, it is created.
                 *
                 * @method _getEzConfigElement
                 * @private
                 * @return {CKEDITOR.dom.element}
                 */
                _getEzConfigElement: function () {
                    var config = this.element.findOne('[data-ezelement="ezconfig"]');

                    if ( !config ) {
                        config = new CKEDITOR.dom.element('span');
                        config.data('ezelement', 'ezconfig');
                        this.element.append(config, true);
                    }
                    return config;
                },

                /**
                 * Fires the editorInteraction event so that AlloyEditor editor
                 * UI remains visible and is updated. This method also computes
                 * `selectionData.region` and the `pageX` and `pageY` properties
                 * so that the add toolbar is correctly positioned on the
                 * widget.
                 *
                 * @method _fireEditorInteraction
                 * @protected
                 * @param {Object|String} evt this initial event info object or
                 * the event name for which the `editorInteraction` is fired.
                 */
                _fireEditorInteraction: function (evt) {
                    var wrapperRegion = this._getWrapperRegion(),
                        name = evt.name || evt,
                        e = {
                            editor: editor,
                            target: this.element.$,
                            name: "widget" + name,
                            pageX: wrapperRegion.left,
                            pageY: wrapperRegion.top + wrapperRegion.height,
                        };

                    editor.focus();
                    this.focus();

                    editor.fire('editorInteraction', {
                        nativeEvent: e,
                        selectionData: {
                            element: this.element,
                            region: wrapperRegion,
                        },
                    });
                },

                /**
                 * Returns the wrapper element region.
                 *
                 * @method _getWrapperRegion
                 * @private
                 * @return {Object}
                 */
                _getWrapperRegion: function () {
                    var scroll = this.wrapper.getWindow().getScrollPosition(),
                        region = this.wrapper.getClientRect();

                    region.top += scroll.y;
                    region.bottom += scroll.y;
                    region.left += scroll.x;
                    region.right += scroll.x;
                    region.direction = CKEDITOR.SELECTION_TOP_TO_BOTTOM;
                    return region;
                },
            });
        },
    });
});
