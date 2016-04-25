/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-trashviewservice-tests', function (Y) {
    var serviceTest, emptyTrashButtonTest, restoreItemsTest,
        Assert = Y.Assert, Mock = Y.Mock;

    serviceTest = new Y.Test.Case({
        name: "eZ Trash View Service tests",

        setUp: function () {
            this.trashResponse ={"document" :{
                "Trash": {
                    "_media-type": "application\/vnd.ez.api.Trash+json",
                    "_href": "\/api\/ezp\/v2\/content\/trash",
                    "TrashItem": [
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/54",
                            "id": 54,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                            },
                            "pathString": "\/1\/2\/54\/",
                            "depth": 2,
                            "childCount": 0,
                            "remoteId": "19d14270a67a7a12951177ff33fc946d",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/52"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/52",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/52",
                                    "_remoteId": "cb7f9452a4760fc688244fc4ff7969d1",
                                    "_id": 52,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/2"
                                    },
                                    "Name": "p1",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/52\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/52\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/52\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-12T09:22:31+01:00",
                                    "publishedDate": "2016-01-12T09:22:31+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": false,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/52\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/55",
                            "id": 55,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                            },
                            "pathString": "\/1\/2\/55\/",
                            "depth": 2,
                            "childCount": 0,
                            "remoteId": "0458c82327b09582b697a05280cd8da3",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/53"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/53",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/53",
                                    "_remoteId": "0594eba68adab2c50e58477abcccf044",
                                    "_id": 53,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/2"
                                    },
                                    "Name": "p2",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/53\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/53\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/53\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-12T09:22:50+01:00",
                                    "publishedDate": "2016-01-12T09:22:50+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": false,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/53\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/56",
                            "id": 56,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                            },
                            "pathString": "\/1\/2\/56\/",
                            "depth": 2,
                            "childCount": 0,
                            "remoteId": "78363d0d0034b985dc518512230d395a",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/54"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/54",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/54",
                                    "_remoteId": "48db00e36c7efd20a3ee1bc6724db143",
                                    "_id": 54,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/1"
                                    },
                                    "Name": "Folder1",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/54\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/54\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/54\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-13T17:24:00+01:00",
                                    "publishedDate": "2016-01-13T17:24:00+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": true,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/54\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/57",
                            "id": 57,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2\/56"
                            },
                            "pathString": "\/1\/2\/56\/57\/",
                            "depth": 3,
                            "childCount": 0,
                            "remoteId": "60d1ad39495c7fc3f2740cf1c063c9cc",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/55"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/55",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/55",
                                    "_remoteId": "de8563d1628dbf81b7ecee41a19a4371",
                                    "_id": 55,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/2"
                                    },
                                    "Name": "a42",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/55\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/55\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/55\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-13T17:24:23+01:00",
                                    "publishedDate": "2016-01-13T17:24:23+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": false,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/55\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/59",
                            "id": 59,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2\/58"
                            },
                            "pathString": "\/1\/2\/58\/59\/",
                            "depth": 3,
                            "childCount": 0,
                            "remoteId": "cf2aed3abd51a871f820063dcc690cf3",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/57"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/57",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/57",
                                    "_remoteId": "262030640ed5a9df2f2339b728321a53",
                                    "_id": 57,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/2"
                                    },
                                    "Name": "truc",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/57\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/57\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/57\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-15T14:25:39+01:00",
                                    "publishedDate": "2016-01-15T14:25:39+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": false,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/57\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/60",
                            "id": 60,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2"
                            },
                            "pathString": "\/1\/2\/60\/",
                            "depth": 2,
                            "childCount": 0,
                            "remoteId": "d3bae4d508a8c30f7103834fd9194488",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/58"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/58",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/58",
                                    "_remoteId": "20ec8740424ab6d0823b5d254c806a8e",
                                    "_id": 58,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/1"
                                    },
                                    "Name": "granpa",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/58\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/58\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/58\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-15T14:37:41+01:00",
                                    "publishedDate": "2016-01-15T14:37:41+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": true,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/58\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/61",
                            "id": 61,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2\/60"
                            },
                            "pathString": "\/1\/2\/60\/61\/",
                            "depth": 3,
                            "childCount": 0,
                            "remoteId": "032f98c4c4d1d4c83ef36122fdcace56",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/59"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/59",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/59",
                                    "_remoteId": "0219690512ca93cbe629ae03fc79bf77",
                                    "_id": 59,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/1"
                                    },
                                    "Name": "mom",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/59\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/59\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/59\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-15T14:38:06+01:00",
                                    "publishedDate": "2016-01-15T14:38:06+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": true,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/59\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/62",
                            "id": 62,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2\/60\/61"
                            },
                            "pathString": "\/1\/2\/60\/61\/62\/",
                            "depth": 4,
                            "childCount": 0,
                            "remoteId": "f0afe76d19c8b6c572ab891cabbedc11",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/60"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/60",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/60",
                                    "_remoteId": "d4f2e5ae81844e499f036c406f51e028",
                                    "_id": 60,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/1"
                                    },
                                    "Name": "son",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/60\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/60\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/60\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-15T14:38:23+01:00",
                                    "publishedDate": "2016-01-15T14:38:23+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": true,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/60\/objectstates"
                                    }
                                }
                            }
                        },
                        {
                            "_media-type": "application\/vnd.ez.api.TrashItem+json",
                            "_href": "\/api\/ezp\/v2\/content\/trash\/63",
                            "id": 63,
                            "priority": 0,
                            "hidden": false,
                            "invisible": false,
                            "ParentLocation": {
                                "_media-type": "application\/vnd.ez.api.Location+json",
                                "_href": "\/api\/ezp\/v2\/content\/locations\/1\/2\/60\/61"
                            },
                            "pathString": "\/1\/2\/60\/61\/63\/",
                            "depth": 4,
                            "childCount": 0,
                            "remoteId": "2201a0b2f093355651812e8649e9cccb",
                            "Content": {
                                "_media-type": "application\/vnd.ez.api.Content+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/61"
                            },
                            "sortField": "PATH",
                            "sortOrder": "ASC",
                            "ContentInfo": {
                                "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                "_href": "\/api\/ezp\/v2\/content\/objects\/61",
                                "Content": {
                                    "_media-type": "application\/vnd.ez.api.ContentInfo+json",
                                    "_href": "\/api\/ezp\/v2\/content\/objects\/61",
                                    "_remoteId": "0613ed6ebf6b331c0f3572b5e89ad9ce",
                                    "_id": 61,
                                    "ContentType": {
                                        "_media-type": "application\/vnd.ez.api.ContentType+json",
                                        "_href": "\/api\/ezp\/v2\/content\/types\/1"
                                    },
                                    "Name": "daughter",
                                    "Versions": {
                                        "_media-type": "application\/vnd.ez.api.VersionList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/61\/versions"
                                    },
                                    "CurrentVersion": {
                                        "_media-type": "application\/vnd.ez.api.Version+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/61\/currentversion"
                                    },
                                    "Section": {
                                        "_media-type": "application\/vnd.ez.api.Section+json",
                                        "_href": "\/api\/ezp\/v2\/content\/sections\/1"
                                    },
                                    "Locations": {
                                        "_media-type": "application\/vnd.ez.api.LocationList+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/61\/locations"
                                    },
                                    "Owner": {
                                        "_media-type": "application\/vnd.ez.api.User+json",
                                        "_href": "\/api\/ezp\/v2\/user\/users\/14"
                                    },
                                    "lastModificationDate": "2016-01-15T14:38:45+01:00",
                                    "publishedDate": "2016-01-15T14:38:45+01:00",
                                    "mainLanguageCode": "eng-GB",
                                    "alwaysAvailable": true,
                                    "ObjectStates": {
                                        "_media-type": "application\/vnd.ez.api.ContentObjectStates+json",
                                        "_href": "\/api\/ezp\/v2\/content\/objects\/61\/objectstates"
                                    }
                                }
                            }
                        }
                    ]
                }
            }};

            this.contentInfoMock = new Mock();
            Mock.expect(this.contentInfoMock, {
                method: "get",
                args: ["resources"],
                returns: {ContentType: "Tajine"}
            });

            this.contentServiceMock = new Mock();
            Mock.expect(this.contentServiceMock, {
                method: "loadTrashItems",
                args: [-1, 0, Mock.Value.Function],
                run: Y.bind(function (limit, offset, callback) {
                    callback(false, this.trashResponse);
                }, this),
            });

            this.apiCallback = function (options, callback) {
                Assert.isNotNull(options.api, "API should be available in options");
                callback();
            };

            this.apiCallbackError = function (options, callback) {
                Assert.isNotNull(options.api, "API should be available in options");
                callback(true);
            };

            this.contentTypeModelConstructor = function () {};
            this.contentTypeModelConstructor.prototype.set = function () {};
            this.contentTypeModelConstructor.prototype.load = this.apiCallback;

            this.locationModelConstructor = function () {};
            this.locationModelConstructor.prototype.set = function () {};
            this.locationModelConstructor.prototype.load = this.apiCallback;
            this.locationModelConstructor.prototype.loadPath = this.apiCallback;

            this.trashItemModelConstructor = function () {};
            this.trashItemModelConstructor.prototype.get = Y.bind(function () {
                return this.contentInfoMock;
            },this);
            this.trashItemModelConstructor.prototype.loadFromHash = function (hash) {
                Assert.isObject(hash, "Hash should be an object");
            };

            this.capiMock = new Mock();
            Mock.expect(this.capiMock, {
                method: "getContentService",
                args: [],
                returns: this.contentServiceMock,
            });

            this.service = new Y.eZ.TrashViewService({
                capi: this.capiMock,
                contentTypeModelConstructor: this.contentTypeModelConstructor,
                locationModelConstructor: this.locationModelConstructor,
                trashItemModelConstructor: this.trashItemModelConstructor,
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should load the trashItems": function () {
            var nbParentNotInTrash = 0;

            this.locationModelConstructor.prototype.load = function( options, callback ) {
                Assert.isNotNull(options.api, "API should be available in options");
                nbParentNotInTrash++;
                callback();
            };

            this.service.load(function(){});

            Assert.areSame(
                9,
                this.service._getViewParameters().trashItems.length,
                "TrashItems should contain 9 items"
            );

            Y.Array.each(this.service.get('trashItems'), Y.bind(function (item){
                this._assertTrashItem(item);
            },this));

            Assert.areSame(
                5,
                nbParentNotInTrash,
                "5 items have parents not in trash"
            );
        },

        _assertTrashItem: function (item) {
            Assert.isInstanceOf(
                this.trashItemModelConstructor,
                item.item,
                'Item should contain a trashItem'
            );
            Assert.isInstanceOf(
                this.locationModelConstructor,
                item.parentLocation,
                'Item should contain a parent location'
            );
            Assert.isInstanceOf(
                this.contentTypeModelConstructor,
                item.contentType,
                'Item should contain a contentType'
            );
        },

        "Should error on loading trashItems": function () {
            Mock.expect(this.contentServiceMock, {
                method: "loadTrashItems",
                args: [-1, 0, Mock.Value.Function],
                run: Y.bind(function (limit, offset, callback) {
                    callback(true, this.trashResponse);
                }, this),
            });

            this.service.load(function(){});

            Assert.areSame(
                0,
                this.service.get('trashItems').length,
                "TrashItems should be empty"
            );
        },

        _testItemsLoadError: function () {
            var errorFired = false;

            this.service.on('error', function () {
                errorFired = true;
            });

            this.service.load(function(){});

            Assert.isTrue(
                errorFired,
                "An error should have been fired"
            );
        },

        _testItemsNoLoadError: function () {
            var errorFired = false;

            this.service.on('error', function () {
                errorFired = true;
            });

            this.service.load(function(){});

            Assert.isFalse(
                errorFired,
                "An error should not have been fired"
            );
        },

        "Should error on loading contentType": function () {
            this.contentTypeModelConstructor.prototype.load = this.apiCallbackError;
            this._testItemsLoadError();
        },

        "Should not error on loading parent location": function () {
            this.locationModelConstructor.prototype.load = this.apiCallbackError;
            this._testItemsNoLoadError();
        },

        "Should error on loading parent location path": function () {
            this.locationModelConstructor.prototype.loadPath = this.apiCallbackError;
            this._testItemsLoadError();
        },
    });

    emptyTrashButtonTest = new Y.Test.Case({
        name: "eZ Trash View Service empty trash button tests",

        setUp: function () {
            this.app = new Mock();
            this.capi = new Mock();

            this.contentServiceMock = new Mock();
            Mock.expect(this.contentServiceMock, {
                method: "emptyTrash",
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback();
                },
            });

            this.capiMock = new Mock();
            Mock.expect(this.capiMock, {
                method: "getContentService",
                args: [],
                returns: this.contentServiceMock,
            });

            this.service = new Y.eZ.TrashViewService({
                app: this.app,
                capi: this.capiMock,
                trashItems: [1, 2, 3],
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        "Should fire the confirBoxOpen event": function () {
            var confirmBoxOpenEvent = false;

            this.service.on('confirmBoxOpen', function (e) {
                confirmBoxOpenEvent = true;
                Assert.isObject(e.config, "The event facade should contain a config object");
                Assert.isString(e.config.title, "The title should be defined");
                Assert.isFunction(e.config.confirmHandler, "A confirmHandler should be provided");
            });

            this.service.fire('whatever:emptyTrashAction', {content: {}});
            Assert.isTrue(confirmBoxOpenEvent, "The confirmBoxOpen event should have been fired");
        },

        "Should notify the user when starting empty trash": function () {
            var notified = false;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "started", e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a string"
                );
                Assert.areSame(
                    'empty-trash',
                    e.notification.identifier,
                    "The notification identifier should be empty-trash"
                );
                Assert.areSame(
                    0, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.service.fire('whatever:emptyTrashAction');
            Assert.isTrue(notified, "The notified event should have been fired");
        },

        "Should not fire event and notify user about error when emptying the trash failed": function () {
            var notified = false,
                eventFired = false;

            Mock.expect(this.contentServiceMock, {
                method: "emptyTrash",
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback(true);
                },
            });

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "error", e.notification.state,
                        "The notification state should be 'error'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.areSame(
                        'empty-trash',
                        e.notification.identifier,
                        "The notification identifier should be empty-trash"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.once('refreshView', function (e) {
                eventFired = true;
            });

            this.service.fire('whatever:emptyTrashAction');
            Assert.isTrue(notified, "The notified event should have been fired");
            Assert.isFalse(eventFired, "The refreshView event should NOT have been fired");
        },

        "Should send the refreshView event and notify user about success of sending content to trash": function () {
            var notified = false,
                eventFired = false;

            this.service.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.apply(this);
            });

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.isTrue(
                        e.notification.text.indexOf("3") !== -1,
                        "The notification text should contain the number of items"
                    );
                    Assert.areSame(
                        'empty-trash',
                        e.notification.identifier,
                        "The notification identifier should be empty-trash"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.once('refreshView', function (e) {
                eventFired = true;
            });

            this.service.fire('whatever:emptyTrashAction');
            Assert.isTrue(notified, "The notified event should have been fired");
            Assert.isTrue(eventFired, "The refreshView event should have been fired");
        },
    });

    restoreItemsTest = new Y.Test.Case({
        name: "eZ Trash View Service restore trash items tests",

        setUp: function () {
            this.app = new Mock();
            this.capi = new Mock();
            this.restoreCalled = false;

            this.contentServiceMock = new Mock();
            Mock.expect(this.contentServiceMock, {
                method: "emptyTrash",
                args: [Mock.Value.Function],
                run: function (callback) {
                    callback();
                },
            });

            this.capiMock = new Mock();
            Mock.expect(this.capiMock, {
                method: "getContentService",
                args: [],
                returns: this.contentServiceMock,
            });

            this.service = new Y.eZ.TrashViewService({
                app: this.app,
                capi: this.capiMock,
                trashItems: [1, 2, 3],
            });
        },

        tearDown: function () {
            this.service.destroy();
            delete this.service;
        },

        _createTrashItem: function (id, error) {
            var item = new Mock();

            Mock.expect(item, {
                method: "restore",
                args: [Mock.Value.Object, Mock.Value.Function],
                run: Y.bind(function (loadOptions, callback) {
                    callback(error);
                    this.restoreCalled = true;
                }, this),
            });

            Mock.expect(item, {
                method: "get",
                args: ["id"],
                returns: id,
            });

            return item;
        },

        "Should notify user when restoring starts": function () {
            var notified = false;

            this.service.once('notify', function (e) {
                notified = true;

                Assert.isObject(e.notification, "The event facade should provide a notification config");
                Assert.areEqual(
                    "started",
                    e.notification.state,
                    "The notification state should be 'started'"
                );
                Assert.isString(
                    e.notification.text,
                    "The notification text should be a string"
                );
                Assert.areSame(
                    'restoreTrashItems',
                    e.notification.identifier,
                    "The notification identifier should be restoreTrashItems"
                );
                Assert.areSame(
                    5, e.notification.timeout,
                    "The notification timeout should be set to 0"
                );
            });

            this.service.fire(
                'whatever:restoreItems',
                {trashItems: [
                    this._createTrashItem(42, false),
                ]}
            );

            Assert.isTrue(notified, "The notified event should have been fired");
            Assert.isTrue(this.restoreCalled, "The restore method should have been called");
        },

        "Should notify user about error when restoring an item failed": function () {
            var notified = false,
                eventFired = false,
                id = 42;

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "error", e.notification.state,
                        "The notification state should be 'error'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.areSame(
                        'restoreTrashItems-error-' + id,
                        e.notification.identifier,
                        "The notification identifier should be restoreTrashItems-error"
                    );
                    Assert.areSame(
                        0, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.once('refreshView', function (e) {
                eventFired = true;
            });

            this.service.fire(
                'whatever:restoreItems',
                {trashItems: [
                    this._createTrashItem(42, true),
                ]}
            );

            Assert.isTrue(notified, "The notified event should have been fired");
            Assert.isTrue(this.restoreCalled, "The restore method should have been called");
            Assert.isFalse(eventFired, "The refreshView event should not be called");
        },


        "Should send the refreshView event and notify user about success of restoring trash item": function () {
            var notified = false,
                eventFired = false,
                id = "1";

            this.service.once('notify', function (e) {
                this.once('notify', function (e) {
                    notified = true;

                    Assert.isObject(e.notification, "The event facade should provide a notification config");
                    Assert.areEqual(
                        "done", e.notification.state,
                        "The notification state should be 'done'"
                    );
                    Assert.isString(
                        e.notification.text,
                        "The notification text should be a string"
                    );
                    Assert.isTrue(
                        e.notification.text.indexOf("1") !== -1,
                        "The notification text should contain the number of restored items"
                    );
                    Assert.areSame(
                        'restoreTrashItems',
                        e.notification.identifier,
                        "The notification identifier should be restoreTrashItems"
                    );
                    Assert.areSame(
                        5, e.notification.timeout,
                        "The notification timeout should be set to 0"
                    );
                });
            });

            this.service.once('refreshView', function (e) {
                eventFired = true;
            });

            this.service.fire(
                'whatever:restoreItems',
                {trashItems: [
                    this._createTrashItem(id, false),
                ]}
            );

            Assert.isTrue(notified, "The notified event should have been fired");
            Assert.isTrue(eventFired, "The refreshView event should have been fired");
            Assert.isTrue(this.restoreCalled, "The restore method should have been called");
        },

        "Should fire a `restoreTrashItems` event per restored item": function () {
            var item1 = this._createTrashItem(1, false),
                item2 = this._createTrashItem(2, false),
                item3 = this._createTrashItem(3, true),
                successItems = [item1, item2],
                restoredLocationCount = 0;

            this.service.on('restoredLocation', function (e) {
                Assert.areSame(
                    successItems[restoredLocationCount], e.trashItem,
                    "The restored trash item should be provided"
                );
                restoredLocationCount++;
            });

            this.service.fire('whatever:restoreItems', {
                trashItems: successItems.concat(item3),
            });

            Assert.areEqual(
                successItems.length, restoredLocationCount,
                "The restoredLocation event should have been fired for each restored trash item"
            );
        },

    });


    Y.Test.Runner.setName("eZ Trash View Service tests");
    Y.Test.Runner.add(serviceTest);
    Y.Test.Runner.add(emptyTrashButtonTest);
    Y.Test.Runner.add(restoreItemsTest);

}, '', {requires: ['test', 'ez-trashviewservice']});
