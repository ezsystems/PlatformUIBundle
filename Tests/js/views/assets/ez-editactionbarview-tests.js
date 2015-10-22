/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-editactionbarview-tests', function (Y) {
    var viewTest;

    viewTest = new Y.Test.Case({
        name: "eZ Edit Action Bar View test",

        setUp: function () {
            this.version = new Y.Mock();
            this.view = new Y.eZ.EditActionBarView({
                container: '.container',
                actionsList: [],
                version: this.version
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should set the version and the languageCode to new action list": function () {
            var newActionList = [new Y.Mock(), new Y.Mock(), new Y.Mock()];

            Y.Array.each(newActionList, function (mock) {
                Y.Mock.expect(mock, {
                    method: 'set',
                    callCount: 4,
                    args: [Y.Mock.Value.String, Y.Mock.Value.Any],
                    run: function (name, object) {
                        if (name === 'version') {
                            Y.Assert.isObject(object);
                        } else if (name === 'languageCode') {
                            Y.Assert.isString(object);
                        } else {
                            Y.fail("Unexpected parameter name " + name + " for content mock");
                        }
                    }
                });

                Y.Mock.expect(mock, {
                    method: 'removeTarget',
                    args: [this.view]
                });
                Y.Mock.expect(mock, {
                    method: 'destroy',
                });
            }, this);


            this.view.set('actionsList', newActionList);
            this.view.destroy();

            Y.Array.each(newActionList, function (mock) {
                Y.Mock.verify(mock);
            });
        }
    });

    Y.Test.Runner.setName("eZ Edit Action Bar View tests");
    Y.Test.Runner.add(viewTest);
}, '', {requires: ['test', 'ez-editactionbarview']});
