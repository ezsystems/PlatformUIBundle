/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-embed', function (Y) {
    "use strict";

    var IMAGE_TYPE_CLASS = 'ez-embed-type-image',
        ALIGNMENT_CLASS_PREFIX = 'ez-object-align-',
        DATA_ALIGNMENT_ATTR = 'ez-alignment';

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
        requires: 'widget',

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

                init: function () {
                    this.on('focus', this._fireEditorInteraction);

                    this._syncAlignment();
                },

                /**
                 * Initializes the alignment on the widget wrapper if the widget
                 * element has an alignment class (`ez-object-align-.*`).
                 *
                 * @method _syncAlignment
                 * @protected
                 */
                _syncAlignment: function () {
                    var types = Array.prototype.filter.call(this.element.$.classList, function (cl) {
                            return cl.indexOf(ALIGNMENT_CLASS_PREFIX) === 0;
                        });

                    if ( types[0] ) {
                        this.setAlignment(types[0].replace(ALIGNMENT_CLASS_PREFIX, ''));
                    }
                },

                /**
                 * Sets the alignment of the embed widget to `type`. The
                 * alignment is set by adding the `data-ez-alignment` attribute
                 * on the widget wrapper and the `ez-object-<type>̀` class on the
                 * widget element.
                 *
                 * @method setAlignment
                 * @param {String} type
                 */
                setAlignment: function (type) {
                    var current = this._getAlignment();

                    if  ( current ) {
                        this.unsetAlignment(current);
                    }
                    this.wrapper.data(DATA_ALIGNMENT_ATTR, type);
                    this.element.addClass(this._getAlignmentClass(type));
                },

                /**
                 * Removes the `type` alignment of the widget.
                 *
                 * @method unsetAlignment
                 * @param {String} type
                 */
                unsetAlignment: function (type) {
                    this.wrapper.data(DATA_ALIGNMENT_ATTR, '');
                    this.element.removeClass(this._getAlignmentClass(type));
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
                 * Returns the alignment ie the value of the
                 * `data-ez-alignment` attribute on the widget wrapper
                 *
                 * @method _getAlignment
                 * @protected
                 * @return {String|Null}
                 */
                _getAlignment: function () {
                    return this.wrapper.data(DATA_ALIGNMENT_ATTR);
                },

                /**
                 * Builds the alignment class for the given `type`
                 *
                 * @method _getAlignmentClass
                 * @param {String} type
                 * @protected
                 * @return {String}
                 */
                _getAlignmentClass: function (type) {
                    return ALIGNMENT_CLASS_PREFIX + type;
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
                 * UI remains visible and is updated.
                 *
                 * @method _fireEditorInteraction
                 * @protected
                 * @param {Object} evt this initial event info object
                 */
                _fireEditorInteraction: function (evt) {
                    var e = {
                            editor: editor,
                            target: this.element.$,
                            name: "widget" + evt.name,
                        };

                    editor.fire('editorInteraction', {
                        nativeEvent: e,
                        selectionData: {},
                    });
                },
            });
        },
    });
});
