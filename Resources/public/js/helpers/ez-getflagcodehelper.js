/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-getflagcodehelper', function (Y) {
    Y.Handlebars.registerHelper('getFlagCode', function (languageCode) {
        return languageCode.substring(4, 6).toLowerCase();
    });

});
