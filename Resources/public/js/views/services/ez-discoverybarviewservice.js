YUI.add('ez-discoverybarviewservice', function (Y) {
    "user strict";
    /**
     * Provides the view service component for the discovery bar
     *
     * @module ez-discoverybarviewservice
     */
    Y.namespace('eZ');

    /**
     * Discovery bar view service.
     *
     * @namespace eZ
     * @class DiscoveryBarViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.DiscoveryBarViewService = Y.Base.create('discoveryBarViewService', Y.eZ.ViewService, [], {});
});
