/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-user-view', function (Y) {
    "use strict";
    /**
     * Provides the User View class
     *
     * @module ez-user-view
     */
    Y.namespace('eZ');

    /**
     * The user view
     *
     * @namespace eZ
     * @class UserView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.UserView = Y.Base.create('userView', Y.eZ.FieldView, [], {});

    Y.eZ.FieldView.registerFieldView('ezuser', Y.eZ.UserView);
});
