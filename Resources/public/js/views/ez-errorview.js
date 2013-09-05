YUI.add('ez-errorview', function (Y) {
    "use strict";
    /**
     * Provides the Content Edit View class
     *
     * @module ez-errorview
     */

    Y.namespace('eZ');

    var ERROR_SEL = '.ez-error-content',
        ESCAPE_KEY = 27;

    /**
     * The content edit view
     *
     * @namespace eZ
     * @class ErrorView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ErrorView = Y.Base.create('errorView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-close-app': {'tap': '_closeApp'},
            '.ez-retry' : {'tap': '_retry'},
            '.ez-error-content': {
                'keypress': '_handleKeyboard'
            }
        },

        /**
         * Renders the content edit view
         *
         * @method render
         * @return {eZ.ErrorView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                additionalInfo: this.get('additionalInfo')
            }));
            return this;
        },

        /**
         * Set current input focus on the view
         *
         * @method setFocus
         */
        setFocus: function () {
            this.get('container').one(ERROR_SEL).focus();
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
             * @event close
             */
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
             * Fired when the retry link is clicked
             *
             * @event retry
             */
            this.fire('retry');
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
                this._closeView(e);
            }

        }

    }, {
        ATTRS: {
            /**
             * An object describing an action which caused the error
             *
             * @attribute retryAction
             * @default {}
             * @required
             */
            retryAction: {
                value: {}
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
