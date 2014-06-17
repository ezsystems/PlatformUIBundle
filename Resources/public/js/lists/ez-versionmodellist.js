YUI.add('ez-versionmodellist', function (Y) {
    'use strict';
    /**
     * Provides the list of version models
     *
     * @module ez-versionmodellist
     */
    Y.namespace('eZ');

    /**
     * Version models list.
     *
     * @namespace eZ
     * @class VersionModelList
     * @constructor
     * @extends Y.ModelList
     */
    Y.eZ.VersionModelList = Y.Base.create('versionModelList', Y.ModelList, [], {
        model : Y.eZ.Version
    });
});
