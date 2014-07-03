/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-texthelper-tests', function (Y) {
    var test;

    test = new Y.Test.Case({
        name: "eZ Text Helper tests",

        "urlEncode should be registered": function () {
            Y.Assert.isFunction(
                Y.Handlebars.helpers.urlEncode,
                "The helper urlEncode should be registered"
            );
        },

        "urlEncode should encode URIs": function () {
            var cases = {
                    'test': 'test',
                    'space space': 'space%20space',
                    '/api/ezp/v2/content/locations/1/2/111': '%2Fapi%2Fezp%2Fv2%2Fcontent%2Flocations%2F1%2F2%2F111'
                },
                helper = Y.Handlebars.helpers.urlEncode;
            Y.Object.each(cases, function (value, key) {
                Y.Assert.areSame(
                    value, helper(key),
                    "urlEncode('" + key + "') should result in " + value
                );
            });
        }
    });

    Y.Test.Runner.setName("eZ Text Helper tests");
    Y.Test.Runner.add(test);

}, '', {requires: ['test', 'ez-texthelper']});
