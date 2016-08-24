/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-confirmboxview', function (Y) {
    "use strict";
    /**
     * Provides the confirm box view class
     *
     * @method ez-confirmboxview
     */
    var CONFIRM = 'confirm',
        CANCEL = 'cancel';

    /**
     * The confirm box view.
     *
     * @namespace eZ
     * @class ConfirmBoxView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ConfirmBoxView = Y.Base.create('confirmBoxView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-confirmbox-close': {
                'tap': '_cancel',
            },
            '.ez-confirmbox-confirm': {
                'tap': '_confirm',
            },
        },

        /**
         * Tap event handler on the close links. It fires the `cancel` event.
         *
         * @method _cancel
         * @protected
         * @param {EventFacade} e
         */
        _cancel: function (e) {
            e.preventDefault();
            this.fire(CANCEL);
        },

        /**
         * Tap event handler on the confirm button. It fires the `confirm` event.
         *
         * @method _confirm
         * @protected
         * @param {EventFacade} e
         */
        _confirm: function (e) {
            e.preventDefault();
            this.fire(CONFIRM);
        },

        initializer: function () {
            this.on(['confirmHandlerChange', 'cancelHandlerChange'], function (e) {
                this._syncEventHandler(e.attrName.replace(/Handler$/, ''), e.prevVal, e.newVal);
            });

            this._syncEventHandler('confirm');
            this._syncEventHandler('cancel');
            this.after('activeChange', function () {
                if ( this.get('active') ) {
                    this._uiUpdateTitle();
                    this._uiUpdateView();
                    this._uiUpdateButton();
                }
            });
            this._publishEvents();
        },

        /**
         * Updates the title in the rendered confirmBox
         *
         * @method _uiUpdateTitle
         * @protected
         */
        _uiUpdateTitle: function () {
            this.get('container')
                .one('.ez-confirmbox-title').setContent(this.get('title'));
        },

        /**
         * Hides of reveal the buttons
         *
         * @method _uiButtonDisplay
         * @protected
         */
        _uiUpdateButton: function () {
            var container = this.get('container').one('.ez-confirmbox-tools');

            if (this.get('renderDefaultButtons')) {
                container.removeClass('ez-confirmbox-tools-hidden');
            } else {
                container.addClass('ez-confirmbox-tools-hidden');
            }
        },

        /**
         * Updates the view in the rendered confirmBox
         *
         * @method _uiUpdateView
         * @protected
         */
        _uiUpdateView: function () {
            var view = this.get('view');

            if (view instanceof Y.View) {
                view.on('*:confirm', Y.bind(function(e) {
                    this.fire(CONFIRM, e);
                }, this));

                view.render();

                this.get('container').one('.ez-confirmbox-view').append(view.get('container'));

                view.set('active', true);
            }
        },

        /**
         * Publishes the cancelDiscover and contentDiscovered events
         *
         * @method _publishEvents
         * @protected
         */
        _publishEvents: function () {
            this.publish(CONFIRM, {
                bubbles: true,
                emitFacade: true,
                preventable: false,
                defaultFn: this._closeConfirmBox,
            });
            this.publish(CANCEL, {
                bubbles: true,
                emitFacade: true,
                preventable: false,
                defaultFn: this._closeConfirmBox,
            });
        },

        /**
         * Updates the event handler for the given event
         *
         * @method _syncEventHandler
         * @protected
         * @param {String} eventName
         * @param {Function} oldHandler
         * @param {Function} newHandler
         */
        _syncEventHandler: function (eventName, oldHandler, newHandler) {
            var fullEventName = '*:' + eventName;

            this.detach(fullEventName);
            this.after(fullEventName, function (e) {
                if ( newHandler ) {
                    newHandler(e);
                }
                this._resetState();
            });
        },

        /**
         * Resets the state of the confirmBox view
         *
         * @method _resetState
         * @protected
         */
        _resetState: function () {
            this.reset('title');
            this.reset('details');
            this.reset('confirmHandler');
            this.reset('cancelHandler');
            this.reset('renderDefaultButtons');

            if (this.get('view') instanceof Y.View) {
                this.get('view').destroy({remove: true});
                this.reset('view');
            }
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template({
                title: this.get('title'),
                details: this.get('details'),
            }));
            return this;
        },

        /**
         * Closes the confirmBox by firing the confirmBoxClose event
         *
         * @protected
         * @method _closeConfirmBox
         */
        _closeConfirmBox: function () {
            this.fire('confirmBoxClose');
        },
    }, {
        ATTRS: {
            /**
             * Title of the confirmBox
             *
             * @attribute title
             * @default ""
             * @type {String}
             */
            title: {
                value: "",
            },

            /**
             * Details of the confirmBox.
             * This attribute is supposed to contain an HTML fragment
             * that won't be escaped while rendering the confirm box view.
             *
             * @attribute details
             * @default ""
             * @type {String}
             */
            details: {
                value: "",
            },

            /**
             * View of the confirmBox.
             * A Y.View that can be provided to be displayed in the confirm box
             *
             * @attribute view
             * @default null
             * @type {Y.View|null}
             */
            view: {
                value: null,
            },

            /**
             * Wether or not to display the `Confirm` and `Cancel` buttons
             *
             * @attribute renderDefaultButtons
             * @default true
             * @type {Boolean}
             */
            renderDefaultButtons: {
                value: true,
            },

            /**
             * confirm event handler
             *
             * @attribute confirmHandler
             * @type {Function|Null}
             * @default null
             */
            confirmHandler: {
                value: null,
            },

            /**
             * cancel event handler
             *
             * @attribute cancelHandler
             * @type {Function|Null}
             * @default null
             */
            cancelHandler: {
                value: null,
            }
        },
    });
});
