/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoverymethodbaseview-tests', function (Y) {
    var identifierTest,
        Assert = Y.Assert;

    identifierTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Method Base getHTMLIdentifier tests',

        setUp: function () {
            this.identifier = 'the-black-keys';
            this.view = new Y.eZ.UniversalDiscoveryMethodBaseView();
            this.view._set('identifier', this.identifier);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should return an identifier based on the identifier attribute": function () {
            Assert.areEqual(
                'ez-ud-' + this.identifier, this.view.getHTMLIdentifier(),
                "The HTML identifier should be the identifier with a prefix"
            );
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Method Base View tests");
    Y.Test.Runner.add(identifierTest);
}, '', {requires: ['test', 'ez-universaldiscoverymethodbaseview']});
