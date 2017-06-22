/* global describe, it, beforeEach, fixture, assert, afterEach, sinon */
describe('ez-universal-discovery', function () {
    let universalDiscovery;
    let universalDiscoveryMultiple;
    const modelObject = 'hasBeenTransformedToModelObject';

    function getAppMock() {
        const App = function () {
            this.renderSideView = function () {};
        };

        return new App();
    }

    function getViewMock(domNode) {
        const View = function () {
            this.set = function () {};
            this.get = function () {
                return {
                    getDOMNode: function () {
                        return domNode;
                    },
                };
            };
            this.destroy = function () {};
        };

        return new View();
    }

    function defineGlobals() {
        window.eZ = {
            YUI: {
                app: getAppMock(),
                Y: {
                    eZ: {
                        UniversalDiscoveryView: function () {},
                        UniversalDiscoveryViewService: function () {},
                    }
                }
            }
        };
    }

    function runUDWEventHandler(handlerName, selection) {
        const container = document.createElement('div');
        const view = getViewMock(container);

        renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
            params[handlerName](selection);
            done(false, 'whatever', view);
        });
        document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
    }

    it('should be defined', function () {
        universalDiscovery = fixture('BasicTestFixture');
        assert.equal(
            window.customElements.get('ez-universal-discovery'),
            universalDiscovery.constructor
        );
    });

    describe('properties', function () {
        beforeEach(function () {
            universalDiscovery = fixture('BasicTestFixture');
            universalDiscoveryMultiple = fixture('MultipleTestFixture');
        });

        it('should have a `title` property', function () {
            assert.equal(
                universalDiscovery.getAttribute('title'),
                universalDiscovery.title
            );
        });

        it('should have a `startingLocationId` property', function () {
            assert.equal(
                universalDiscovery.getAttribute('starting-location-id'),
                universalDiscovery.startingLocationId
            );
        });

        it('should have a `confirmLabel` property', function () {
            assert.equal(
                universalDiscovery.getAttribute('confirm-label'),
                universalDiscovery.confirmLabel
            );
        });

        it('should have a `minDiscoverDepth` property', function () {
            assert.equal(
                universalDiscovery.getAttribute('min-discover-depth'),
                universalDiscovery.minDiscoverDepth
            );
        });

        it('should have a `visibleMethod` property', function () {
            assert.equal(
                universalDiscovery.getAttribute('visible-method'),
                universalDiscovery.visibleMethod
            );
        });
        describe('`multiple` property', function () {
            it('should be defined', function () {
                assert.isTrue(
                    universalDiscoveryMultiple.multiple
                );
            });

            it('should be false by default', function () {
                assert.isFalse(
                    universalDiscovery.multiple
                );
            });
        });
    });

    describe('YUI stack loading', function () {
        let renderViewSpy;

        function assertViewRendered(spy, Y) {
            assert.isOk(
                spy.callCount
            );
            assert.equal(
                spy.firstCall.args[0],
                Y.eZ.UniversalDiscoveryView,
                'The UniversalDiscoveryView should have been rendered'
            );
        }

        afterEach(function () {
            delete window.eZ;
            renderViewSpy.restore();
        });

        describe('`ez-yui-app:ready` event', function () {
            beforeEach(function () {
                universalDiscovery = fixture('BasicTestFixture');
                defineGlobals();
                renderViewSpy = sinon.spy(window.eZ.YUI.app, 'renderSideView');
            });

            it('should render the universal discovery', function () {
                document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));

                assertViewRendered(renderViewSpy, window.eZ.YUI.Y);
            });
        });

        describe('already loaded', function () {
            beforeEach(function () {
                defineGlobals();
                renderViewSpy = sinon.spy(window.eZ.YUI.app, 'renderSideView');
                universalDiscovery = fixture('BasicTestFixture');
            });

            it('should render the universal discovery right away', function () {
                assertViewRendered(renderViewSpy, window.eZ.YUI.Y);
            });
        });
    });

    describe('YUI Universal Discovery Widget', function () {
        let renderViewStub;
        const container = document.createElement('div');
        const locationObject = {};
        const contentObject = {};
        const contentTypeObject = {};

        const location = getModelMock(locationObject);
        const content = getModelMock(contentObject);
        const contentType = getModelMock(contentTypeObject);


        function getModelMock(object) {
            const Model = function () {
                this.toObject = function () {
                    return object;
                };
            };

            return new Model();
        }

        function assertEventSelection(e) {
            assert.strictEqual(e.detail.selection.content, contentObject);
            assert.strictEqual(e.detail.selection.location, locationObject);
            assert.strictEqual(e.detail.selection.contentType, contentTypeObject);
        }

        beforeEach(function () {
            universalDiscovery = fixture('BasicTestFixture');
            defineGlobals();
        });

        afterEach(function () {
            delete window.eZ;
            renderViewStub.restore();
        });

        it('should append the YUI view container', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
            assert.strictEqual(
                container.parentNode,
                universalDiscovery
            );
        });

        it('should have received parameters from the properties', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                assert.equal(
                    universalDiscovery.title,
                    params.title,
                    "The title should be passed in the parameters"
                );

                assert.equal(
                    universalDiscovery.multiple,
                    params.multiple,
                    "The multiple should be passed in the parameters"
                );

                assert.equal(
                    universalDiscovery.visibleMethod,
                    params.visibleMethod,
                    "The visibleMethod should be passed in the parameters"
                );

                assert.equal(
                    universalDiscovery.confirmLabel,
                    params.confirmLabel,
                    "The confirmLabel should be passed in the parameters"
                );

                assert.equal(
                    universalDiscovery.startingLocationId,
                    params.startingLocationId,
                    "The startingLocationId should be passed in the parameters"
                );

                assert.equal(
                    universalDiscovery.minDiscoverDepth,
                    params.minDiscoverDepth,
                    "The minDiscoverDepth should be passed in the parameters"
                );
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should have received a cancelDiscoverHandler function', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                assert.isFunction(params.cancelDiscoverHandler);
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should have received a contentDiscoveredHandler function', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                assert.isFunction(params.contentDiscoveredHandler);
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should have received a isSelectable function', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                assert.isFunction(params.isSelectable);
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should handle loading error', function () {
            const errorMsg = 'error message';

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                done(new Error(errorMsg));
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));

            assert.equal(
                universalDiscovery.innerHTML,
                errorMsg,
                '<ez-universal-discovery> should contain the error message'
            );
        });

        it('should add the ez-js-standard-form class', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
            assert.isTrue(universalDiscovery.classList.contains('ez-js-standard-form'));
        });

        describe('events', function () {
            describe('`ez:cancel`', function () {
                it('should be dispatched', function() {
                    let isDispatched = false;

                    universalDiscovery.addEventListener('ez:cancel', function (e) {
                        assert.isFalse(e.bubbles, 'The event should not bubble');
                        isDispatched = true;
                    });
                    runUDWEventHandler('cancelDiscoverHandler');
                    assert.isTrue(isDispatched);
                });
            });

            describe('`ez:select`', function () {
                it('should be dispatched when selecting an item', function() {
                    const selection = {location: location, content: content, contentType: contentType};
                    let isDispatched = false;

                    universalDiscovery.addEventListener('ez:select', function (e) {
                        assertEventSelection(e);
                        assert.isFalse(e.bubbles, 'The event should not bubble');
                        isDispatched = true;
                    });
                    runUDWEventHandler('isSelectable', selection);
                    assert.isTrue(isDispatched);
                });

                it('should allow to prevent the selection', function() {
                    const selection = {location: location, content: content, contentType: contentType};
                    const container = document.createElement('div');
                    const view = getViewMock(container);

                    universalDiscovery.addEventListener('ez:select', function (e) {
                        e.preventDefault();
                        assert.isTrue(e.cancelable);
                    });

                    renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                        assert.isFalse(params.isSelectable(selection));
                        done(false, 'whatever', view);
                    });
                    document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
                });
            });

            describe('`ez:contentDiscovered`', function () {
                it('should be dispatched with a simple selection', function() {
                    const fakeEventFacade = {selection : {location: location, content: content, contentType: contentType}};
                    let isDispatched = false;

                    universalDiscovery.addEventListener('ez:confirm', function (e) {
                        assertEventSelection(e);
                        assert.isFalse(e.bubbles, 'The event should not bubble');
                        isDispatched = true;
                    });
                    runUDWEventHandler('contentDiscoveredHandler', fakeEventFacade);
                    assert.isTrue(isDispatched);
                });

                it('should be dispatched with a multiple selection', function() {
                    const fakeEventFacade = {selection : [{location: location, content: content, contentType: contentType}]};
                    let isDispatched = false;

                    universalDiscovery.multiple = true;
                    universalDiscovery.addEventListener('ez:confirm', function (e) {
                        assert.strictEqual(e.detail.selection[0].content, contentObject);
                        assert.strictEqual(e.detail.selection[0].location, locationObject);
                        assert.strictEqual(e.detail.selection[0].contentType, contentTypeObject);
                        isDispatched = true;
                    });
                    runUDWEventHandler('contentDiscoveredHandler', fakeEventFacade);
                    assert.isTrue(isDispatched);
                });
            });
        });
    });

    describe('disconnect', function () {
        const container = document.createElement('div');
        const view = getViewMock(container);

        beforeEach(function () {
            universalDiscovery = fixture('BasicTestFixture');
            defineGlobals();
            sinon.stub(window.eZ.YUI.app, 'renderSideView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });

            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should set the YUI view inactive', function () {
            const setSpy = sinon.spy(view, 'set').withArgs('active', false);

            universalDiscovery.parentNode.removeChild(universalDiscovery);
            assert.ok(setSpy.calledOnce);
        });

        it('should destroy the YUI view', function () {
            const destroySpy = sinon.spy(view, 'destroy').withArgs({remove: true});

            universalDiscovery.parentNode.removeChild(universalDiscovery);
            assert.ok(destroySpy.calledOnce);
        });
    });
});
