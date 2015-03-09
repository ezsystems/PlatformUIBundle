/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversidewidgetview', function (Y) {
    "use strict";

    Y.namespace('eZ');

    Y.eZ.ServerSideWidget = Y.Base.create('serverSideWidgetView', Y.eZ.ServerSideView, [], {

        getServerSideParameters: function () {
            return {'uri': '/', 'data': {}};
        },
    }, {
        ATTRS: {
        },
    });
});
