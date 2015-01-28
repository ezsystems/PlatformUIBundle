/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryview', function (Y) {
    "use strict";
    /**
     * Provides the Universal discovery View class
     *
     * @module ez-universaldiscoveryview
     */
    Y.namespace('eZ');

    var DISCOVERED = 'contentDiscovered',
        CANCEL = 'cancelDiscover';

    /**
     * The universal discovery view is a widget to allow the user to pick one or
     * several contents in the repository.
     *
     * @namespace eZ
     * @class UniversalDiscoveryView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UniversalDiscoveryView = Y.Base.create('universalDiscoveryView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-universaldiscovery-confirm': {
                'tap': '_confirmSelection'
            },

            '.ez-universaldiscovery-cancel': {
                'tap': '_cancel',
            },
        },

        initializer: function () {
            this.on('contentDiscoveredHandlerChange', function (e) {
                this._syncEventHandler(DISCOVERED, e.prevVal, e.newVal);
            });

            this.on('cancelDiscoverHandlerChange', function (e) {
                this._syncEventHandler(CANCEL, e.prevVal, e.newVal);
            });

            this._publishEvents();
        },

        /**
         * Publishes the cancelDiscover and contentDiscovered events
         *
         * @method _publishEvents
         * @protected
         */
        _publishEvents: function () {
            this.publish(DISCOVERED, {
                bubbles: true,
                emitFacade: true,
                preventable: true,
                defaultFn: this._resetState,
            });
            this.publish(CANCEL, {
                bubbles: true,
                emitFacade: true,
                preventable: true,
                defaultFn: this._resetState,
            });
        },

        /**
         * cancelDiscoverHandlerChange and contentDiscoveredHandlerChange event
         * handler. It makes sure the potential previous event handler are
         * removed and it adds the new handlers if any.
         *
         * @method _syncEventHandler
         * @private
         * @param {String} eventName event name
         * @param {Function|Null} oldHandler the previous event handler
         * @param {Function|Null} newHandler the new event handler
         */
        _syncEventHandler: function (eventName, oldHandler, newHandler) {
            if ( oldHandler ) {
                this.detach(eventName, oldHandler);
            }
            if ( newHandler ) {
                this.on(eventName, newHandler);
            }
        },

        /**
         * Resets the state of the view
         *
         * @method _resetState
         * @protected
         */
        _resetState: function () {
            this.reset();
        },

        /**
         * Tap event handler on the cancel link(s).
         *
         * @method _cancel
         * @param {EventFacade} the event facade of the tap event
         * @protected
         */
        _cancel: function (e) {
            e.preventDefault();
            /**
             * Fired when the user cancel the selection. By default, the
             * application will close the universal discovery view but this
             * event can be prevented or stopped to avoid that.
             *
             * @event cancelDiscover
             * @bubbles
             */
            this.fire(CANCEL);
        },

        /**
         * Tap event handler on the confirm button
         *
         * @method _confirmSelection
         * @protected
         */
        _confirmSelection: function () {
            /**
             * Fired when the user confirms the selection. By default, the
             * application will close the universal discovery view but this
             * event can be prevented and stopped so that it does not bubble to
             * the app plugin responsible for that.
             *
             * @event contentDiscovered
             * @bubbles
             */
            this.fire(DISCOVERED);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                title: this.get('title'),
                selectionMode: this.get('selectionMode'),
            }));
            return this;
        }
    }, {
        ATTRS: {
            /**
             * Title of the universal discovery view
             *
             * @attribute title
             * @type {String}
             * @default "Select your content"
             */
            title: {
                value: "Select your content",
            },

            /**
             * The selection mode ('single' or 'multiple'
             *
             * @attribute selectionMode
             * @type {String}
             * @default 'single'
             */
            selectionMode: {
                value: 'single'
            },

            /**
             * An event handler function for the `contentDiscovered` event.
             *
             * @attribute contentDiscoveredHandler
             * @type {Function|null}
             * @default null
             */
            contentDiscoveredHandler: {
                value: null,
            },

            /**
             * An event handler function for the `cancelDiscover` event.
             *
             * @attribute cancelDiscoverHandler
             * @type {Function|null}
             * @default null
             */
            cancelDiscoverHandler: {
                value: null,
            },
        }
    });
});
