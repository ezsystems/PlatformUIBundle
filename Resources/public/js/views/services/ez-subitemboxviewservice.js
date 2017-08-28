/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemboxviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service component for the location view
     *
     * @module ez-subitemboxviewservice
     */
    Y.namespace('eZ');

    /**
     * Subitem box view service.
     *
     * Loads the models needed by the subitem box view
     *
     * @namespace eZ
     * @class subitemBoxViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.SubitemBoxViewService = Y.Base.create('subitemBoxViewService', Y.eZ.ViewService, [], {
        /**
         * Loads the location, the content and the contentType for the location id
         * available in the request and calls the next callback once it's done.
         *
         * @method _load
         * @protected
         * @param {Function} next
         */
        _load: function (next) {
            var request = this.get('request');

            this.search.findContent({
                viewName: 'location-' + request.params.id,
                loadLocation: true,
                loadContentType: true,
                query: {
                    "LocationIdCriterion": request.params.id,
                },
                limit: 1,
                offset: 0
            }, Y.bind(function (error, result) {
                if (!error && result.length) {
                    this.setAttrs(result[0]);
                    next(this);
                } else {
                    this._error(Y.eZ.trans('subitem.error.loading.list', {}, 'subitem'));
                }
            }, this));
        },

        /**
         * Reloads the Location used as a parent Location for the subitems.
         *
         * @method reload
         * @param {Function} next
         */
        reload: function(next) {
            this.get('location').load({api: this.get('capi')}, Y.bind(function (err) {
                if (err ) {
                    return this._error(Y.eZ.trans('subitem.error.loading.list', {}, 'subitem'));
                }
                next();
            }, this));
        },

        _getViewParameters: function () {
            return {
                content: this.get('content'),
                contentType: this.get('contentType'),
                location: this.get('location'),
            };
        },
    }, {
        ATTRS: {
            /**
             * The parent location of the subitems
             *
             * @attribute location
             * @type Null|Y.eZ.Location
             */
            location: {
                value: null
            },

            /**
             * The content associated with the location
             *
             * @attribute content
             * @type Null|Y.eZ.Content
             */
            content: {
                value: null
            },

            /**
             * The content type of the content
             *
             * @attribute contentType
             * @type Null|Y.eZ.ContentType
             */
            contentType: {
                value: null
            },
        }
    });
});
