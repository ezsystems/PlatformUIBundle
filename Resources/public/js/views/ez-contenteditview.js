YUI.add('ez-contenteditview', function (Y) {
    /**
     * Provides the Content Edit View class
     *
     * @module ez-contenteditview
     */

    Y.namespace('eZ');

    var DETAILS_SEL = '.ez-technical-infos';

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
            }
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
                content: this.get('content'),
                mainLocation: this.get('mainLocation'),
                contentType: this.get('contentType'),
                owner: this.get('owner')
            }));
            return this;
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
            }
        }
    });

});
