/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-binaryfile-view-tests', function (Y) {
    var viewTest, registerTest;

    viewTest = new Y.Test.Case(
        Y.merge(Y.eZ.Test.FieldViewTestCases, {
            name: "eZ Binary File View test",

            setUp: function () {
                this.templateVariablesCount = 4;
                this.fieldDefinition = {fieldType: 'ezbinaryfile'};
                this.field = {
                    fieldValue: {
                        "id": "application\/5e334d334ddcf1f1064e44ef48456bdd.mup",
                        "fileName": "Audioslave - Revelations.ogg",
                        "fileSize": 464686,
                        "mimeType": "application\/octet-stream",
                        "uri": "http:\/\/ezpublish5.loc\/var\/ezdemo_site\/storage\/original\/application\/5e334d334ddcf1f1064e44ef48456bdd.mup",
                        "downloadCount": 0,
                        "url": "http:\/\/ezpublish5.loc\/var\/ezdemo_site\/storage\/original\/application\/5e334d334ddcf1f1064e44ef48456bdd.mup"
                    }
                };
                this.isEmpty = false;
                this.view = new Y.eZ.BinaryFileView({
                    fieldDefinition: this.fieldDefinition,
                    field: this.field
                });
            },

            tearDown: function () {
                this.view.destroy();
            },
        })
    );

    Y.Test.Runner.setName("eZ Binary File View tests");
    Y.Test.Runner.add(viewTest);

    registerTest = new Y.Test.Case(Y.eZ.Test.RegisterFieldViewTestCases);

    registerTest.name = "Binary File View registration test";
    registerTest.viewType = Y.eZ.BinaryFileView;
    registerTest.viewKey = "ezbinaryfile";

    Y.Test.Runner.add(registerTest);

}, '', {requires: ['test', 'ez-binaryfile-view', 'ez-genericfieldview-tests']});
