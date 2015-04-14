/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-studiopluspresentationview', function (Y) {
    "use strict";
    /**
     * Provides the Studio Plus Presentation View class
     *
     * @module ez-studiopluspresentationview
     */
    Y.namespace('eZ');

    /**
     * The studio plus presentation view
     *
     * @namespace eZ
     * @class StudioPlusPresentationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.StudioPlusPresentationView = Y.Base.create('studioPlusPresentationView', Y.eZ.TemplateBasedView, [], {
        /**
         * Renders the studio plus presentation view
         *
         * @method render
         * @return {eZ.StudioPlusPresentationView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });
});
