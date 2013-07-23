YUI.add('ez-contentmodel-tests', function (Y) {

    var modelTest,
        capiMock, contentServiceMock,

        LOAD_CONTENT_RESPONSE = {
            "Content": {
                "_media-type": "application\/vnd.ez.api.Content+json",
                "_href": "\/api\/ezp\/v2\/content\/objects\/57",
                "_remoteId": "8a9c9c761004866fb458d89910f52bee",
                "_id": 57,
                "ContentType": {
                    "_media-type": "application\/vnd.ez.api.ContentType+json",
                    "_href": "\/api\/ezp\/v2\/content\/types\/23"
                },
                "Name": "Home",
                "MainLocation": {
                    "_media-type": "application\/vnd.ez.api.Location+json",
                    "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                },
                "Owner": {
                    "_media-type": "application\/vnd.ez.api.User+json",
                    "_href": "\/api\/ezp\/v2\/user\/users\/14"
                },
                "lastModificationDate": "2010-09-14T10:46:59+02:00",
                "publishedDate": "2007-11-19T14:54:46+01:00",
                "mainLanguageCode": "eng-GB",
                "alwaysAvailable": "true"
            }
        };

    capiMock = new Y.Mock();
    contentServiceMock = new Y.Mock();


    modelTest = new Y.Test.Case({
        name: "eZ Content Model tests",

        setUp: function () {
            this.model = new Y.eZ.Content();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Sync 'read' should load the content with CAPI": function () {
            var m = this.model,
                modelId = "/api/v2/ezp/content/object/42",
                callback = function () { };

            Y.Mock.expect(capiMock, {
                method: 'getContentService',
                returns: contentServiceMock
            });
            Y.Mock.expect(contentServiceMock, {
                method: 'loadContentInfoAndCurrentVersion',
                args: [
                    modelId,
                    callback
                ]
            });

            m.set('id', modelId);
            m.sync('read', {
                    api: capiMock
                }, callback
            );

            Y.Mock.verify(capiMock);
            Y.Mock.verify(contentServiceMock);
        },

        "Sync action other than 'read' are not supported": function () {
            var m = this.model, called = false,
                callback = function (err) {
                    called = true;
                    Y.assert(err, "The 'err' param of the callback should be set to a truthy value");
                };

            m.sync('create', {api: capiMock}, callback);
            Y.assert(called, "The callback should have been called");
        },
        
        "parse should return null and fire the error event on JSON parse error": function () {
            var m = this.model,
                response, res = false,
                errorFired = false;

            response = {
                body: "{invalid json string"
            };

            m.on('error', function (e) {
                errorFired = true;

                Y.Assert.areEqual('parse', e.src, "'src' property should set to 'parse'");
                Y.Assert.isString(e.error, "'error' property should set to a string");
                Y.Assert.areSame(response, e.response, "'response' property should be set to the response that failed to be parsed");
            });

            res = m.parse(response);

            Y.Assert.isTrue(errorFired, "The error event should been fired");
            Y.Assert.isNull(res, "The result of parse should be null");
        },

        "parse should return a correctly parsed hash": function () {
            var m = this.model,
                response, res = false,
                errorFired = false, key, identifier, i, len;

            response = {
                body: Y.JSON.stringify(LOAD_CONTENT_RESPONSE)
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");

            Y.Assert.areEqual(Y.Object.size(res), Y.eZ.Content.ATTRS_REST_MAP.length + 1);
            for (i = 0, len = Y.eZ.Content.ATTRS_REST_MAP.length; i != len; ++i) {
                key = Y.eZ.Content.ATTRS_REST_MAP[i];

                if ( Y.Lang.isString(key) ) {
                    identifier = key;
                } else if ( Y.Lang.isObject(key) ) {
                    identifier = Y.Object.keys(key)[0];
                    key = key[identifier];
                }
                Y.Assert.areEqual(
                    res[identifier],
                    LOAD_CONTENT_RESPONSE.Content[key],
                    identifier + " should have been set to the value of LOAD_CONTENT_RESPONSE.Content." + key
                );
            }
            for (i = 0, len = Y.eZ.Content.LINKS_MAP.length; i != len; ++i) {
                key = Y.eZ.Content.LINKS_MAP[i];
                Y.Assert.areEqual(
                    res.resources[key],
                    LOAD_CONTENT_RESPONSE.Content[key]._href
                );
            }
        }

    });

    Y.Test.Runner.setName("eZ Content Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'ez-contentmodel', 'ez-restmodel']});
