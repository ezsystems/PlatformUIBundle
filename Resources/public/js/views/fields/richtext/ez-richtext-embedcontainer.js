/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-embedcontainer', function (Y) {
    "use strict";
    /**
     * Provides the embedcontainer richtext processor
     *
     * @module ez-richtext-embedcontainer
     */
    Y.namespace('eZ');

    /**
     * The Richtext embed container processor
     *
     * @namespace eZ
     * @class RichTextEmbedContainer
     * @constructor
     */
    Y.eZ.RichTextEmbedContainer = function () {};

    /**
     * Adds an element container to the element representing an embed element
     *
     * @method process
     * @param {Y.View} view
     */
    Y.eZ.RichTextEmbedContainer.prototype.process = function (view) {
        view.get('container').all('[data-ezelement="ezembed"]').each(function (embed) {
            var container = Y.Node.create('<div class="ez-richtext-embedcontainer" />');

            container.setAttribute('data-ezalign', embed.getAttribute('data-ezalign'));
            embed.insert(container, 'before');
            container.append(embed);
        });
    };
});
