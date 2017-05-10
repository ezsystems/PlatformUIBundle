(function () {
    /**
     * `<ez-subitem>` generates the subitems of a given Location.
     *
     * @demo demo/ez-subitem.html
     * @polymerElement
     */
    class Subitem extends Polymer.Element {
        static get is() {
            return 'ez-subitem';
        }

        static get properties() {
            return {
                /**
                 * Location id of of the parent Location of the subitems to
                 * render.
                 */
                'parentLocationId': {
                    type: String,
                },
            };
        }

        connectedCallback() {
            super.connectedCallback();
            this._trackYUIAppReady(this._renderSubitemComponent.bind(this));
        }

        /**
         * Checks whether the YUI bridge App is already loaded. If it is the
         * `createComponent` is directly called, otherwise, it subcribes to
         * `ez:yui-app:ready` to call `createComponent` when the app is ready.
         *
         * @param {Function} createComponent
         */
        _trackYUIAppReady(createComponent) {
            if ( window.eZ && window.eZ.YUI ) {
                createComponent();
                return;
            }
            this._readyHandler = createComponent;
            this.ownerDocument.addEventListener('ez:yui-app:ready', this._readyHandler);
        }

        /**
         * Renders the YUI subitem view using the YUI bridge app.
         */
        _renderSubitemComponent() {
            const {app, Y} = window.eZ.YUI;

            app.renderView(
                Y.eZ.SubitemBoxView,
                Y.eZ.SubitemBoxViewService,
                {id: this.parentLocationId},
                this._attachView.bind(this)
            );
        }

        /**
         * Attaches the YUI subitem view as a child the `<ez-subitem>` element.
         * It also handles loading error while building the subitem list.
         *
         * @param {false|Error} err
         * @param {eZ.ViewService} viewService
         * @param {eZ.View} view
         */
        _attachView(err, viewService, view) {
            if ( err ) {
                this.innerHTML = err.message;
                return;
            }
            this._view = view;
            this.innerHTML = '';
            this.appendChild(view.get('container').getDOMNode());
            view.set('active', true);
        }

        disconnectedCallback() {
            if ( this._view ) {
                this._view.set('active', false);
                this._view.destroy({remove: true});
            }
            this.ownerDocument.removeEventListener('ez:yui-app:ready', this._readyHandler);
            super.disconnectedCallback();
        }
    }

    window.customElements.define(Subitem.is, Subitem);
})();
