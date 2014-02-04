YUI.add('ez-errorview', function (Y) {
    "use strict";
    /**
     * Provides the Error View class
     *
     * @module ez-errorview
     */

    Y.namespace('eZ');

    var IS_HIDDEN_CLASS = 'is-hidden',
        ERROR_DIALOG_SEL = '.ez-error-dialog',
        ESCAPE_KEY = 27;

    /**
     * The error view
     *
     * @namespace eZ
     * @class ErrorView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ErrorView = Y.Base.create('errorView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-close-app': {'tap': '_closeApp'},
            '.ez-retry': {'tap': '_retry'},
            '.ez-error-dialog': {
                'keyup': '_handleKeyboard'
            }
        },

        initializer: function () {
            this.after('activeChange', function (e) {
                if ( e.newVal ) {
                    this._setFocus();
                }
            });
        },

        /**
         * Renders the error view (with transition)
         *
         * @method render
         * @return {eZ.ErrorView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                additionalInfo: this.get('additionalInfo')
            }));

            this.get('container').removeClass(IS_HIDDEN_CLASS);

            return this;
        },

        /**
         * Hides the error view (with transition)
         *
         * @method hide
         */
        hide: function () {
            this.get('container').addClass(IS_HIDDEN_CLASS);
        },

        /**
         * Set current input focus on the view
         *
         * @method _setFocus
         * @protected
         */
        _setFocus: function () {
            this.get('container').one(ERROR_DIALOG_SEL).focus();
        },

        /**
         * Event event handler for the close link in the error view
         *
         * @method _closeApp
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _closeApp: function (e) {
            /**
             * Fired when the close link is clicked
             *
             * @event closeApp
             */
            this.hide();
            this.fire('closeApp');
            e.preventDefault();
        },

        /**
         * Event event handler for the retry link in the error view
         *
         * @method _retry
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _retry: function (e) {
            /**
             * Fired when "retry the operation" link is clicked
             *
             * @event retryAction
             * @param {Object} object describing action interrupted by the error
             */
            this.hide();
            this.fire('retryAction', this.get('retryAction'));
            e.preventDefault();
        },

        /**
         * Event event handler for any key pressed within the content edit view
         *
         * @method _handleKeyboard
         * @protected
         * @param {Object} e event facade of the keyboard event
         */
        _handleKeyboard: function (e) {
            if (e.keyCode === ESCAPE_KEY) {
                this._closeApp(e);
            }
        }

    }, {
        ATTRS: {
            /**
             * An object describing an action which caused the error
             *
             * @attribute retryAction
             * @default {
             *     run: function () {},
             *     args: [],
             *     context: null
             * }
             * @required
             */
            retryAction: {
                value: {
                    run: function () {},
                    args: [],
                    context: null
                }
            },

            /**
             * An object containing additional information about the error
             *
             * @attribute additionalInfo
             * @default {}
             */
            additionalInfo: {
                value: {}
            }
        }
    });
});
