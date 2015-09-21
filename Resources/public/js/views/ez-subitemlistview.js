/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemlistview', function (Y) {
    "use strict";
    /**
     * Provides the subitem list view.
     *
     * @module ez-subitemlistview
     */
    Y.namespace('eZ');

    /**
     * The subitem list view.
     *
     * @namespace eZ
     * @class SubitemListView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.SubitemListView = Y.Base.create('subitemListView', Y.eZ.TemplateBasedView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLocationSearch;
            this._watchAttribute = 'subitems';
        },

        render: function () {
            this.get('container').setHTML(this.template({
                location: this.get('location').toJSON(),
                subitems: this._convertToJSONList(),
                loadingError: this.get('loadingError'),
            }));

            return this;
        },

        /**
         * Converts the subitems array to JSON so that it can be used in the
         * template.
         *
         * @method _convertToJSONList
         * @protected
         * @return undefined|Array
         */
        _convertToJSONList: function () {
            if ( !this.get('subitems') ) {
                return this.get('subitems');
            }
            return Y.Array.map(this.get('subitems'), function (loc) {
                return loc.toJSON();
            });
        },

        /**
         * Fires the `locationSearch` event to fetch the subitems of the
         * currently displayed Location.
         *
         * @method _fireLocationSearch
         * @protected
         */
        _fireLocationSearch: function () {
            var locationId = this.get('location').get('locationId');

            this.fire('locationSearch', {
                viewName: 'subitemlist-' + locationId,
                resultAttribute: 'subitems',
                search: {
                    criteria: {
                        "ParentLocationIdCriterion": this.get('location').get('locationId'),
                    },
                    /*
                     * @TODO see https://jira.ez.no/browse/EZP-24315
                     * this is not yet supported by the views in the REST API
                    sortClauses: {
                        SortClause: {
                            SortField: this.get('location').get('sortField'),
                            SortOrder: this.get('location').get('sortOrder'),
                        },
                    },
                    */
                },
            });
        },
    }, {
        ATTRS: {
            /**
             * The location being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
                writeOnce: 'initOnly',
            },

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },

            /**
             * The subitems list.
             *
             * @attribute subitems
             * @type Array of {eZ.Location}
             */
            subitems: {},
        }
    });
});
