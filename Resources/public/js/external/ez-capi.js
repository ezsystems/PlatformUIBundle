/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global eZ */
YUI.add('ez-capi', function (Y) {
    "use strict";

    Y.namespace('eZ');

    /**
     * eZ JavaScript REST Client. See
     * https://github.com/ezsystems/ez-js-rest-client
     *
     * @namespace eZ
     * @class CAPI
     * @constructor
     */
    Y.eZ.CAPI = eZ.CAPI;

    /**
     * Session Auth Agent. See https://github.com/ezsystems/ez-js-rest-client
     *
     * @namespace eZ
     * @class SessionAuthAgent
     * @constructor
     */
    Y.eZ.SessionAuthAgent = eZ.SessionAuthAgent;
});
