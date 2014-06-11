YUI.add('ez-mycontentblockview-tests', function (Y) {
    var viewTest,
        draftSample = {
            "Version": {
                "_media-type": "application/vnd.ez.api.Version+json",
                "_href": "/api/ezp/v2/content/objects/109/versions/2"
            },
            "VersionInfo": {
                "id": 568,
                "versionNo": 2,
                "status": "DRAFT",
                "modificationDate": "2014-06-03T13:40:34+02:00",
                "Creator": {
                    "_media-type": "application/vnd.ez.api.User+json",
                    "_href": "/api/ezp/v2/user/users/14"
                },
                "creationDate": "2014-06-03T13:30:14+02:00",
                "initialLanguageCode": "eng-GB",
                "languageCodes": "eng-GB",
                "names": {
                    "value": [{
                        "_languageCode": "eng-GB",
                        "#text": "Mount Fuji"
                    }]
                },
                "Content": {
                    "_media-type": "application/vnd.ez.api.ContentInfo+json",
                    "_href": "/api/ezp/v2/content/objects/109"
                }
            }
        };

    viewTest = new Y.Test.Case({
        name : 'eZ My Content Block view tests',
        setUp : function () {
            this.view = new Y.eZ.MyContentBlockView();
        },
        tearDown : function () {
            this.view.destroy();
            delete this.view;
        },

        'Testing render() method' : function () {
            var templateCalled = false,
                originalTemplate;

            originalTemplate = this.view.template;

            this.view.template = function () {
                templateCalled = true;

                return originalTemplate.apply(this, arguments);
            };

            this.view.render();

            Y.Assert.isTrue(templateCalled, 'The template() method was used to generate the view layout');
            Y.Assert.areNotEqual('', this.view.get('container').getHTML(), 'The view container should contain the view output');
        },

        'Testing _renderDrafts() method without drafts available' : function () {
            this.view.render();
            this.view._renderDrafts();

            Y.Assert.isNotNull(this.view.get('container').one('.header .title > span').getHTML());
            Y.Assert.areEqual(
                0,
                this.view.get('container').one('.header .title > span').getHTML(),
                'The value of indicator of drafts number is equal to 0'
            );
            Y.Assert.areEqual(
                1,
                this.view.get('container').one('.tab-content[data-tab="drafts"]').all('tbody').size(),
                'The table body element is available'
            );
            Y.Assert.areEqual(
                0,
                this.view.get('container').one('.tab-content[data-tab="drafts"]').all('tbody > tr').size(),
                'The table has no rows inside'
            );
        },

        'Testing _renderDrafts() method with drafts available' : function () {
            this.view.render();
            this.view.get('draftsList').add(draftSample);
            this.view._renderDrafts();

            Y.Assert.isNotNull(this.view.get('container').one('.header .title > span').getHTML());
            Y.Assert.areEqual(
                1,
                this.view.get('draftsList').size(),
                'The number of drafts is equal to 1'
            );
            Y.Assert.areEqual(
                1,
                this.view.get('container').one('.header .title > span').getHTML(),
                'The value of indicator of drafts number is equal to 1'
            );
            Y.Assert.areEqual(
                1,
                this.view.get('container').one('.tab-content[data-tab="drafts"]').all('tbody').size(),
                'The table body element is available'
            );
            Y.Assert.areEqual(
                1,
                this.view.get('container').one('.tab-content[data-tab="drafts"]').all('tbody > tr').size(),
                'The table has 1 row inside'
            );
        }
    });

    Y.Test.Runner.setName('eZ My Content Block View tests');
    Y.Test.Runner.add(viewTest);
}, '0.3.1', { requires : ['test', 'ez-mycontentblockview'] });