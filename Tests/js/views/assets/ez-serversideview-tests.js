YUI.add('ez-serversideview-tests', function (Y) {
    var viewTest;

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

    Y.Test.Runner.setName("eZ Server Side View tests");
    Y.Test.Runner.add(viewTest);

}, '0.0.1', {requires: ['test', 'ez-serversideview']});
