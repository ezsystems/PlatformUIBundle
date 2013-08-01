YUI.add('ez-contenteditview', function (Y) {
    "use strict";
    /**
     * Provides the Content Edit View class
     *
     * @module ez-contenteditview
     */

    Y.namespace('eZ');

    var DETAILS_SEL = '.ez-technical-infos',
        CONTENT_SEL = '.ez-main-content',
        ESCAPE_KEY = 27;

    /**
     * The content edit view
     *
     * @namespace eZ
     * @class ContentEditView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.ContentEditView = Y.Base.create('contentEditView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-view-close': {'tap': '_closeView'},
            'header': {
                'mouseover': '_showDetails',
                'mouseout': '_hideDetails'
            },
            '.ez-main-content': {
                'keypress': '_handleKeyboard'
            }
        },

        /**
         * Initializer is called upon view's init
         * Creating and managing child views inside it
         *
         * @method initializer
         */
        initializer: function () {

            this.contentEditFormView = new Y.eZ.ContentEditFormView({
                model : this.get('form')
            });

            this.contentEditFormView.addTarget(this);

        },

        /**
         * Destructor is called upon view's destruction
         * Destroying and cleaning up child views
         *
         * @method destructor
         */
        destructor: function () {
            this.contentEditFormView.destroy();
            delete this.contentEditFormView;
        },

        /**
         * Renders the content edit view
         *
         * @method render
         * @return {eZ.ContentEditView} the view itself
         */
        render: function () {
            this.get('container').setHTML(this.template({
                isTouch: this._isTouch(),
                content: this.get('content').toJSON(),
                mainLocation: this.get('mainLocation').toJSON(),
                contentType: this.get('contentType').toJSON(),
                owner: this.get('owner').toJSON()
            }));

            this.get('container').one('.ez-contenteditformview-container').append(this.contentEditFormView.render().get('container'));

            return this;
        },

        /**
         * Set current input focus on the view
         *
         * @method setFocus
         */
        setFocus: function () {
            this.get('container').one(CONTENT_SEL).focus();
        },

        /**
         * Shows the technical infos of the content. If the device is detected
         * as a touch device, it does nothing as the technical infos are always
         * visible in this case.
         *
         * @method _showDetails
         * @protected
         */
        _showDetails: function () {
            if ( !this._isTouch() ) {
                this.get('container')
                    .all(DETAILS_SEL)
                    .show('fadeIn', {duration: 0.2});
            }
        },

        /**
         * Hides the technical infos of the content. If the device is detected
         * as a touch device, it odes nothing as the technical infos are always
         * visible in this case.
         *
         * @method _hideDetails
         * @protected
         */
        _hideDetails: function () {
            if ( !this._isTouch() ) {
                this.get('container')
                    .all(DETAILS_SEL)
                    .hide('fadeOut', {duration: 0.2});
            }
        },

        /**
         * Event event handler for the close link in the content edit view
         *
         * @method _closeView
         * @protected
         * @param {Object} e event facade of the tap event
         */
        _closeView: function (e) {
            /**
             * Fired when the close link is clicked
             *
             * @event close
             */
            this.fire('close');
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

        },

        /**
         * Returns whether the current browser is a touch device or not
         *
         * @method _isTouch
         * @private
         * @return {Boolean}
         */
        _isTouch: function () {
            return Y.UA.touchEnabled;
        }
    }, {
        ATTRS: {
            /**
             * The content being edited
             *
             * @attribute content
             * @default {}
             * @required
             */
            content: {
                value: {}
            },

            /**
             * The content type of the content being edited
             *
             * @attribute contentType
             * @default {}
             * @required
             */
            contentType: {
                value: {}
            },

            /**
             * The main location of the content being edited
             *
             * @attribute mainLocation
             * @default {}
             * @required
             */
            mainLocation: {
                value: {}
            },

            /**
             * The owner of the content being edited
             *
             * @attribute owner
             * @default {}
             * @required
             */
            owner: {
                value: {}
            },

            /**
             * The form structure which will be passed to ContentEditFormView
             *
             * @attribute form
             * @default {}
             * @required
             */
            form: {
                value: {}
            }
        }
    });

});
