window.eZ = window.eZ || {};
(function (eZ) {
    /**
     * Sandbox YUI component mixin support into a class extending `superClass`.
     * The resulting class should be responsible for a component using some YUI views.
     * It will be granted methods to check if the YUI bridge app is loaded and manage when to create
     * the involved component.
     * The class is also granted method to attach a YUI view to the involved custom element.
     * And it also provides a `disconnectedCallback` method which removes the YUI view from the component
     * but also removes the event listnener responsible for creating the component.
     *
     * @param {Function} superClass
     * @return {Function}
     */
    eZ.SandboxYUIComponentMixin = function (superClass) {

        return class extends superClass {
            /**
             * Attaches the YUI view as a child the custom element.
             * It also handles loading error.
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
                this._viewService = viewService;
                this.innerHTML = '';
                this.appendChild(view.get('container').getDOMNode());
                this.classList.add('ez-js-standard-form');
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
        };
    };
})(window.eZ);
