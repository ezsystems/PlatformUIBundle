YUI.add('ez-serversideview-tests', function (Y) {
    var viewTest, tabTest;

    viewTest = new Y.Test.Case({
        name: "eZ Server Side view tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "getTitle should return the title": function () {
            var title = 'Love Illumination';

            this.view.set('title', title);
            Y.Assert.areSame(title, this.view.getTitle());
        },

        "should set the html as the content of the container": function () {
            var html = '<p>What are you looking for ?</p>',
                container = this.view.get('container');

            this.view.set('html', html);
            this.view.render();

            Y.Assert.areEqual(container.getHTML(), html);
        },

        "should set the server side class on the container": function () {
            var container = this.view.get('container');

            this.view.render();
            Y.Assert.isTrue(container.hasClass('ez-view-serversideview'));
        },
    });

    tabTest = new Y.Test.Case({
        name: "eZ Server Side view tabs tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.tab-test-container')
            });
        },

        _selectTab: function (linkSelector, labelId) {
            var that = this, c = this.view.get('container'),
                target = c.one(linkSelector),
                initialHash;

            initialHash = Y.config.win.location.hash;
            console.log(c.get('innerHTML'));
            target.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        labelId, c.one('.is-tab-selected').get('id'),
                        "The last label should have been selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-list .is-tab-selected').size(), 1,
                        "Only one label should be selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-panels .is-tab-selected').size(), 1,
                        "Only one panel should be selected"
                    );

                    Y.Assert.areEqual(
                        target.getAttribute('href').replace(/^#/, ''),
                        c.one('.ez-tabs-panels .is-tab-selected').get('id'),
                        "The panel indicated by the label link should be selected"
                    );

                    Y.Assert.areEqual(
                        initialHash, Y.config.win.location.hash,
                        "The location hash should be intact (tap event is prevented)"
                    );
                });
            });
            this.wait();
        },

        "Should select label on tap": function () {
            this._selectTab('#last-label a', 'last-label');
        },

        "Should not change selection, when already selected label is tapped": function () {
            this._selectTab('#first-label a', 'first-label');
        },

        tearDown: function () {
            this.view.destroy();
        },
    });

    Y.Test.Runner.setName("eZ Server Side View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(tabTest);

}, '0.0.1', {requires: ['test', 'node-event-simulate', 'ez-serversideview']});
