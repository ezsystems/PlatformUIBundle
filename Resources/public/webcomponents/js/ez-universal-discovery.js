(function () {
    /**
     * `<ez-universal-discovery>` generates the universal discovery widget.
     *
     * @demo demo/ez-universal-discovery.html
     * @polymerElement
     */
    class UniversalDiscoveryWidget extends eZ.SandboxYUIComponentMixin(Polymer.Element) {
        static get is() {
            return 'ez-universal-discovery';
        }
        static get properties() {
            return {
                /**
                 * Title of the universal discovery widget.
                 */
                title: {
                    type: String,
                },

                /**
                 * Flag indicating whether the user is able to select several
                 * Content items.
                 */
                multiple: {
                    type: Boolean,
                    value: false,
                },

                /**
                 * The Location that should be considered as the starting point when
                 * discovering Content.
                 */
                startingLocationId: {
                    type: String,
                },

                /**
                 * Defines the label of the confirm button.
                 */
                confirmLabel: {
                    type: String,
                },

                /**
                * The depth of the root where we start discovering content.
                * The UDW needs a starting location having a greater depth than the min discover depth to work.
                 */
                minDiscoverDepth: {
                    type: Number,
                },

                /**
                 * The identifier of the visible method by default.
                 */
                visibleMethod: {
                    type: String,
                },
            };
        }

        connectedCallback() {
            super.connectedCallback();
            this._trackYUIAppReady(this._createUDWComponent.bind(this));
        }

        /**
         * Converts a selection items to a YUI free representation by calling toObject on each model object.
         *
         * @param {Object} item
         */
        _convertItem(item) {
            return {
                content: item.content.toObject(),
                location: item.location.toObject(),
                contentType: item.contentType.toObject(),
            };
        }

        /**
         * Converts the selection to a YUI free representation.
         *
         * @param {Array|Object} selection
         */
        _convertSelection(selection) {
            if ( this.multiple ) {
                return selection.map(this._convertItem);
            }
            return this._convertItem(selection);
        }

        /**
         * Creates the universal discovery widget component and renders the UD side view using the YUI bridge app.
         */
        _createUDWComponent() {
            const {app, Y} = eZ.YUI;
            const params = {
                title: this.title,
                multiple: this.multiple,
                startingLocationId: this.startingLocationId,
                minDiscoverDepth: this.minDiscoverDepth,
                visibleMethod: this.visibleMethod,
                contentDiscoveredHandler: (e) => {
                    this.dispatchEvent(new CustomEvent('ez:confirm', {
                        detail: {
                            selection: this._convertSelection(e.selection),
                        },
                        bubbles: false,
                    }));
                },
                cancelDiscoverHandler: (e) => {
                    this.dispatchEvent(new CustomEvent('ez:cancel', {
                        bubbles: false,
                    }));
                },
                isSelectable: (selection) => {
                    return this.dispatchEvent(new CustomEvent('ez:select', {
                        detail: {
                            selection: this._convertItem(selection),
                        },
                        bubbles: false,
                        cancelable: true,
                    }));
                },
            };

            if ( this.confirmLabel ) {
                params.confirmLabel = this.confirmLabel;
            }

            app.renderSideView(
                Y.eZ.UniversalDiscoveryView,
                Y.eZ.UniversalDiscoveryViewService,
                params,
                this._attachView.bind(this)
            );
        }
    }

    customElements.define(UniversalDiscoveryWidget.is, UniversalDiscoveryWidget);
})();
