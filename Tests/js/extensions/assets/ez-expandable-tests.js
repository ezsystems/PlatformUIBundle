/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-expandable-tests', function (Y) {
    var viewTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Expandable extension tests",

        setUp: function () {
            this.View = Y.Base.create('testView', Y.View, [Y.eZ.Expandable], {});
            this.view = new this.View();
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should not be expanded by default": function () {
            Assert.isFalse(this.view.get('expanded'), "`expanded` should be false by default");
            Assert.isFalse(
                this.view.get('container').hasClass('is-expanded'),
                "The container should not get the `is-expanded` class by default"
            );
        },

        "Should add the `is-expanded` class": function () {
            this.view.set('expanded', true);
            Assert.isTrue(
                this.view.get('container').hasClass('is-expanded'),
                "The container should get the `is-expanded` class"
            );
        },

        "Should remove the `is-expanded` class": function () {
            this.view.set('expanded', true);
            this.view.set('expanded', false);
            Assert.isFalse(
                this.view.get('container').hasClass('is-expanded'),
                "The container should not get the `is-expanded` class"
            );
        },
    });

    Y.Test.Runner.setName("eZ Expandable extension tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-expandable']});
