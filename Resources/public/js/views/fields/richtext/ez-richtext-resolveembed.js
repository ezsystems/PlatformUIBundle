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
     * @class RichTextResolveEmbed
     * @constructor
     */
    var ResolveEmbed = function () {
            /**
             * Contains the message to display when the embed Content item could not
             * be loaded.
             *
             * @property _notLoadedMessage
             * @type {String}
             * @protected
             */
            this._notLoadedMessage = Y.eZ.trans('embed.content.not.loaded', {}, 'fieldedit');
        };

    /**
     * Resolves the embed by search for the corresponding content by content id.
     *
     * @method process
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @param {EventFacade} [event] the event parameters (if any) that triggered
     * the process
     */
    ResolveEmbed.prototype.process = function (view, event) {
        var embeds = this._getEmbedList(view),
            mapNodes = this._buildEmbedMapNodes(embeds);

        if ( event && event.embedStruct ) {
            this._renderSelectedContent(view, event.embedStruct, mapNodes);
        }
        if ( !Y.Object.isEmpty(mapNodes) ) {
            this._renderLoadingEmbedElements(mapNodes);
            this._loadEmbeds(mapNodes, view);
        }
    };

    /**
     * Shows the loading spinner.
     *
     * @method showLoading
     * @param {eZ.FieldView|eZ.FieldEditView} view
     */
    ResolveEmbed.prototype.showLoading = function (view) {
        var embeds = this._getEmbedList(view),
            mapNodes = this._buildEmbedMapNodes(embeds);

        if ( !Y.Object.isEmpty(mapNodes) ) {
            this._renderLoadingEmbedElements(mapNodes);
        }
    };
    /**
     * Loads the embedded contents.
     *
     * @method loadEmbeds
     * @param {eZ.FieldView|eZ.FieldEditView} view
     */
    ResolveEmbed.prototype.loadEmbeds = function (view) {
        var embeds = this._getEmbedList(view, true),
            mapNodes = this._buildEmbedMapNodes(embeds);

        if (!Object.keys(mapNodes).length) {
            view.fire('unlockUndoManager');

            return;
        }

        this._loadEmbeds(mapNodes, view);
    };

    /**
     * Renders the embed from the embedStruct provided in the event parameters
     * that triggered the process.
     *
     * @method _renderSelectedContent
     * @protected
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @param {Object} embedStruct
     * @param {Object} mapNodes
     */
    ResolveEmbed.prototype._renderSelectedContent = function (view, embedStruct, mapNodes) {
        var embedNodes = mapNodes[embedStruct.contentInfo.get('contentId')];

        if ( !embedNodes ) {
            view.fire('unlockUndoManager');

            return;
        }

        embedNodes.forEach(function (node) {
            this._appendContentNode(node)
                .setContent(embedStruct.contentInfo.get('name'));
        }, this);
        delete mapNodes[embedStruct.contentInfo.get('contentId')];

        view.fire('unlockUndoManager');
    };

    /**
     * Returns a node list of nodes representing an embed that are not yet been
     * rendered.
     *
     * @method _getEmbedList
     * @protected
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @return {Y.NodeList}
     */
    ResolveEmbed.prototype._getEmbedList = function (view, force) {
        var embeds = view.get('container').all('[data-ezelement="ezembed"]'),
            list = new Y.NodeList();

        embeds.each(function (embed) {
            if ( !this._getEmbedContent(embed) || force ) {
                list.push(embed);
            }
        }, this);

        return list;
    };

    /**
     * Renders the embeds in the `mapNode` as loading
     *
     * @protected
     * @method _renderLoadingEmbedElements
     * @param {Object} mapNode
     */
    ResolveEmbed.prototype._renderLoadingEmbedElements = function (mapNode) {
        Y.Object.each(mapNode, function (embedNodes) {
            embedNodes.forEach(this._renderLoadingEmbed, this);
        }, this);
    };

    /**
     * Renders the given embed node as loading
     *
     * @protected
     * @method _renderLoadingEmbed
     * @param {Node} node
     */
    ResolveEmbed.prototype._renderLoadingEmbed = function (node) {
        this._setLoading(node);
        this._appendLoadingNode(node);
    };

    /**
     * Renders the embed as in *loading mode*.
     *
     * @method _renderLoadingEmbeds
     * @protected
     * @param {NodeList} embeds
     * @deprecated
     */
    ResolveEmbed.prototype._renderLoadingEmbeds = function (embeds) {
        console.log('[DEPRECATED] _renderLoadingEmbeds is deprecated, it will be removed from PlatformUI 2.0');
        embeds.each(function (embedNode) {
            this._setLoading(embedNode);
            this._appendLoadingNode(embedNode);
        }, this);
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
                filter: {'ContentIdCriterion': Object.keys(mapNode).join(',')},
                offset: 0,
            },
            callback: Y.bind(this._renderEmbed, this, mapNode, view),
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
    ResolveEmbed.prototype._renderEmbed = function (mapNode, view, error, results) {
        var localMapNode = Y.merge(mapNode);

        if ( error ) {
            this._renderNotLoadedEmbed(localMapNode);
            view.fire('unlockUndoManager');

            return;
        }

        results.forEach(function (struct) {
            var content = struct.content;

            localMapNode[content.get('contentId')].forEach(Y.bind(this._renderEmbedContentNode, this, content));
            delete localMapNode[content.get('contentId')];
        }, this);
        this._renderNotLoadedEmbed(localMapNode);

        view.fire('unlockUndoManager');
    };

    /**
     * Renders the content into the embedNode as an embed.
     *
     * @method _renderEmbedContentNode
     * @protected
     * @param {eZ.Content} content
     * @param {Node} embedNode
     */
    ResolveEmbed.prototype._renderEmbedContentNode = function (content, embedNode) {
        this._unsetLoading(embedNode);
        this._getEmbedContent(embedNode).setContent(content.get('name'));
    };

    /**
     * Renders the embed node referenced in mapNode as not loaded.
     *
     * @method _renderNotLoadedEmbed
     * @protected
     * @param {Object} mapNode
     */
    ResolveEmbed.prototype._renderNotLoadedEmbed = function (mapNode) {
        Object.keys(mapNode).forEach(function (missingContentId) {
            mapNode[missingContentId].forEach(function (embedNode) {
                this._unsetLoading(embedNode);
                this._setNotLoaded(embedNode);
            }, this);
        }, this);
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

    /**
     * Adds the loading class on the embed node
     *
     * @method _setLoading
     * @protected
     * @param {Node} embedNode
     * @return {Node} the embedNode
     */
    ResolveEmbed.prototype._setLoading = function (embedNode) {
        return embedNode.addClass('is-embed-loading');
    };

    /**
     * Appends the content node to the embed node.
     *
     * @method _appendContentNode
     * @private
     * @param {Node} embedNode
     * @return {Node} the content node
     */
    ResolveEmbed.prototype._appendContentNode = function (embedNode) {
        embedNode.append('<p class="ez-embed-content"></p>');
        return this._getEmbedContent(embedNode);
    };

    /**
     * Appends the embed content element when in loading mode.
     *
     * @method _appendLoadingNode
     * @protected
     * @param {Node} embedNode
     */
    ResolveEmbed.prototype._appendLoadingNode = function (embedNode) {
        this._appendContentNode(embedNode).setContent(Y.eZ.trans('loading...', {}, 'fieldedit'));
    };

    /**
     * Unsets the loading mode by remove the loading class.
     *
     * @method _unsetLoading
     * @protected
     * @param {Node} embedNode
     * @return {Node} embedNode
     */
    ResolveEmbed.prototype._unsetLoading = function (embedNode) {
        return embedNode.removeClass('is-embed-loading');
    };

    /**
     * Sets the embed node in the not loaded state
     *
     * @method _setNotLoaded
     * @protected
     * @param {Node} embedNode
     */
    ResolveEmbed.prototype._setNotLoaded = function (embedNode) {
        embedNode.addClass('is-embed-not-loaded');
        this._getEmbedContent(embedNode).setContent(this._notLoadedMessage);
    };

    /**
     * Returns the node representing the embed content.
     *
     * @method _getEmbedContent
     * @protected
     * @param {Node} embedNode
     * @return {Node}
     */
    ResolveEmbed.prototype._getEmbedContent = function (embedNode) {
        return embedNode.one('.ez-embed-content');
    };

    Y.eZ.RichTextResolveEmbed = ResolveEmbed;
});
