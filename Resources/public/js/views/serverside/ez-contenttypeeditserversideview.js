/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contenttypeeditserversideview', function (Y) {
    "use strict";
    /**
     * Provides the content type server side view
     *
     * @module ez-contenttypeeditserversideview
     */
    Y.namespace('eZ');

    var events = {
            '.ez-relation-pick-root-button': {
                'tap': '_pickRoot'
            },
        };

    /**
     * The content type server side view.
     *
     * @namespace eZ
     * @class ContentTypeEditServerSideView
     * @constructor
     * @extends eZ.ServerSideView
     */
    Y.eZ.ContentTypeEditServerSideView = Y.Base.create('contentTypeEditServerSideView', Y.eZ.ServerSideView, [], {
        initializer: function () {
            this.events = Y.merge(this.events, events);
        },

        /**
         * tap event handler on the root item selection buttons. It launches the
         * universal discovery widget so that the user can pick a content.
         *
         * @method _pickRoot
         * @protected
         * @param {EventFacade} e
         */
        _pickRoot: function (e) {
            var button = e.target;

            e.preventDefault();
            this.fire('contentDiscover', {
                config: {
                    title: button.getAttribute('data-universaldiscovery-title'),
                    contentDiscoveredHandler: Y.bind(this._setRoot, this, button),
                    multiple: false
                },
            });
        },

        /**
         * Puts picked location id into root selection input. Input is selected by selector
         * provided in `data-relation-root-input-selector` attribute of button, for example
         * <button data-relation-root-input-selector="#id_of_input"></button>
         *
         * @method _setRoot
         * @protected
         * @param {Y.Node} button
         * @param {EventFacade} e
         */
        _setRoot: function (button, e) {
            var selectionRootInput = this.get('container').one(button.getAttribute('data-relation-root-input-selector')),
                selectedRootName = this.get('container').one(button.getAttribute('data-relation-selected-root-name-selector'));

            selectionRootInput.setAttribute('value', e.selection.location.get('locationId'));
            selectedRootName.setHTML(e.selection.contentInfo.get('name'));
        },
    });
});
