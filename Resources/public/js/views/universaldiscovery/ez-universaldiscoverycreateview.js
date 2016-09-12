/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverycreateview', function (Y) {
    "use strict";
    /**
     * Provides the universal discovery create method
     *
     * @module ez-universaldiscoverycreateview
     */
    Y.namespace('eZ');

    var BaseMethod = Y.eZ.UniversalDiscoveryMethodBaseView;

    /**
     * The universal discovery create method view. It allows the user to pick
     * a Content Type and a Location to create new Content item.
     *
     * @namespace eZ
     * @class UniversalDiscoveryCreateView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.eZ.UniversalDiscoveryCreateView = Y.Base.create('universalDiscoveryCreateView', BaseMethod, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._preventActiveForwardAttributes = ['wizardView'];
            this._triggerAttribute = 'visible';
            this._fireMethod = this._fireLoadContentTypes;

            this.after('contentTypeGroupsChange', this._renderWizardView);
            this.after('visibleChange', function () {
                if ( !this.get('visible') ) {
                    this.reset();
                }
            });
        },

        /**
         * Renders the Content Creation Wizard view with the Content Type Groups
         *
         * @method _renderWizardView
         * @protected
         * @param {EventFacade} e
         */
        _renderWizardView: function (e) {
            var wizard = this.get('wizardView');

            wizard.set('contentTypeGroups', e.newVal);

            this.get('container').one('.ez-wizard-container').append(
                wizard.render().get('container')
            );
            wizard.set('active', true);

            // TODO huge shortcut since we can not launch 2 different UDW yet
            wizard._set(
                'selectedParentLocation',
                new Y.eZ.Location({
                    id: "/api/ezp/v2/content/locations/1/2",
                    locationId: 2,
                    contentInfo: {
                        Content: {
                            Name: 'Root Location ("Change Location" not working yet)',
                        },
                    },
                })
            );
        },

        /**
         * Fires the `loadContentTypes` event to load the Content Types.
         *
         * @method _fireLoadContentTypes
         * @protected
         */
        _fireLoadContentTypes: function () {
            /**
             * Fired to load the Content Types list.
             *
             * @event loadContentTypes
             */
            this.fire('loadContentTypes');
        },

        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        },

        /**
         * Resets the attributes of the method. Overriden to make sure to reset
         * the wizard view.
         *
         * @method reset
         * @param {String} name
         */
        reset: function (name) {
            if ( name === 'wizardView' ) {
                this.get('wizardView').reset();
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
        },
    }, {
        ATTRS: {
            /**
             * @attribute title
             * @default 'Create'
             */
            title: {
                value: 'Create',
                readOnly: true,
            },

            /**
             * @attribute identifier
             * @default 'contentonthefly'
             */
            identifier: {
                value: 'contentonthefly',
                readOnly: true,
            },

            /**
             * Holds the Content Type Groups to display in the wizard view
             *
             * @attribute contentTypeGroups
             * @type Array
             * @default null
             */
            contentTypeGroups: {
                value: null,
            },

            /**
             * The Content Creation Wizard used to pick a Content Type and a
             * Location to create a new Content item.
             *
             * @attribute wizardView
             * @type {eZ.ContentCreationWizardView}
             */
            wizardView: {
                valueFn: function () {
                    return new Y.eZ.ContentCreationWizardView({
                        bubbleTargets: this,
                    });
                },
            },
        },
    });
});
