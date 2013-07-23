YUI.add('ez-usermodel-tests', function (Y) {

    var modelTest,
        capiMock, userServiceMock,

        LOAD_USER_RESPONSE = {
            "User": {
                "_media-type": "application/vnd.ez.api.User+json",
                "_href": "/api/ezp/v2/user/users/14",
                "_id": 14,
                "_remoteId": "1bb4fe25487f05527efa8bfd394cecc7",
                "publishDate": "2002-10-06T18:13:50+02:00",
                "lastModificationDate": "2013-07-17T15:03:10+02:00",
                "mainLanguageCode": "eng-GB",
                "alwaysAvailable": "true",
                "login": "admin",
                "email": "dp@ez.no",
                "enabled": "true",
                "name": "Administrator User"
            }
        };

    capiMock = new Y.Mock();
    userServiceMock = new Y.Mock();

    modelTest = new Y.Test.Case({
        name: "eZ User Model tests",

        setUp: function () {
            this.model = new Y.eZ.User();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Sync 'read' should load the content with CAPI": function () {
            var m = this.model,
                modelId = "/api/v2/ezp/user/user/14",
                callback = function () { };

            Y.Mock.expect(capiMock, {
                method: 'getUserService',
                returns: userServiceMock
            });
            Y.Mock.expect(userServiceMock, {
                method: 'loadUser',
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
            Y.Mock.verify(userServiceMock);
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
                errorFired = false, key, identifier, i, len, linksMap;

            response = {
                body: Y.JSON.stringify(LOAD_USER_RESPONSE)
            };

            m.on('error', function (e) {
                errorFired = true;
            });

            res = m.parse(response);

            Y.Assert.isFalse(errorFired, "The error event should not have been fired");

            Y.Assert.areEqual(Y.Object.size(res), Y.eZ.User.ATTRS_REST_MAP.length + 1);
            for (i = 0, len = Y.eZ.User.ATTRS_REST_MAP.length; i != len; ++i) {
                key = Y.eZ.User.ATTRS_REST_MAP[i];

                if ( Y.Lang.isString(key) ) {
                    identifier = key;
                } else if ( Y.Lang.isObject(key) ) {
                    identifier = Y.Object.keys(key)[0];
                    key = key[identifier];
                }
                Y.Assert.areEqual(
                    res[identifier],
                    LOAD_USER_RESPONSE.User[key],
                    identifier + " should have been set to the value of LOAD_USER_RESPONSE.User." + key
                );
            }
            linksMap = Y.eZ.User.LINKS_MAP ? Y.eZ.User.LINKS_MAP : [];
            Y.Assert.areEqual(Y.Object.size(res.resources), linksMap.length, "resources length");
            for (i = 0, len = linksMap.length; i != len; ++i) {
                key = linksMap[i];
                Y.Assert.areEqual(
                    res.resources[key],
                    LOAD_USER_RESPONSE.User[key]._href
                );
            }

        }

    });

    Y.Test.Runner.setName("eZ User Model tests");
    Y.Test.Runner.add(modelTest);

}, '0.0.1', {requires: ['test', 'ez-usermodel', 'ez-restmodel']});
