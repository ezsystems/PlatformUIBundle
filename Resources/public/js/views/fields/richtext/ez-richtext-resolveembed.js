/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-resolveembed', function (Y) {
    "use strict";
    /**
     * Provides the resolve embed richtext processor
     *
     * @module ez-richtext-resolveembed
     */
    Y.namespace('eZ');

    /**
     * The Richtext resolve embed processor
     *
     * @namespace eZ
     * @class RichTextEmbedContainer
     * @constructor
     */
    var ResolveEmbed = function () {};

    /**
     * Resolves the embed by search for the corresponding content by content id.
     *
     * @method process
     * @param {eZ.FieldView|eZ.FieldEditView} view
     */
    ResolveEmbed.prototype.process = function (view) {
        var embeds = this._getEmbedList(view),
            mapNode = this._buildEmbedMapNodes(embeds);
        
        this._renderLoadingEmbeds(embeds);
        this._loadEmbeds(mapNode, view);
    };

    /**
     * Returns a node list of nodes representing an embed that are not yet been
     * rendered.
     *
     * @method _getEmbedList
     * @protected
     * @param {eZ.FieldView|eZ.FieldEditView} view
     */
    ResolveEmbed.prototype._getEmbedList = function (view) {
        var embeds = view.get('container').all('[data-ezelement="ezembed"]'),
            list = new Y.NodeList();

        embeds.each(function (embed) {
            if ( !embed.one('.ez-embed-content') ) {
                list.push(embed);
            }
        });

        return list;
    };

    /**
     * Renders the embed as in *loading mode*.
     *
     * @method _renderLoadingEmbeds
     * @protected
     * @param {NodeList} embeds
     */
    ResolveEmbed.prototype._renderLoadingEmbeds = function (embeds) {
        embeds
            .addClass('is-embed-loading')
            .setContent('<p class="ez-embed-content">Loading...</a>');
    };

    /**
     * Search for the content that are embed
     *
     * @method _loadEmbeds
     * @protected
     * @param {Object} mapNode
     * @param {eZ.FieldView|eZ.FieldEditView} view
     */
    ResolveEmbed.prototype._loadEmbeds = function (mapNode, view) {
        view.fire('contentSearch', {
            viewName: 'resolveembed-field-' + view.get('field').id,
            search: {
                criteria: {'ContentIdCriterion': Object.keys(mapNode).join(',')},
                offset: 0,
            },
            callback: Y.bind(this._renderEmbed, this, mapNode),
        });
    };

    /**
     * Renders the embed with the search results
     *
     * @method _renderEmbed
     * @protected
     * @param {Object} mapNode
     * @param {Error|false} error
     * @param {Array} results
     */
    ResolveEmbed.prototype._renderEmbed = function (mapNode, error, results) {
        results.forEach(function (struct) {
            var content = struct.content;

            mapNode[content.get('contentId')].forEach(function (embedNode) {
                embedNode
                    .removeClass('is-embed-loading')
                    .one('.ez-embed-content')
                        .setContent(content.get('name'));
            });
        });
    };

    /**
     * Builds a map between the content id and the embed nodes embedding it.
     *
     * @method _buildEmbedMapNodes
     * @private
     * @param {NodeList} embeds
     * @return {Object}
     */
    ResolveEmbed.prototype._buildEmbedMapNodes = function (embeds) {
        var map = {};

        embeds.each(function (embed) {
            var contentId = this._getEmbedContentId(embed);

            map[contentId] = map[contentId] || [];
            map[contentId].push(embed);
        }, this);
        return map;
    };

    /**
     * Returns the content id of an embed node
     *
     * @method _getEmbedContentId
     * @param {Node} embedNode
     * @private
     * @return {String}
     */
    ResolveEmbed.prototype._getEmbedContentId = function (embedNode) {
        return embedNode.getData('href').replace('ezcontent://', '');
    };

    Y.eZ.RichTextResolveEmbed = ResolveEmbed;
});
