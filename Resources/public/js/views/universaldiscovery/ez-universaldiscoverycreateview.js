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
            this.on('*:contentCreationWizardEnding', this._openContentCreator);
            this.after('visibleChange', function () {
                if ( !this.get('visible') ) {
                    this.reset();
                }
            });
        },

        /**
         * `contentCreationWizardEnding` event handler.
         * Opens the content creator side view to create the Content item with
         * the selected Content Type and under the selected Parent Location.
         *
         * @method _openContentCreator
         * @protected
         * @param {EventFacade} e
         */
        _openContentCreator: function (e) {
            var createView = this;

            /**
             * Fired to open the Content Creator side view.
             *
             * @event contentCreatorOpen
             * @param {Object} config
             * @param {eZ.Content} config.contentType
             * @param {eZ.Location} config.parentLocation
             * @param {Object} config.eventHandlers
             * @param {Function} config.eventHandlers.contentCreated
             * @param {Object} config.eventHandlers.contentCreated.contentCreatedStruct
             * @param {eZ.Location} config.eventHandlers.contentCreated.contentCreatedStruct.mainLocation
             * @param {eZ.Content} config.eventHandlers.contentCreated.contentCreatedStruct.content
             * @param {eZ.ContentType} config.eventHandlers.contentCreated.contentCreatedStruct.contentType
             */
            this.fire('contentCreatorOpen', {
                config: {
                    contentType: e.contentType,
                    parentLocation: e.parentLocation,
                    eventHandlers: {
                        "contentCreated": function (contentCreatedStruct) {
                            var struct = {
                                    location: contentCreatedStruct.mainLocation,
                                    contentInfo: contentCreatedStruct.mainLocation.get('contentInfo'),
                                    contentType: contentCreatedStruct.contentType,
                                };

                            if ( createView.get('loadContent') ) {
                                struct.content = contentCreatedStruct.content;
                            }

                            // atm the content item that was just created is not
                            // displayed but directly used. In a "multiple" UDW,
                            // it is added to the selection, in a unique UDW,
                            // it is directly selected.
                            createView.fire(createView.get('multiple') ? 'confirmSelectedContent' : 'selectContent', {
                                selection: struct,
                            });
                            this.closeContentCreator();
                        },
                    },
                },
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
