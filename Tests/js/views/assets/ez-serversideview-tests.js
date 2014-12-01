/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideview-tests', function (Y) {
    var viewTest, tabTest, formTest,
        Assert = Y.Assert;

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

        "should track the html attribute change to rerender the view": function () {
            var html = 'Changed!';

            this.view.render();
            this.view.set('active', true);
            this.view.set('html', html);

            Assert.areEqual(
                html,
                this.view.get('container').getContent(),
                "The view should have been rerendered"
            );
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

    formTest = new Y.Test.Case({
        name: "eZ Server Side view form tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.form-test-container'),
                html: '<form method="post" action=""><input type="submit" value="Go!"></form>'
            });
        },

        "Should handle the form submit": function () {
            var c = this.view.get('container'),
                form, submitFormEvent = false;

            this.view.on('submitForm', function (e) {
                submitFormEvent = true;
                Assert.isObject(
                    e.originalEvent,
                    "The original submit event should be provided"
                );
                Assert.areSame(
                    form, e.form,
                    "The form should be provided"
                );
                e.originalEvent.preventDefault();
            });
            this.view.render();

            form = c.one('form');
            form.one('input').simulate('click');
            Assert.isTrue(submitFormEvent, "The submitForm should have been fired");
        },

        tearDown: function () {
            this.view.destroy();
        },
    });


    Y.Test.Runner.setName("eZ Server Side View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(tabTest);
    Y.Test.Runner.add(formTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-serversideview']});
