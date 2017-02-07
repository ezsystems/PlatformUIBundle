/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-richtext-locationlink', function (Y) {
    "use strict";
    /**
     * Provides the Location link processor
     *
     * @module ez-richtext-locationlink
     */
    Y.namespace('eZ');

    /**
     * The Richtext Location Link processor.
     *
     * @namespace eZ
     * @class RichTextLocationLink
     * @constructor
     */
    var LocationLink = function () {};

    /**
     * Adds the REST Location id and the main language code to internal links.
     *
     * @method process
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @param {EventFacade} [event] the event parameters (if any) that triggered
     * the process
     */
    LocationLink.prototype.process = function (view, event) {
        var list = this._getInternalLinkList(view),
            mapNode = this._buildLinkMapNode(list);

        if ( !Y.Object.isEmpty(mapNode) ) {
            this._loadLocations(view, mapNode, this._updateLinks);
        }
    };

    /**
     * Fires the locationSearch event to load the linked Locations.
     *
     * @method _loadLocations
     * @protected
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @param {Object} mapNode
     * @param {Function} callback
     */
    LocationLink.prototype._loadLocations = function (view, mapNode, callback) {
        view.fire('locationSearch', {
            viewName: 'locationlink-richtextfield-' + view.get('field').id,
            search: {
                filter: {'LocationIdCriterion': Object.keys(mapNode).join(',')},
                offset: 0,
            },
            callback: Y.bind(callback, this, mapNode),
        });
    };

    /**
     * Updates the links referenced in `mapNode` with the search result.
     *
     * @method _updateLinks
     * @protected
     * @param {Object} mapNode
     * @param {Error|false} error
     * @param {Array} results
     */
    LocationLink.prototype._updateLinks = function (mapNode, error, results) {
        if ( error ) {
            return;
        }
        results.forEach(function (struct) {
            var location = struct.location;

            mapNode[location.get('locationId')].forEach(function (node) {
                node.setAttribute('data-ez-rest-location-id', location.get('id'));
                node.setAttribute('data-ez-main-language-code', location.get('contentInfo').get('mainLanguageCode'));
            });
        });
    };

    /**
     * Returns a NodeList containing the internal links.
     *
     * @method _getInternalLinkList
     * @protected
     * @param {eZ.FieldView|eZ.FieldEditView} view
     * @return {Y.NodeList}
     */
    LocationLink.prototype._getInternalLinkList = function (view) {
        return view.get('container').all('a[href^="ezlocation://"]');
    };

    /**
     * Builds a map between the Location ids and the corresponding links.
     *
     * @method _buildLinkMapNode
     * @protected
     * @param {NodeList} links
     * @return {Object}
     */
    LocationLink.prototype._buildLinkMapNode = function (links) {
        var map = {};

        links.each(function (link) {
            var locationId = this._getLocationId(link);

            map[locationId] = map[locationId] || [];
            map[locationId].push(link);
        }, this);
        return map;
    };

    /**
     * Returns the Location id for the given link.
     *
     * @method _getLocationId
     * @protected
     * @param {Node} link
     */
    LocationLink.prototype._getLocationId = function (link) {
        return link.getAttribute('href').replace('ezlocation://', '');
    };

    Y.eZ.RichTextLocationLink = LocationLink;
});
