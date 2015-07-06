/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-locationviewdetailstabview', function (Y) {
    "use strict";
    /**
     * Provides the Location View View Tab view class.
     *
     * @module ez-locationviewdetailstabview
     */
    Y.namespace('eZ');

    /**
     * The Location View View Details tab class.
     *
     * @namespace eZ
     * @class LocationViewDetailsTabView
     * @constructor
     * @extends eZ.LocationViewTabView
     */
    Y.eZ.LocationViewDetailsTabView = Y.Base.create('locationViewDetailsTabView', Y.eZ.LocationViewTabView, [Y.eZ.AsynchronousView], {
        initializer: function () {
            this._fireMethod = this._fireLoadUser;

            this.after(['creatorChange', 'ownerChange'], function (e) {
                this.render();
            });
        },

        render: function () {
            var container = this.get('container'),
                content = this.get('content'),
                currentVersion = content.get('currentVersion'),
                translationsList = currentVersion.getTranslationsList(),
                creator = null,
                owner = null;

            if (this.get('creator')) {
                creator=this.get('creator').toJSON();
            }

            if (this.get('owner')) {
                owner=this.get('owner').toJSON();
            }

            container.setHTML(this.template({
                "content": content.toJSON(),
                "location": this.get('location').toJSON(),
                "currentVersion": currentVersion.toJSON(),
                "lastContributor": creator,
                "contentCreator": owner,
                "translationsList": translationsList,
                "languageCount": translationsList.length,
                "loadingError": this.get('loadingError'),
            }));

            return this;
        },

        /**
         * Fire the `loadUser` event
         * @method _fireLoadUser
         * @protected
         */
        _fireLoadUser: function () {
            var creatorId = this.get('content').get('currentVersion').get('resources').Creator,
                ownerId = this.get('content').get('resources').Owner;

            /**
             * Fired when the details view needs authors
             * @event loadUser
             * @param {String} userId Id of the author
             * @param {String} attributeName Where to store the result
             */
            this.fire('loadUser', {
                userId: creatorId,
                attributeName: 'creator',
            });

            if (creatorId === ownerId) {
                this.onceAfter('creatorChange', function (e) {
                    this.set('owner', this.get('creator'));
                });
            } else {
                this.fire('loadUser', {
                    userId: ownerId,
                    attributeName: 'owner',
                });
            }
        },
    }, {
        ATTRS: {
            /**
             * The title of the tab
             *
             * @attribute title
             * @type {String}
             * @default "Details"
             * @readOnly
             */
            title: {
                value: "Details",
                readOnly: true,
            },

            /**
             * The identifier of the tab
             *
             * @attribute identifier
             * @type {String}
             * @default "details"
             * @readOnly
             */
            identifier: {
                value: "details",
                readOnly: true,
            },

            /**
             * The creator of the content
             *
             * @attribute creator
             * @type {Object}
             */
            creator: {},

            /**
             * The owner of the content
             *
             * @attribute owner
             * @type {Object}
             */
            owner: {},

            /**
             * The content being displayed
             *
             * @attribute content
             * @type {eZ.Content}
             * @writeOnce
             */
            content: {
                writeOnce: 'initOnly',
            },

            /**
             * The location being displayed
             *
             * @attribute location
             * @type {eZ.Location}
             * @writeOnce
             */
            location: {
                writeOnce: 'initOnly',
            },

            /**
             * The config
             *
             * @attribute config
             * @type mixed
             * @writeOnce
             */
            config: {
                writeOnce: "initOnly",
            },
        }
    });
});
