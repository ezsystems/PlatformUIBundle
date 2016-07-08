/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-resolveimage', function (Y) {
    "use strict";
    /**
     * Provides the resolve image richtext processor
     *
     * @module ez-richtext-resolveimage
     */
    Y.namespace('eZ');

    /**
     * The Richtext resolve image processor
     *
     * @namespace eZ
     * @class RichTextResolveImage
     * @extends eZ.RichTextResolveEmbed
     * @constructor
     */
    var ResolveImage = function () { };

    Y.extend(ResolveImage, Y.eZ.RichTextResolveEmbed);

    ResolveImage.prototype._getEmbedList = function (view) {
        var embeds = view.get('container').all('.ez-embed-type-image[data-ezelement="ezembed"]'),
            list = new Y.NodeList();

        embeds.each(function (embed) {
            if ( !this._getEmbedContent(embed) ) {
                list.push(embed);
            }
        }, this);
        return list;
    };

    ResolveImage.prototype._renderSelectedContent = function (view, embedStruct, mapNodes) {
        var content = embedStruct.content,
            contentId = embedStruct.contentInfo.get('contentId'),
            contentType = embedStruct.contentType,
            embedNodes = mapNodes[contentId],
            imageField;

        if ( !embedNodes ) {
            return;
        }

        imageField = content.get('fields')[contentType.getFieldDefinitionIdentifiers('ezimage')[0]];
        embedNodes.forEach(function (node) {
            this._renderLoadingEmbed(node);
            this._loadVariation(view, content, imageField, node);
        }, this);
        delete mapNodes[contentId];
    };

    ResolveImage.prototype._loadEmbeds = function (mapNode, view) {
        view.fire('contentSearch', {
            viewName: 'resolveimage-field-' + view.get('field').id,
            search: {
                criteria: {'ContentIdCriterion': Object.keys(mapNode).join(',')},
                offset: 0,
            },
            loadContent: true,
            loadContentType: true,
            callback: Y.bind(this._renderEmbed, this, mapNode, view),
        });
    };

    ResolveImage.prototype._renderEmbed = function (mapNode, view, error, results) {
        results.forEach(function (struct) {
            var content = struct.content,
                contentType = struct.contentType,
                imageField;

            imageField = content.get('fields')[contentType.getFieldDefinitionIdentifiers('ezimage')[0]];
            mapNode[content.get('contentId')].forEach(Y.bind(this._loadVariation, this, view, content, imageField));
        }, this);
    };

    /**
     * Fires the loadImageVariation event to load the image variation to display
     * in the image embed.
     *
     * @method _loadVariation
     * @private
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @param {eZ.Content} content
     * @param {Object} imageField
     * @param {Node} embedNode
     */
    ResolveImage.prototype._loadVariation = function (view, content, imageField, embedNode) {
        view.fire('loadImageVariation', {
            variation: this._getEmbedVariation(embedNode),
            field: imageField,
            callback: Y.bind(function (error, variation) {
                this._unsetLoading(embedNode);
                this._getEmbedContent(embedNode).remove(true);
                this._renderImage(embedNode, content, variation);
            }, this),
        });
    };

    /**
     * Renders the image inside the embed node.
     *
     * @method _renderImage
     * @protected
     * @param {Node} embedNode
     * @param {eZ.Content} content
     * @param {Object} variation
     */
    ResolveImage.prototype._renderImage = function (embedNode, content, variation) {
        var img = Y.Node.create('<img class="ez-embed-content">');

        img.setAttribute('src', variation.uri);
        img.setAttribute('alt', content.get('name'));
        embedNode.append(img);
    };

    /**
     * Returns the image variation for the embedNode.
     *
     * @method _getEmbedVariation
     * @protected
     * @param {Node} embedNode
     * @return {String}
     */
    ResolveImage.prototype._getEmbedVariation = function (embedNode) {
        var sizeNode = embedNode.one('[data-ezvalue-key="size"]');

        return sizeNode ? sizeNode.getContent() : 'medium';
    };

    Y.eZ.RichTextResolveImage = ResolveImage;
});
