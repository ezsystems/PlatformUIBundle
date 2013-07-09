YUI.add('ez-editorialapp', function (Y) {
    /**
     * Provides the Editorial Application class
     *
     * @module ez-editorialapp
     */

    Y.namespace('eZ');

    var APP_OPEN = 'is-app-open';

    /**
     * Editorial Application
     *
     * @namespace eZ
     * @class EditorialApp
     * @constructor
     * @extends App
     */
    Y.eZ.EditorialApp = Y.Base.create('editorialApp', Y.App, [], {

        views: {
            contentEditView: {
                type: Y.eZ.ContentEditView
            }
        },

        /**
         * Initialize the application:
         *
         *   * set up the 'close' event that closes the application
         *
         * @method initiliazer
         */
        initializer: function () {
            this.on('contentEditView:close', function (e) {
                this.close();
            });
        },

        /**
         * Display the content edit view
         *
         * @method handleContentEdit
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        handleContentEdit: function (req, res, next) {
            this.showView('contentEditView');
        },

        /**
         * Changes the application state to be open
         *
         * @method open
         * @param {Object} req the request object
         * @param {Function} res the response object
         * @param {Function} next the function to pass control to the next route callback
         */
        open: function (req, res, next) {
            var container = this.get('container'),
                viewContainer = this.get('viewContainer');

            container.addClass(APP_OPEN);
            viewContainer.setStyle('height', container.get('docHeight') + 'px');
            next();
        },

        /**
         * Changes the application sate to be close
         *
         * @method close
         */
        close: function () {
            var container = this.get('container'),
                viewContainer = this.get('viewContainer');

            container.transition({
                duration: 0.3,
                transform: 'translateX(100%)',

                on: {
                    end: function () {
                        container.removeClass(APP_OPEN)
                            .setStyle('transform', 'none');
                        viewContainer.setStyle('height', 'auto');
                    }
                }
            });
        }

    }, {
        ATTRS: {
            routes: {
                value: [
                    {path: '/edit', callback: ['open', 'handleContentEdit']}
                ]
            },
            serverRouting: {
                value: false
            },
            transitions: {
                value: {
                    navigate: 'slideLeft',
                    toChild: 'slideLeft',
                    toParent: 'slideRight'
                }
            }
        }
    });
});
