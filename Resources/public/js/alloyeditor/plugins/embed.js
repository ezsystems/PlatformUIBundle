/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR */
YUI.add('ez-alloyeditor-plugin-embed', function (Y) {
    "use strict";

    if (CKEDITOR.plugins.get('ezembed')) {
        return;
    }

    /**
     * CKEditor plugin to configure the widget plugin so that it recognizes the
     * `div[data-ezelement="embed"]` elements as widget.
     *
     * @class CKEDITOR.plugins.ezembed
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
                },

                /**
                 * Sets the `href` of the embed is URI to the embed content or
                 * location. (ezcontent://32 for instance).
                 *
                 * @method setHref
                 * @param {String} href
                 */
                setHref: function (href) {
                    this.element.data('href', href);
                },

                /**
                 * Sets the widget content. It makes sure the config element is
                 * not overwritten.
                 *
                 * @method setWidgetContent
                 * @param {String|CKEDITOR.dom.node} content
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
                },

                /**
                 * Sets a config value under the `key` for the embed.
                 *
                 * @method setConfig
                 * @param {String} key
                 * @param {String} value
                 */
                setConfig: function (key, value) {
                    var valueElement = this.element.findOne('[data-ezelement="ezvalue"][data-ezvalue-key="' + key + '"]');
                    if ( !valueElement ) {
                        valueElement = new CKEDITOR.dom.element('span');
                        valueElement.data('ezelement', 'ezvalue');
                        valueElement.data('ezvalue-key', key);
                        this._getEzConfigElement().append(valueElement);
                    }
                    valueElement.setText(value);
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
