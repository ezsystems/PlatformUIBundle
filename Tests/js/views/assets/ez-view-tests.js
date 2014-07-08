/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-view-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ View view tests",

        setUp: function () {
            this.TestView = Y.Base.create('TestView', Y.eZ.View, [], {}, {
                ATTRS: {
                    notAView: {},
                    subEzView: {
                        value: new Y.eZ.View()
                    },
                    subPlainView: {
                        value: new Y.View()
                    }
                }
            });
        },

        "Should set the 'active' attribute to the sub ez views": function () {
            var view = new this.TestView();

            view.set('active', true);

            Y.Assert.isTrue(
                view.get('subEzView').get('active'),
                "The active attribute of the subEzView should be set to true"
            );

            Y.Assert.isUndefined(
                view.get('subPlainView').get('active'),
                "The active attribute of the subPlainView should be undefined"
            );
        }
    });

    Y.Test.Runner.setName("eZ View view tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-view']});
