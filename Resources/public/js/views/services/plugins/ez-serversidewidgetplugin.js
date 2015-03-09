/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversidewidgetplugin', function (Y) {
    "use strict";

    Y.namespace('eZ.Plugin');

    Y.eZ.Plugin.ServerSideWidget = Y.Base.create('serverSideWidgetPlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:activeChange', function (e) {
                if ( e.target.getServerSideParameters ) {
                    this._loadServerResponse(e);
                }
            });
        },

        _loadServerResponse: function (e) {
            var service = this.get('host'),
                serverParameters = e.target.getServerSideParameters(),
                uri = service.get('app').get('baseUri') + serverParameters.uri;

            Y.io(uri, {
                method: 'GET',
                data: serverParameters.data,
                on: {
                    success: function (tId, response) {
                        console.log(response);
                        e.target.set('html', response.responseText);
                    },
                    failure: function () {
                        console.error("Failure");
                        console.error(arguments);
                        //this._error("Failed to load '" + uri + "'");
                    },
                },
                context: this,
            });
        },
    }, {
        NS: 'subitems',
    });


    Y.eZ.PluginRegistry.registerPlugin(
        Y.eZ.Plugin.ServerSideWidget, ['locationViewViewService']
    );
});
