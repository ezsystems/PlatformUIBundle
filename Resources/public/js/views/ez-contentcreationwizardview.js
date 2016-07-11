/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardview', function (Y) {
    "use strict";
    /**
     * Provides the content creation wizard view class
     *
     * @method ez-contentcreationwizardview
     */

    /**
     * The content creation wizard view.
     *
     * @namespace eZ
     * @class ContentCreationWizardView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentCreationWizardView = Y.Base.create('contentCreationWizardView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-contentcreationwizard-close': {
                'tap': '_closeWizard',
            },
        },

        /**
         * Closes the wizard by firing the `contentCreationWizardClose` event.
         *
         * @method _closeWizard
         * @protected
         */
        _closeWizard: function () {
            /**
             * Fired to close the Content Creation Wizard.
             *
             * @event contentCreationWizardClose
             */
            this.fire('contentCreationWizardClose');
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            return this;
        },
    });
});
