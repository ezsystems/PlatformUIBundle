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
                    view: "ezembed",
                },
                draggable: false,
                template: '<div data-ezelement="embed" data-href="{href}" data-ezview="{view}">{content}</div>',
                requiredContent: 'div',

                upcast: function (element) {
                    return (
                        element.name === 'div' &&
                        element.attributes['data-ezelement'] === 'embed'
                    );
                },

                init: function () {
                    this.on('focus', this._fireEditorInteraction);
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
