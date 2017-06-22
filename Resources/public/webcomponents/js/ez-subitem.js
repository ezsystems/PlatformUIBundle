(function () {
    /**
     * `<ez-subitem>` generates the subitems of a given Location.
     *
     * @demo demo/ez-subitem.html
     * @polymerElement
     */
    class Subitem extends eZ.SandboxYUIComponentMixin(Polymer.Element) {
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
    }

    window.customElements.define(Subitem.is, Subitem);
})();
