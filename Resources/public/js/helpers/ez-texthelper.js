/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-texthelper', function (Y) {
    var win = Y.config.win;

    Y.Handlebars.registerHelper('urlEncode', function (txt) {
        return win.encodeURIComponent(txt);
    });

});
