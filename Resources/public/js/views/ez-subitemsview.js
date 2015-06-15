/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-subitemsview', function (Y) {
    "use strict";

    Y.namespace('eZ');

    Y.eZ.SubitemsView = Y.Base.create('subitemsView', Y.eZ.ServerSideWidget, [], {

        getServerSideParameters: function () {
            return {
                'uri': 'ajax/subitems',
                'data': {'parentLocationId': this.get('location').get('locationId')}
            };
        },
    }, {
        ATTRS: {
            location: {},
        },
    });
});
