/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-asynchronousview', function (Y) {
    "use strict";
    /**
     * Provides the Asynchronous extension for the view
     *
     * @module ez-expandable
     */
    Y.namespace('eZ');

    /**
     * Views extension providing the concept of asynchronously rendered view.
     * An asynchronous view is first rendered in a *loading state*, then fires
     * an event to get the missing data and when it gets them, it is rerendered.
     * The loading errors are also handled and such a view can also have a
     * *retry* button. When a view is extended with this extension, its
     * initializer method should set the required properties `_fireMethod` and
     * optionally the `_watchAttribute` to subscribe to the corresponding change
     * event.
     *
     * @namespace eZ
     * @class AsynchronousView
     * @extensionfor Y.View
     */
    Y.eZ.AsynchronousView = Y.Base.create('asynchronousView', Y.View, [], {
        /**
         * Holds the method to call to fire the load event.
         *
         * @property _fireMethod
         * @required
         * @type {Function}
         */

        /**
         * Holds the attribute name which stores the data needed to render the
         * view. If provided, the asynchronous view will subscribe to the
         * corresponding change event.
         *
         * @property _watchAttribute
         * @type {String}
         */

        events: {
            '.ez-asynchronousview-retry': {
                'tap': '_retryLoading',
            },
        },

        initializer: function () {
            this.after('activeChange', function (e) {
                if ( this.get('active') ) {
                    this._fireMethod(e);
                }
            });

            this.after('loadingErrorChange', function (e) {
                this.render();
            });

            if ( this._watchAttribute ) {
                this.after(this._watchAttribute + 'Change', function (e) {
                    this.render();
                });
            }
        },

        /**
         * Tap event handler for the retry button. It resets the attribute which
         * name is stored in the `_watchAttribute` property and the
         * `loadingError` attribute and fires the loading event with the method
         * in `_fireMethod`.
         *
         * @method _retryLoading
         * @protected
         * @param {Object} e
         */
        _retryLoading: function (e) {
            var attrs = {
                    loadingError: false
                };

            if ( this._watchAttribute ) {
                attrs[this._watchAttribute] = null;
            }
            this.setAttrs(attrs);
            this._fireMethod.call(this);
        },
    }, {
        ATTRS: {
            /**
             * Loading error state
             *
             * @attribute loadingError
             * @type Boolean
             * @default false
             */
            loadingError: {
                value: false,
            }
        }
    });
});
