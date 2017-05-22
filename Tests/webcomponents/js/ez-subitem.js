/* global describe, it, beforeEach, fixture, assert, afterEach, sinon */
describe('ez-subitem', function () {
    let subitem;

    function getAppMock() {
        const App = function () {
            this.renderView = function () {};
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
                        SubitemBoxView: function () {},
                        SubitemBoxViewService: function () {},
                    }
                }
            }
        };
    }

    it('should be defined', function () {
        subitem = fixture('BasicTestFixture');
        assert.equal(
            window.customElements.get('ez-subitem'),
            subitem.constructor
        );
    });

    describe('property', function () {
        beforeEach(function () {
            subitem = fixture('BasicTestFixture');
        });

        it('should have a `parentLocationId` property', function () {
            assert.equal(
                subitem.getAttribute('parent-location-id'),
                subitem.parentLocationId
            );
        });
    });

    describe('YUI stack loading', function () {
        let renderViewSpy;

        function assertViewRendered(spy, Y) {
            assert.equal(
                spy.callCount,
                1
            );
            assert.equal(
                spy.firstCall.args[0],
                Y.eZ.SubitemBoxView,
                'The SubitemBoxView should have been rendered'
            );
        }

        afterEach(function () {
            delete window.eZ;
            renderViewSpy.restore();
        });

        describe('`ez-yui-app:ready` event', function () {
            beforeEach(function () {
                subitem = fixture('BasicTestFixture');
                defineGlobals();
                renderViewSpy = sinon.spy(window.eZ.YUI.app, 'renderView');
            });

            it('should render the subitem', function () {
                document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));

                assertViewRendered(renderViewSpy, window.eZ.YUI.Y);
            });
        });

        describe('already loaded', function () {
            beforeEach(function () {
                defineGlobals();
                renderViewSpy = sinon.spy(window.eZ.YUI.app, 'renderView');
                subitem = fixture('BasicTestFixture');
            });

            it('should render the subitem right away', function () {
                assertViewRendered(renderViewSpy, window.eZ.YUI.Y);
            });
        });
    });

    describe('data loading', function () {
        let renderViewStub;
        const container = document.createElement('div');

        beforeEach(function () {
            subitem = fixture('BasicTestFixture');
            defineGlobals();
        });

        afterEach(function () {
            delete window.eZ;
            renderViewStub.restore();
        });

        it('should handle loading error', function () {
            const errorMsg = 'error message';

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                done(new Error(errorMsg));
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));

            assert.equal(
                subitem.innerHTML,
                errorMsg,
                '<ez-subitem> should contain the error message'
            );
        });

        it('should append the YUI view container', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                assert.deepEqual(
                    {id: subitem.getAttribute('parent-location-id')},
                    params,
                    "The parent Location id should be passed in the parameters"
                );
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
            assert.equal(
                container.parentNode,
                subitem
            );
        });

        it('should add the ez-js-standard-form class', function () {
            const view = getViewMock(container);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
            assert.isTrue(subitem.classList.contains('ez-js-standard-form'));
        });

        it('should set the YUI view active', function () {
            const view = getViewMock(container);
            const setSpy = sinon.spy(view, 'set').withArgs('active', true);

            renderViewStub = sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));

            assert.ok(setSpy.calledOnce);
        });
    });

    describe('disconnect', function () {
        const container = document.createElement('div');
        const view = getViewMock(container);

        beforeEach(function () {
            subitem = fixture('BasicTestFixture');
            defineGlobals();
            sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                done(false, 'whatever', view);
            });

            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
        });

        it('should set the YUI view inactive', function () {
            const setSpy = sinon.spy(view, 'set').withArgs('active', false);

            subitem.parentNode.removeChild(subitem);
            assert.ok(setSpy.calledOnce);
        });

        it('should destroy the YUI view', function () {
            const destroySpy = sinon.spy(view, 'destroy').withArgs({remove: true});

            subitem.parentNode.removeChild(subitem);
            assert.ok(destroySpy.calledOnce);
        });
    });
});
