/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemgriditemview', function (Y) {
    "use strict";
    /**
     * Provides the subitem grid item view.
     *
     * @module ez-subitemgriditemview
     */
    Y.namespace('eZ');

    /**
     * The subitem grid item view.
     *
     * @class SubitemGridItemView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemGridItemView = Y.Base.create('subitemGridItemView', Y.eZ.TemplateBasedView, [], {
        render: function () {
            this.get('container').setHTML(this.template({
                content: this.get('content').toJSON(),
                location: this.get('location').toJSON(),
                contentType: this.get('contentType').toJSON(),
            }));
            return this;
        },
    }, {
        ATTRS: {
            /**
             * The content type of the content being displayed
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             */
            contentType: {},

            /**
             * The location of the content item being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             */
            location: {},

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             */
            content: {},
        },
    });
});
