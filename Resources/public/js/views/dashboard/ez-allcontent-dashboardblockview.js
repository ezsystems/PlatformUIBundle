/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-allcontent-dashboardblockview', function (Y) {
    'use strict';

    /**
     * Provides the All Content Dashboard Block View class
     *
     * @module ez-allcontent-dashboardblockview
     */
    Y.namespace('eZ');

    var SELECTOR_CONTENT = '.ez-dashboard-block-content';

    /**
     * The all content dashboard block view
     *
     * @namespace eZ
     * @class AllContentDashboardBlockView
     * @constructor
     * @extends eZ.BaseDashboardBlockView
     */
    Y.eZ.AllContentDashboardBlockView = Y.Base.create('allContentDashboardBlockView', Y.eZ.BaseDashboardBlockView, [], {
        initializer: function () {
            var parentView = this.constructor.superclass;

            this.get('container').addClass(parentView._generateViewClassName(parentView._getName()));

            this.on('contentChange', this._renderContent);
            this.after('activeChange', this._getContentData);
        },

        /**
         * Makes request for data
         *
         * @method _getContentData
         * @protected
         */
        _getContentData: function () {
            /**
             * Makes request for all content dashboard block data.
             * Listened in {eZ.Plugin.AllContentDashboardBlockService}
             *
             * @event getAllContent
             */
            this.fire('getAllContent');
        },

        /**
         * Renders dashboard block content
         *
         * @method _renderContent
         * @protected
         * @param event {Object} event facade
         * @param event.newVal {Y.LazyModelList} list of content models
         * @return {eZ.AllContentDashboardBlockView} the view itself
         */
        _renderContent: function (event) {
            var contentList = event.newVal,
                RowView = this.get('rowView'),
                fragment = Y.one(document.createDocumentFragment()),
                rows = [];

            this._destroyRows(true);
            contentList.each(Y.bind(function (content, index) {
                var row = new RowView({model: content});

                row.addTarget(this);
                rows.push(row);
                fragment.append(row.render().get('container'));
            }, this));

            this.get('container').one(SELECTOR_CONTENT).setHTML(fragment);
            this.set('rows', rows);

            /**
             * Informs the view has been fully rendered.
             * Listened in {eZ.Plugin.AllContentDashboardBlockService}
             *
             * @event dashboardBlockRendered
             */
            this.fire('dashboardBlockRendered');

            return this;
        },

        /**
         * Destroys existing rows
         *
         * @method _destroyRows
         * @protected
         * @param reset {Object} should the rows info be reset?
         */
        _destroyRows: function (reset) {
            var rows = this.get('rows');

            rows.forEach(Y.bind(function (row) {
                row.removeTarget(this);
                row.destroy({remove: true});
            }, this));

            if (reset) {
                this.set('rows', []);
            }
        },

        destructor: function () {
            this._destroyRows();
        }
    }, {
        ATTRS: {
            /**
             * The title
             *
             * @attribute title
             * @type String
             * @default 'All Content'
             */
            title: {
                value: 'All Content'
            },

            /**
             * The dashboard block content
             *
             * @attribute content
             * @type Y.LazyModelList
             */
            content: {},

            /**
             * The block identifier
             *
             * @attribute identifier
             * @type String
             * @default 'dashboard-all-content-block'
             */
            identifier: {
                value: 'dashboard-all-content-block'
            },

            /**
             * The table header text - title
             *
             * @attribute headTextTitle
             * @type String
             * @default 'Title'
             */
            headTextTitle: {
                value: 'Title'
            },

            /**
             * The table header text - content type
             *
             * @attribute headTextContentType
             * @type String
             * @default 'Content Type'
             */
            headTextContentType: {
                value: 'Content Type'
            },

            /**
             * The table header text - version
             *
             * @attribute headTextVersion
             * @type String
             * @default 'Version'
             */
            headTextVersion: {
                value: 'Version'
            },

            /**
             * The table header text - last saved/modified
             *
             * @attribute headTextModified
             * @type String
             * @default 'Last saved'
             */
            headTextModified: {
                value: 'Last saved'
            },

            /**
             * The row view class reference
             *
             * @attribute rowView
             * @type Y.eZ.AllContentDashboardBlockRowView
             * @default Y.eZ.AllContentDashboardBlockRowView
             * @readOnly
             */
            rowView: {
                value: Y.eZ.AllContentDashboardBlockRowView,
                readOnly: true
            },

            /**
             * The rows
             *
             * @attribute rows
             * @type Array
             * @default []
             */
            rows: {
                value: []
            }
        },
    });
});
