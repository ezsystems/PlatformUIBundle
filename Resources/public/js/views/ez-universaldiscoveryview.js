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
        CANCEL = 'cancelDiscover',
        MULTIPLE_SELECTION_CLASS = 'is-multiple-selection-mode';

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
            this.on('changeTab', this._updateVisibleMethod);
            this.after('multipleChange', this._uiMultipleMode);
            this.after('visibleMethodChange', this._updateMethods);
            this.after('*:selectContent', function (e) {
                var isSelectable = this.get('isSelectable');

                if (!this.get('multiple')) {
                    if (e.selection !== null && isSelectable(e.selection)) {
                        this._storeSelection(e.selection);
                    } else {
                        this._resetSelection();
                    }
                }
            });
            this.after('*:unselectContent', function (e) {
                this._unselectContent(e.contentId);
            });
            this.after('*:confirmSelectedContent', function (e) {
                if ( !this._isAlreadySelected(e.selection) ) {
                    this._uiAnimateSelection(e.target);
                    this._storeSelection(e.selection);
                }
            });
            this.after('selectionChange', function () {
                this._uiSetConfirmButtonState();
                if ( this.get('multiple') ) {
                    this.get('confirmedListView').set('confirmedList', this.get('selection'));
                }
            });
            this.after('activeChange', function () {
                if ( this.get('active') ) {
                    this._updateMethods();
                    this._uiUpdateTab();
                    this._uiUpdateTitle();
                }
            });
            this.on(['contentDiscoveredHandlerChange', 'cancelDiscoverHandlerChange'], function (e) {
                this._syncEventHandler(e.attrName.replace(/Handler$/, ''), e.prevVal, e.newVal);
            });
            this._publishEvents();
        },

        /**
         * Stores the given contentStruct in the selection. Depending on the
         * `multiple` attribute value, the contentStruct is added to the
         * selection or completely replaces it.
         *
         * @method _storeSelection
         * @protected
         * @param {Object|Null} contentStruct
         */
        _storeSelection: function (contentStruct) {
            if ( contentStruct === null ) {
                this._resetSelection();
                return;
            }
            if ( this.get('multiple') ) {
                this._addToSelection(contentStruct);
            } else {
                this._set('selection', contentStruct);
            }
        },

        /**
         * Unselects the content from its content id.
         *
         * @method _unselectContent
         * @param {String} contentId
         */
        _unselectContent: function (contentId) {
            var newSelection = [];

            if ( this.get('multiple') ) {
                newSelection = Y.Array.filter(this.get('selection'), function (struct) {
                    return struct.contentInfo.get('id') !== contentId;
                });
            }
            this._notifyMethodsUnselectContent(contentId);
            if ( newSelection.length === 0 ) {
                this._resetSelection();
                return;
            }
            this._set('selection', newSelection);
        },

        /**
         * Notifies the browse method views that a content is removed from the
         * selection.
         *
         * @method _notifyMethodsUnselectContent
         * @protected
         * @param {String} contentId
         */
        _notifyMethodsUnselectContent: function (contentId) {
            Y.Array.each(this.get('methods'), function (method) {
                method.onUnselectContent(contentId);
            });
        },

        /**
         * Checks whether the content is already selected
         *
         * @method _isAlreadySelected
         * @protected
         * @param {Object} contentStruct
         * @return {Boolean}
         */
        _isAlreadySelected: function (contentStruct) {
            if ( !this.get('selection') ) {
                return false;
            }
            return !!Y.Array.find(this.get('selection'), function (struct) {
                return struct.contentInfo.get('id') === contentStruct.contentInfo.get('id');
            });
        },

        /**
         * Add a content to the selection
         *
         * @method _addToSelection
         * @protected
         * @param {Object} contentStruct
         */
        _addToSelection: function (contentStruct) {
            var sel = this.get('selection') || [];

            sel.push(contentStruct);
            this._set('selection', sel);
        },

        /**
         * Resets the current selection
         *
         * @protected
         * @method _resetSelection
         */
        _resetSelection: function () {
            this._set('selection', null);
        },

        /**
         * Animates the selection done by the user with the given view. An
         * animation is done only if the source view properly implements the
         * `startAnimation` (see {{#crossLink
         * "eZ.UniversalDiscoverySelectedView"}}Y.eZ.UniversalDiscoverySelectedView{{/crossLink}})
         *
         * @method _uiAnimateSelection
         * @protected
         * @param {Y.View} sourceView the view used by the user to select the
         * content
         */
        _uiAnimateSelection: function (sourceView) {
            var elt, confirmNode;

            confirmNode = this.get('confirmedListView').get('container');
            if ( sourceView.startAnimation && (elt = sourceView.startAnimation()) ) {
                elt.setX(confirmNode.getX());
                elt.setY(confirmNode.getY() + confirmNode.get('offsetHeight') - elt.get('offsetHeight'));
            }
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
         * Adds or removes the multiple selection class on the container
         * depending on the `multiple` attribute value.
         *
         * @method _uiMultipleMode
         * @protected
         */
        _uiMultipleMode: function () {
            var container = this.get('container');

            if ( this.get('multiple') ) {
                container.addClass(MULTIPLE_SELECTION_CLASS);
            } else {
                container.removeClass(MULTIPLE_SELECTION_CLASS);
            }
        },

        /**
         * `selectionChange` event handler. It enables/disables the button
         * depending on the selection
         *
         * @method _uiSetConfirmButtonState
         * @protected
         */
        _uiSetConfirmButtonState: function () {
            var confirmButton = this.get('container').one('.ez-universaldiscovery-confirm');

            confirmButton.set('disabled', !this.get('selection'));
        },

        /**
         * Updates the title in the already rendered view
         *
         * @method _uiUpdateTitle
         * @protected
         */
        _uiUpdateTitle: function () {
            this.get('container')
                .one('.ez-universaldiscovery-title').setContent(this.get('title'));
        },

        /**
         * Updates the method views depending on the value so that their
         * `visible` flag is consistent with the `visibleMethod` attribute value
         * and so that they get the correct `multiple` and `loadContent` flag
         * values as well. What's more the `isSelectable` function registered in
         * UDW is passed to the method view.
         *
         * @method _updateMethods
         * @protected
         */
        _updateMethods: function () {
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

                method.setAttrs({
                    'multiple': this.get('multiple'),
                    'loadContent': this.get('loadContent'),
                    'visible': visible,
                    'isSelectable': Y.bind(this.get('isSelectable'), this)
                });
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
            this._set('selection', null);
            Y.Array.each(this.get('methods'), function (method) {
                method.reset();
            });
        },

        /**
         * Custom reset implementation to make sure to reset the confirmed list
         * sub view.
         *
         * @method reset
         * @param {String} name
         */
        reset: function (name) {
            if ( name === 'confirmedListView' ) {
                this.get('confirmedListView').reset();
                return;
            }
            this.constructor.superclass.reset.apply(this, arguments);
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
             * @param {Null|Array|Object} selection the current selection of the
             * discovery
             */
            this.fire(DISCOVERED, {
                selection: this.get('selection'),
            });
        },

        render: function () {
            var container = this.get('container');

            this._uiMultipleMode();
            container.setHTML(this.template({
                title: this.get('title'),
                multiple: this.get('multiple'),
                methods: this._methodsList(),
            }));
            container.one('.ez-universaldiscovery-confirmed-list-container').append(
                this.get('confirmedListView').render().get('container')
            );
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
             * Flag indicating whether the user is able to select several
             * contents.
             *
             * @attribute multiple
             * @type {Boolean}
             * @default false
             */
            multiple: {
                value: false,
            },

            /**
             * Flag indicating whether the Content should be provided in the
             * selection.
             *
             * @attribute loadContent
             * @type {Boolean}
             * @default false
             */
            loadContent: {
                value: false,
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
                            bubbleTargets: this,
                            priority: 100,
                            multiple: this.get('multiple'),
                            loadContent: this.get('loadContent'),
                            isAlreadySelected: Y.bind(this._isAlreadySelected, this)
                        }),
                        new Y.eZ.UniversalDiscoverySearchView({
                            bubbleTargets: this,
                            priority: 200,
                            multiple: this.get('multiple'),
                            loadContent: this.get('loadContent'),
                            isAlreadySelected: Y.bind(this._isAlreadySelected, this)
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

            /**
             * The current selection of the discovery. This selection is
             * provided to the contentDiscovered event handler in the event
             * facade. Depending on the `multiple` flag and on the user action,
             * the selection is either null or an object (`multiple` set to
             * false) or an array (`multiple` set to true)
             *
             * @attribute selection
             * @type {Null|Object|Array}
             * @readOnly
             * @default null
             */
            selection: {
                value: null,
                readOnly: true,
            },

            /**
             * The confirmed list view. It displays the user's current confirmed
             * list content.
             *
             * @attribute @confirmedListView
             * @type {eZ.UniversalDiscoveryConfirmedListView}
             */
            confirmedListView: {
                valueFn: function () {
                    return new Y.eZ.UniversalDiscoveryConfirmedListView({
                        bubbleTargets: this,
                    });
                }
            },

            /**
             * An arbitrary object the component triggering the universal
             * discovery can set. It is useful to store some data the
             * contentDiscovered and cancelDiscover handlers need.
             *
             * @attribute data
             * @type {Object}
             * @default {}
             */
            data: {
                value: {},
            },

            /**
             * Checks wether the content is selectable. Function can be provided in the config
             * when firing the `contentDiscover` event so it can check if content is selectable
             * depending on the context where UDW is triggered.
             *
             * @attribute isSelectable
             * @type {Function}
             */
            isSelectable: {
                validator: Y.Lang.isFunction,
                value: function (contentStruct) {
                    return true;
                }
            },
        }
    });
});
