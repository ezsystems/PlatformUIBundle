YUI.add('ez-dashboardviewservice', function (Y) {
    'use strict';
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
    Y.eZ.DashboardViewService = Y.Base.create('dashboardViewService', Y.eZ.ViewService, [], {
        initializer : function () {
            this.on('get:userdrafts', this._getDrafts);
            this.on('get:contenttype', this._getContentType);
        },
        /**
         * Fetches data for the dashboard blocks
         *
         * @method load
         * @param {Function} next
         */
        load : function (next) {
            next();
        },
        /**
         * Fetches drafts using REST API and populates drafts collection
         *
         * @method _getDrafts
         * @protected
         */
        _getDrafts : function (event) {
            var that = this,
                app = this.get('app'),
                capi = this.get('capi'),
                contentService = capi.getContentService(),
                draftsList = this.get('draftsList'),
                draftsUrl = app.get('user').get('id') + '/drafts';

            contentService.loadContent(draftsUrl, '', '', '', function (error, response) {
                if (error) {
                    that.fire('error:userdrafts', 'Cannot fetch drafts data using REST API');
                    return;
                }

                Y.Array.each(response.document.VersionList.VersionItem, function (item) {
                    draftsList.add(item);
                });
                event.target.set('draftsList', draftsList);
            });
        },
        _getContentType : function (event, id) {
            var that = this,
                capi = this.get('capi'),
                contentService = capi.getContentService(),
                contentTypeService = capi.getContentTypeService();

            // get content object info
            contentService.loadContentInfo(id, function (error, response) {
                // get content type object info
                contentTypeService.loadContentType(response.document.Content.ContentType._href, function (error, response) {
                    var cType = that.get('contentTypeModel');

                    cType.setAttrs(response.document.ContentType);
                    event.target.set('contentType', cType);
                });
            });
        }
    }, {
        ATTRS: {
            draftsList : {
                valueFn : function () {
                    return new Y.eZ.VersionModelList();
                }
            },
            contentTypeModel : {
                valueFn : function () {
                    return new Y.eZ.ContentType();
                }
            }
        }
    });
});
