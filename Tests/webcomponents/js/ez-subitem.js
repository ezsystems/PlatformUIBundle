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
            this.refresh = function () {};
        };

        return new View();
    }

    function getViewServiceMock() {
        const Service = function () {
            this.reload = function (next) {next();};
        };

        return new Service();
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

    describe('refresh', function () {
        const view = getViewMock(document.createElement('div'));
        const viewService = getViewServiceMock();

        beforeEach(function () {
            subitem = fixture('BasicTestFixture');
            defineGlobals();
            sinon.stub(window.eZ.YUI.app, 'renderView', function (View, Service, params, done) {
                done(false, viewService, view);
            });
            sinon.spy(view, 'refresh');
            sinon.spy(viewService, 'reload');
        });

        afterEach(function () {
            delete window.eZ;
            view.refresh.restore();
            viewService.reload.restore();
        });

        it('should reload the view service and refresh the view', function () {
            document.dispatchEvent(new CustomEvent('ez:yui-app:ready'));
            subitem.refresh();

            assert.isTrue(
                viewService.reload.calledOnce,
                '`reload` should have been called on the YUI view service'
            );
            assert.isTrue(
                view.refresh.calledOnce,
                '`refresh` should have been called on the YUI view'
            );
        });

        it('should ignore the refresh call if not already rendered', function () {
            subitem.refresh();

            assert.isFalse(
                viewService.reload.called,
                '`reload` should not have been called'
            );
            assert.isFalse(
                view.refresh.called,
                '`refresh` should not have been called'
            );
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
