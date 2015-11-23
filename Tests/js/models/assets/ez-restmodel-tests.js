/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-restmodel-tests', function (Y) {
    var modelTest, resetTest, toJSONTest,
        Assert = Y.Assert, Mock = Y.Mock,
        Model, DeepModel;

    Model = Y.Base.create('testModel', Y.eZ.RestModel, [], {
    }, {
        ATTRS: {
            name: {
                value: ""
            },
            newIdName: {
                value: 0
            },
            bool: {
                setter: '_setterBoolean',
                value: false
            },
            date: {
                setter: '_setterDate',
                value: new Date(0)
            },
            localized: {
                setter: '_setterLocalizedValue',
                value: {}
            }
        },
        ATTRS_REST_MAP: [
            "name", {"restId": "newIdName"}, "localized", "date"
        ],
        LINKS_MAP: [
            'Link1', 'Link2'
        ]
    });

    DeepModel = Y.Base.create('testDeepModel', Y.eZ.RestModel, [], {
    }, {
        ATTRS: {
            name: {
                value: ""
            },
            newIdName: {
                value: 0
            },
            bool: {
                setter: '_setterBoolean',
                value: false
            },
            date: {
                setter: '_setterDate',
                value: new Date(0)
            },
            localized: {
                setter: '_setterLocalizedValue',
                value: {}
            }
        },
        ATTRS_REST_MAP: [
            "name", {"restId": "newIdName"}, "localized", "date"
        ],
        LINKS_MAP: [
            'Link1', 'Link2'
        ],
        REST_STRUCT_ROOT: "Very.Deep.Struct"
    });

    modelTest = new Y.Test.Case({
        name: "eZ Rest Model tests",

        setUp: function () {
            this.model = new Model();
            this.deepModel = new DeepModel();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should convert non boolean value into boolean": function () {
            var m = this.model;

            m.set('bool', 'true');
            Y.Assert.isTrue(m.get('bool'), "'true' should be transformed to true");
            m.set('bool', 'false');
            Y.Assert.isFalse(m.get('bool'), "'false' should be transformed to false");
            m.set('bool', {});
            Y.Assert.isFalse(m.get('bool'), "{} should be transformed to false");
        },

        "Should keep boolean value": function () {
            var m = this.model;

            m.set('bool', true);
            Y.Assert.isTrue(m.get('bool'), "bool should stay true");
            m.set('bool', false);
            Y.Assert.isFalse(m.get('bool'), "bool should stay false");
        },

        "Should keep date value": function () {
            var m = this.model,
                now = new Date();

            m.set('date', now);
            Y.Assert.areSame(m.get('date'), now);
        },

        "Should convert to date": function () {
            var m = this.model,
                ts = 1000000;

            m.set('date', ts);
            Y.Assert.isInstanceOf(Date, m.get('date'));
            Y.Assert.areEqual(ts, +m.get('date'));
        },

        "Should ignore unrecognized date": function () {
            var now = +(new Date()),
                m = this.model;

            m.set('date', '');
            Y.Assert.isInstanceOf(Date, m.get('date'));
            Y.Assert.areEqual(+m.get('date'), now);
        },

        "Should transform a localized value": function () {
            var m = this.model,
                val = {
                    value: [{
                        '_languageCode': 'fre-FR',
                        '#text': "La guerre des étoiles"
                    }, {
                        '_languageCode': 'eng-GB',
                        '#text': 'Star wars'
                    }]
                };
            m.set('localized', val);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 2, "Should have 2 localized value");
            Y.Assert.areEqual(m.get('localized')["eng-GB"], "Star wars");
            Y.Assert.areEqual(m.get('localized')["fre-FR"], "La guerre des étoiles");
        },

        "Should not set invalid localized value": function () {
            var m = this.model,
                val1 = 1,
                val2 = [{
                    '_languageCode': 'fre-FR',
                    '#text': "La guerre des étoiles"
                }, {
                    '_languageCode': 'eng-GB',
                    '#text': 'Star wars'
                }];
            m.set('localized', val1);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 0, "Should keep the default value");

            m.set('localized', val2);
            Y.Assert.areEqual(Y.Object.keys(m.get('localized')).length, 0, "Should keep the default value");
        },
        "Should map the rest struct": function () {
            var m = this.model,
                struct = {
                    "name": "My name",
                    "restId": 42,
                    "notParsed": false
                },
                response = {
                    document: struct
                };

            m.setAttrs(m.parse(response));
            Y.Assert.isUndefined(
                m.get('notParsed'),
                "'notParsed' property should not be parsed/imported"
            );
            Y.Assert.areSame(
                m.get('name'),
                struct.name,
                "'name' should be imported"
            );
            Y.Assert.areSame(
                m.get('newIdName'),
                struct.restId,
                "'restId' should be imported as newIdName"
            );
        },

        "Should import the links": function () {
            var m = this.model,
                struct = {
                    Link1: {
                        _href: "/link1"
                    },
                    Link2: {
                        _href: "/link2"
                    },
                    Link3: {
                        _href: "/link3"
                    }
                },
                response = {
                    document: struct
                };

            m.setAttrs(m.parse(response));

            Y.Assert.areEqual(
                Model.LINKS_MAP.length,
                Y.Object.size(m.get('resources')),
                "Should have " + Model.LINKS_MAP.length + " resources"
            );
            Y.Assert.areEqual(
                "/link1",
                m.get('resources').Link1,
                "Link1 does not have the correct value (/links1)"
            );
            Y.Assert.areEqual(
                "/link2",
                m.get('resources').Link2,
                "Link2 does not have the correct value (/links2)"
            );
            Y.Assert.isUndefined(
                m.get('resources').Link3,
                "Link3 should not be imported"
            );
        },

        "Should map the rest struct with a deep structure": function () {
            var m = this.deepModel,
                struct = {
                    "Very": {
                        "Deep": {
                            "Struct": {
                                "name": "My name",
                                "restId": 42,
                                "notParsed": false
                            }
                        }
                    }
                },
                response = {
                    document: struct
                };

            m.setAttrs(m.parse(response));
            Y.Assert.isUndefined(
                m.get('notParsed'),
                "'notParsed' property should not be parsed/imported"
            );
            Y.Assert.areSame(
                m.get('name'),
                struct.Very.Deep.Struct.name,
                "'name' should be imported"
            );
            Y.Assert.areSame(
                m.get('newIdName'),
                struct.Very.Deep.Struct.restId,
                "'restId' should be imported as newIdName"
            );
        },

        "Should import the links with a deep structure": function () {
            var m = this.deepModel,
                struct = {
                    "Very": {
                        "Deep": {
                            "Struct": {
                                Link1: {
                                    _href: "/link1"
                                },
                                Link2: {
                                    _href: "/link2"
                                },
                                Link3: {
                                    _href: "/link3"
                                }
                            }
                        }
                    }
                },
                response = {
                    document: struct
                };

            m.setAttrs(m.parse(response));

            Y.Assert.areEqual(
                DeepModel.LINKS_MAP.length,
                Y.Object.size(m.get('resources')),
                "Should have " + Model.LINKS_MAP.length + " resources"
            );
            Y.Assert.areEqual(
                "/link1",
                m.get('resources').Link1,
                "Link1 does not have the correct value (/links1)"
            );
            Y.Assert.areEqual(
                "/link2",
                m.get('resources').Link2,
                "Link2 does not have the correct value (/links2)"
            );
            Y.Assert.isUndefined(
                m.get('resources').Link3,
                "Link3 should not be imported"
            );
        },

        _loadFromHashTest: function (m) {
            var hash = {
                name: "Something from nothing",
                restId: 42,
                bool: "false",
                date: "2014-10-17T11:21:38+02:00",
                localized: {
                    value: [{
                        '_languageCode': 'fre-FR',
                        '#text': 'Sorti le 17/10/2014'
                    }, {
                        '_languageCode': 'eng-GB',
                        '#text': 'Released on 2014-10-17'
                    }],
                },
                Link1: {
                    '_href': '/link1',
                },
            };

            m.loadFromHash(hash);

            Y.Assert.areEqual(hash.name, m.get('name'), "The name should be parsed");
            Y.Assert.areEqual(hash.restId, m.get('newIdName'), "The newIdName should be parsed as restId");
            Y.Assert.areEqual(false, m.get('bool'), "The bool should transform to a boolean value");

            Y.Assert.isInstanceOf(Date, m.get('date'), "A date object should be created");
            Y.Assert.areEqual(+(new Date(hash.date)), +m.get('date'), "The date should be parsed");

            Y.Assert.areEqual(
                hash.localized.length, m.get('localized').length,
                "The localized date should be parsed"
            );
            Y.Assert.areEqual(hash.localized.value[0]['#text'], m.get('localized')['fre-FR']);
            Y.Assert.areEqual(hash.localized.value[1]['#text'], m.get('localized')['eng-GB']);

            Y.Assert.areEqual(hash.Link1._href, m.get('resources').Link1, "The link should be parsed");
        },

        "Should load the model from the provided hash": function () {
            this._loadFromHashTest(this.model);
        },

        "Should load the deep model from the provided hash": function () {
            this._loadFromHashTest(this.deepModel);
        },
    });

    resetTest = new Y.Test.Case({
        name: "eZ Rest Model tests",

        setUp: function () {
            this.model = new Model();
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should force the id to its default value together with the others attributes": function () {
            this.model.set('id', 'an id');
            this.model.set('name', 'model name');
            this.model.reset();

            Y.Assert.isNull(this.model.get('id'), "The id should be resetted to null");
            Y.Assert.areEqual("", this.model.get('name'), "The name should be resetted to its default value");
        },

        "Should reset only the id": function () {
            var name = 'model name';

            this.model.set('id', 'an id');
            this.model.set('name', name);
            this.model.reset('id');

            Y.Assert.isNull(this.model.get('id'), "The id should be resetted to null");
            Y.Assert.areEqual(name, this.model.get('name'), "The name should keep its value");
        },

        "Should leave the id intact": function () {
            var idValue = 'an id';

            this.model.set('id', idValue);
            this.model.set('name', 'model name');
            this.model.reset('name');

            Y.Assert.areEqual(idValue, this.model.get('id'), "The id should be kept");
            Y.Assert.areEqual("", this.model.get('name'), "The name should be resetted to its default value");
        },
    });

    toJSONTest = new Y.Test.Case({
        name: "eZ Rest Model tests",

        setUp: function () {
            this.model = new Y.eZ.RestModel();
            this.model.set('foo', 'bar');
            this.model.set('obj', {});
        },

        tearDown: function () {
            this.model.destroy();
            delete this.model;
        },

        "Should convert the model to a plain object": function () {
            var json = this.model.toJSON();

            Assert.isObject(json, "toJSON should generate an object");
            Assert.areEqual(
                this.model.get('foo'), json.foo,
                "toJSON object should contain the attribute values"
            );
            Assert.areSame(
                this.model.get('obj'), json.obj,
                "toJSON object should contain the attribute values"
            );
        },

        "Should convert model in attribute": function () {
            var modelMock = new Mock(),
                mockJSON = {'whatever': ''},
                json;

            Mock.expect(modelMock, {
                method: 'toJSON',
                returns: mockJSON,
            });

            this.model.set('model', modelMock);
            json = this.model.toJSON();

            Mock.verify(modelMock);
            Assert.areSame(
                mockJSON, json.model,
                "The model in attribute should be jsonified"
            );
        },
    });

    Y.Test.Runner.setName("eZ Rest Model tests");
    Y.Test.Runner.add(modelTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(toJSONTest);
}, '', {requires: ['test', 'ez-restmodel']});
