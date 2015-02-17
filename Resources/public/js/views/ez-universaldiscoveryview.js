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
    Y.eZ.UniversalDiscoveryView = Y.Base.create('universalDiscoveryView', Y.eZ.TemplateBasedView, [Y.eZ.Tabs], {
        events: {
            '.ez-universaldiscovery-confirm': {
                'tap': '_confirmSelection'
            },

            '.ez-universaldiscovery-cancel': {
                'tap': '_cancel',
            },
        },

        initializer: function () {
            this._setMethodsVisibleFlag();
            this.after('visibleMethodChange', this._setMethodsVisibleFlag);
            this.after('activeChange', function () {
                if ( this.get('active') ) {
                    this._setMethodsVisibleFlag();
                    this._uiUpdateTab();
                }
            });
            this.on('contentDiscoveredHandlerChange', function (e) {
                this._syncEventHandler(DISCOVERED, e.prevVal, e.newVal);
            });

            this.on('cancelDiscoverHandlerChange', function (e) {
                this._syncEventHandler(CANCEL, e.prevVal, e.newVal);
            });

            this._publishEvents();

            this.on('changeTab', this._updateVisibleMethod);
        },

        /**
         * Updates the tab to show the correct tab depending on the visible
         * method
         *
         * @method _uiUpdateTab
         * @protected
         */
        _uiUpdateTab: function () {
            var container = this.get('container'),
                htmlId = '#' + this._visibleMethodView.getHTMLIdentifier();

            this._selectTab(
                this._getTabLabel(container.one('[href="' + htmlId + '"]')),
                htmlId,
                container
            );
        },

        /**
         * Updates the visible flag of the method views depending on the value
         * of the `visibleMethod` attribute
         *
         * @method _setMethodsVisibleFlag
         * @protected
         */
        _setMethodsVisibleFlag: function () {
            var visibleMethod = this.get('visibleMethod');

            /**
             * Stores a reference to the visible method view
             *
             * @property _visibleMethodView
             * @protected
             * @type {eZ.UniversalDiscoveryMethodBaseView|Null}
             */
            this._visibleMethodView = null;
            Y.Array.each(this.get('methods'), function (method) {
                var visible = (visibleMethod === method.get('identifier'));

                method.set('visible', visible);
                if ( visible ) {
                    this._visibleMethodView = method;
                }
            }, this);
        },

        /**
         * tabChange event handler to update the `visibleMethod` attribute.
         *
         * @method _updateVisibleMethod
         * @protected
         * @param {EventFacade} e
         */
        _updateVisibleMethod: function (e) {
            var identifier = e.tabId.replace(/^#/, ''),
                newlyVisibleMethod;

            newlyVisibleMethod = Y.Array.find(this.get('methods'), function (method) {
                return method.getHTMLIdentifier() === identifier;
            });
            this.set('visibleMethod', newlyVisibleMethod.get('identifier'));
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
            Y.Array.each(this.get('methods'), function (method) {
                method.set('visible', false);
            });
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
                methods: this._methodsList(),
            }));
            this._renderMethods();
            return this;
        },

        /**
         * Renders the available methods in a DOM element which id is the
         * HTML identifier of the method.
         *
         * @method _renderMethods
         * @protected
         */
        _renderMethods: function () {
            var container = this.get('container');

            Y.Array.each(this.get('methods'), function (method) {
                container.one('#' + method.getHTMLIdentifier()).append(method.render().get('container'));
            });
        },

        /**
         * Builds an array containing objects that describes the available
         * methods.
         *
         * @protected
         * @method _methodsList
         * @return Array
         */
        _methodsList: function () {
            var res = [];

            Y.Array.each(this.get('methods'), function (method) {
                res.push({
                    title: method.get('title'),
                    identifier: method.getHTMLIdentifier(),
                    visible: method.get('visible'),
                });
            });
            return res;
        },
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

            /**
             * The available methods to discover content. Each element in the
             * array should be an instance of a class extending
             * Y.eZ.UniversalDiscoveryMethodBaseView.
             *
             * @attribute methods
             * @type array
             */
            methods: {
                valueFn: function () {
                    return [
                        new Y.eZ.UniversalDiscoveryBrowseView({
                            priority: 100,
                            selectionMode: this.get('selectionMode'),
                        }),
                    ];
                },
            },

            /**
             * The identifier of the visible method
             *
             * @attribute visibleMethod
             * @type String
             * @default 'browse'
             */
            visibleMethod: {
                value: 'browse',
            },
        }
    });
});
