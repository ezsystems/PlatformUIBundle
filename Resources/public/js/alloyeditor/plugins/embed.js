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
     * `ezembed` elements as widget.
     *
     * @class CKEDITOR.plugins.ezembed
     * @constructor
     */
    CKEDITOR.plugins.add('ezembed', {
        requires: 'widget',

        init: function (editor) {
            editor.widgets.add('ezembed', {
                template: '<ezembed href="ezlocation://2" data-ezview="embed" />',
                requiredContent: 'ezembed',

                upcast: function (element) {
                    return element.name === 'ezembed';
                },
            });
        },
    });
});
