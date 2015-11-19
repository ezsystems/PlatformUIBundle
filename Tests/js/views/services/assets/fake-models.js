/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('fake-models', function (Y) {
    Y.namespace('eZ');

    Y.eZ.Content = Y.Model;
    Y.eZ.ContentInfo = Y.Model;
    Y.eZ.ContentType = Y.Model;
    Y.eZ.Location = Y.Model;
    Y.eZ.User = Y.Model;
    Y.eZ.Version = Y.Model;
}, '', {requires: ['model']});
