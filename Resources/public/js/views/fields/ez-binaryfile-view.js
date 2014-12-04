/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binaryfile-view', function (Y) {
    "use strict";
    /**
     * Provides the Binary File field view
     *
     * @module ez-binaryfile-view
     */
    Y.namespace('eZ');

    /**
     * The Binary File field view
     *
     * @namespace eZ
     * @class BinaryFileView
     * @constructor
     * @extends eZ.FieldView
     */
    Y.eZ.BinaryFileView = Y.Base.create('binaryFileView', Y.eZ.FieldView, [], {});

    Y.eZ.FieldView.registerFieldView('ezbinaryfile', Y.eZ.BinaryFileView);
});
