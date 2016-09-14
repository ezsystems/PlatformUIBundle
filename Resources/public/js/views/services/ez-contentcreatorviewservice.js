/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreatorviewservice', function (Y) {
    "use strict";
    /**
     * Provides the view service the content creator.
     *
     * @module ez-contentcreatorviewservice
     */
    Y.namespace('eZ');

    /**
     * View service for the Content Creator side view.
     *
     * @namespace eZ
     * @class ContentCreatorViewService
     * @constructor
     * @extends eZ.ViewService
     */
    Y.eZ.ContentCreatorViewService = Y.Base.create('contentCreatorViewService', Y.eZ.ViewService, [Y.eZ.SideViewService], {

        initializer: function () {
            this._resetEventSubscriptions();

            this.after('parametersChange', this._initAttributes);

            this.on('publishedDraft', function () {
                this._loadMainLocation(Y.bind(function () {
                    this.fire('contentCreated');
                }, this));
            });

            this.after('eventHandlersChange', this._setupEventHandlers);
        },

        /**
         * `parametersChange` event handler to initialize the attributes and
         * start a Content creation.
         *
         * @method _initAttributes
         * @protected
         */
        _initAttributes: function () {
            var params = this.get('parameters');

            this._set('contentType', params.contentType);
            this._set('parentLocation', params.parentLocation);
            this._set('eventHandlers', params.eventHandlers);
            this._set(
                'languageCode',
                params.languageCode ? params.languageCode : this.get('app').get('contentCreationDefaultLanguageCode')
            );
            this._set('content', new Y.eZ.Content());
            this._set('version', new Y.eZ.Version());
            this._set('mainLocation', new Y.eZ.Location());
        },

        /**
         * Subscribes to the event indicated by `defaultEventHandlers` and
         * `eventHandlers`. It also makes sure the previously set handlers are
         * removed.
         *
         * @method _setupEventHandlers
         * @protected
         */
        _setupEventHandlers: function () {
            var handlers = Y.merge(
                    this.get('defaultEventHandlers'),
                    this.get('eventHandlers')
                );

            this._resetEventSubscriptions();
            Y.Object.each(handlers, function (handler, evtName) {
                this._eventSubscriptions.push(
                    this.after(evtName, function () {
                        handler.call(this, {
                            mainLocation: this.get('mainLocation'),
                            content: this.get('content'),
                            contentType: this.get('contentType'),
                        });
                    })
                );
            }, this);
        },

        /**
         * Resets the event subscriptions.
         *
         * @method _resetEventSubscriptions
         * @protected
         */
        _resetEventSubscriptions: function () {
            Y.Array.each(this._eventSubscriptions, function (subscription) {
                subscription.detach();
            });
            this._eventSubscriptions = [];
        },

        /**
         * Closes the Content Creator side view by firing the
         * `contentCreatorDone` event.
         *
         * @method closeContentCreator
         */
        closeContentCreator: function () {
            /**
             * Fired to close the Content Creator side view.
             *
             * @event contentCreatorDone
             */
            this.fire('contentCreatorDone');
        },

        /**
         * Loads the main Location of the newly created Content Item.
         *
         * @method _loadMainLocation
         * @param {Function} callback
         */
        _loadMainLocation: function (callback) {
            var location = this.get('mainLocation');

            location.set('id', this.get('content').get('resources').MainLocation);
            location.load({api: this.get('capi')}, callback);
        },

        /**
         * Initializes the Version and the Content item with the Content Type
         * provided when running the Content Creator Side View.
         *
         * @method _initializeVersionContent
         * @protected
         */
        _initializeVersionContent: function () {
            var app = this.get('app'),
                content = this.get('content'),
                version = this.get('version'),
                contentType = this.get('contentType'),
                defaultFields = contentType.getDefaultFields();

            content.set('name', 'New "' + contentType.getName(app.get('contentCreationDefaultLanguageCode')) + '"');

            content.set('fields', defaultFields);
            version.set('fields', defaultFields);
        },

        _load: function (next) {
            this._initializeVersionContent();
            next();
        },

        /**
         * Returns the value of the `parameters` attribute. This attribute is set
         * when the app shows the universal discovery side view with the
         * configuration provided in the `contentDiscover` event.
         *
         * @method _getViewParameters
         * @protected
         * @return mixed
         */
        _getViewParameters: function () {
            return {
                contentType: this.get('contentType'),
                parentLocation: this.get('parentLocation'),
                owner: this.get('app').get('user'),
                content: this.get('content'),
                version: this.get('version'),
                languageCode: this.get('languageCode'),
            };
        },
    }, {
        ATTRS: {
            /**
             * The Content Type to use to create the Content item.
             * It is set from the `parameters` attribute.
             *
             * @attribute contentType
             * @type {eZ.ContentType}
             * @readOnly
             */
            contentType: {
                readOnly: true,
            },

            /**
             * The Location under which the Content item should be created.
             * It is set from the `parameters` attribute.
             *
             * @attribute parentLocation
             * @type {eZ.Location}
             * @readOnly
             */
            parentLocation: {
                readOnly: true,
            },

            /**
             * The language Code in which the Content item should be created.
             * It is set from the `parameters` attribute or from the app
             * `contentCreationDefaultLanguageCode` attribute.
             *
             * @attribute languageCode
             * @type {String}
             * @readOnly
             */
            languageCode: {
                readOnly: true,
            },

            /**
             * The default event handlers indexed by event name. By default, the
             * Content Creator is closed when receiving `discardedDraft` and
             * `*:closeView`.
             *
             * @attribute defaultEventHandlers
             * @type {Object}
             */
            defaultEventHandlers: {
                valueFn: function () {
                    return {
                        "*:closeView": this.closeContentCreator,
                        "discardedDraft": this.closeContentCreator,
                    };
                },
            },

            /**
             * The event handles indexed by event name. This object overrides
             * the `defaultEventHandlers`. Each handler is executed in the
             * context of this side view service.
             * It is set from the `parameters` attribute.
             *
             * @attribute eventHandlers
             * @type {Object}
             * @readOnly
             */
            eventHandlers: {
                readOnly: true,
            },

            /**
             * The Content object representing the Content item to create. It is
             * initialized when starting to create a Content item with the
             * content creator.
             *
             * @attribute content
             * @type {eZ.Content}
             * @readOnly
             */
            content: {
                readOnly: true,
            },

            /**
             * The Version object representing the first version of the Content
             * to create. It is initalized when starting to create a Content
             * item with the content creator.
             *
             * @attribute version
             * @type {eZ.Version}
             * @readOnly
             */
            version: {
                readOnly: true,
            },

            /**
             * The main Location of the newly created Content item. It is
             * initialized when starting to create a Content item but loaded
             * after the Content has been created.
             *
             * @attribute mainLocation
             * @type {eZ.Location}
             * @readOnly
             */
            mainLocation: {
                readOnly: true,
            },
        },
    });
});
