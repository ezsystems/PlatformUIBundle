/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardviewservice', function (Y) {
    "use strict";
    /**
     * Provides the content creation wizard view service class
     *
     * @method ez-contentcreationwizardviewservice
     */

    /**
     * The content creation wizard view service
     *
     * @namespace eZ
     * @class ContentCreationWizardViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentCreationWizardViewService = Y.Base.create('contentCreationWizardViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {
        _load: function (callback) {
            var app = this.get('app');

            app.set('loading', true);
            this.contentType.loadAllContentTypes(Y.bind(function (error, groups) {
                app.set('loading', false);
                if ( error ) {
                    this._error('An error occured while loading the Content Types');
                    return;
                }
                this.set('contentTypeGroups', groups);
                callback();
            }, this));
        },

        _getViewParameters: function () {
            var params = Y.merge(this.get('parameters'));

            params.config = this.get('config');
            params.contentTypeGroups = this.get('contentTypeGroups');

            return params;
        }
    }, {
        ATTRS: {
            /**
             * The complete list of the Content Type Groups with the Content
             * Types being loaded as well.
             *
             * @attribute contentTypeGroups
             * @type {Array}
             */
            contentTypeGroups: {}
        },
    });
});
