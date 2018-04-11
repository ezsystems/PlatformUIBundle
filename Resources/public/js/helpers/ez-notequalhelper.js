/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-notequalhelper', function (Y) {
    Y.Handlebars.registerHelper('notEqual', function (left, right, options) {
        var result = left !== right;

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

});
