/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopresentationview', function (Y) {
    "use strict";
    /**
     * Provides the Studio Presentation View class
     *
     * @module ez-studiopresentationview
     */
    Y.namespace('eZ');

    /**
     * The studio presentation view
     *
     * @namespace eZ
     * @class StudioPresentationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.StudioPresentationView = Y.Base.create('studioPresentationView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the studio presentation view
         *
         * @method render
         * @return {eZ.StudioPresentationView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });
});
