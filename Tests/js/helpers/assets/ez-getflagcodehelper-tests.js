/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-getflagcodehelper-tests', function (Y) {
    var test;

    test = new Y.Test.Case({
        name: "eZ Get Flag Code Helper tests",

        "getFlagCode should be registered": function () {
            Y.Assert.isFunction(
                Y.Handlebars.helpers.getFlagCode,
                "The helper getFlagCode should be registered"
            );
        },

        "getFlagCode should return flag code": function () {
            var cases = {
                    'eng-GB': 'gb',
                    'pol-PL': 'pl',
                    'fre-FR': 'fr',
                    'ger-DE': 'de'
                },
                helper = Y.Handlebars.helpers.getFlagCode;
            Y.Object.each(cases, function (value, key) {
                Y.Assert.areSame(
                    value, helper(key),
                    "getFlagCode('" + key + "') should result in " + value
                );
            });
        }
    });

    Y.Test.Runner.setName("eZ Get Flag Code Helper tests");
    Y.Test.Runner.add(test);

}, '', {requires: ['test', 'ez-getflagcodehelper']});
