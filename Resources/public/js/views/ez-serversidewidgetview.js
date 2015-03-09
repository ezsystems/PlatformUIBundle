/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversidewidgetview', function (Y) {
    "use strict";

    Y.namespace('eZ');

    var ROUTE_PARAM_PREFIX = 'data-route-params-',
        ROUTE_NAME_ATTR = 'data-route-name';

    Y.eZ.ServerSideWidget = Y.Base.create('serverSideWidgetView', Y.eZ.ServerSideView, [], {
        events: {
            'a[data-route-name]': {
                'tap': '_navigateTo',
            },
        },

        _getRouteParams: function (node) {
            var params = {};

            node.get('attributes').each(function (attr) {
                var attrName = attr.get('name');

                if ( attrName.indexOf(ROUTE_PARAM_PREFIX) === 0 ) {
                    params[attrName.replace(ROUTE_PARAM_PREFIX, '')] = node.getAttribute(attrName);
                }
            });
            return params;
        },

        _navigateTo: function (e) {
            e.preventDefault();
            this.fire('navigateTo', {
                routeName: e.target.getAttribute(ROUTE_NAME_ATTR),
                routeParams: this._getRouteParams(e.target),
            });
        },

        getServerSideParameters: function () {
            return {'uri': '/', 'data': {}};
        },
    }, {
        ATTRS: {
        },
    });
});
