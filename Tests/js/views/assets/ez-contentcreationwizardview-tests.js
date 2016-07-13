/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-contentcreationwizardview-tests', function (Y) {
    var renderTest, closeTest, contentTypeGroupsSetterTest, selectorViewTest,
        selectedContentTypeTest, activeChangeTest, stepTest, udwTest,
        selectedParentLocationTest,
        Assert = Y.Assert;

    renderTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View render test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                contentTypeSelectorView: new Y.View(),
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should use a template": function () {
            var templateCalled = false,
                origTpl;

            origTpl = this.view.template;
            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(templateCalled, "The template should have used to render the view");
        },
    });

    closeTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View close button test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                container: '.container',
                contentTypeSelectorView: new Y.View(),
            });
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the `contentCreationWizardClose` event": function () {
            var container = this.view.get('container');

            this.view.on('contentCreationWizardClose', this.next(function () {}, this));
            container.one('.ez-contentcreationwizard-close').simulateGesture('tap');
            this.wait();
        },
    });

    contentTypeGroupsSetterTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View contentTypeGroups setter test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                contentTypeSelectorView: new Y.View(),
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should pass the contentTypeGroups to the selector view": function () {
            var groups = {};

            this.view.set('contentTypeGroups', groups);

            Assert.areSame(
                groups,
                this.view.get('contentTypeSelectorView').get('contentTypeGroups'),
                "The selector view should have received the content type groups"
            );
        },
    });

    selectorViewTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View content type selector view test",

        setUp: function () {
            Y.eZ.ContentTypeSelectorView = Y.View;
            this.view = new Y.eZ.ContentCreationWizardView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
            delete Y.eZ.ContentTypeSelectorView;
        },

        "Should receive the configuration": function () {
            Assert.areSame(
                this.view.get('config'),
                this.view.get('contentTypeSelectorView').get('config'),
                "The selector view should have received the config"
            );
        },

        "Should be configure to fire a `selectedContentType` event": function () {
            Assert.areEqual(
                'selectedContentType',
                this.view.get('contentTypeSelectorView').get('selectedContentTypeEvent'),
                "The selector content type view should be configured to fire a `selectedContentType`"
            );
        },

        "Should set the wizard view as a bubble target": function () {
            var eventFired = false,
                eventName = 'whateverEvent';

            this.view.on('*:' + eventName, function (e) {
                eventFired = true;

                Assert.areSame(
                    this.get('contentTypeSelectorView'),
                    e.target,
                    "The event should come from the selector view"
                );
            });
            this.view.get('contentTypeSelectorView').fire(eventName);

            Assert.isTrue(
                eventFired,
                "The view should be set as a bubble target of the selector view"
            );
        },
    });

    selectedContentTypeTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View selectedContentType test",

        setUp: function () {
            this.selectorView = new Y.View();
            this.view = new Y.eZ.ContentCreationWizardView({
                contentTypeSelectorView: this.selectorView,
            });
            this.selectorView.addTarget(this.view);
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should store the selected Content Type": function () {
            var type = {};

            this.selectorView.fire('selectedContentType', {
                contentType: type,
            });

            Assert.areSame(
                type,
                this.view.get('selectedContentType'),
                "The selected Content Type should be stored in the view"
            );
        },

        _getNextButton: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-next');
        },

        "Should enable the next button": function () {
            this["Should store the selected Content Type"]();

            Assert.isFalse(
                this._getNextButton().get('disabled'),
                "The next button should be enabled"
            );
        },

        "Should disable the next button": function () {
            this["Should store the selected Content Type"]();
            this.view._set('selectedContentType', null);

            Assert.isTrue(
                this._getNextButton().get('disabled'),
                "The next button should be disabled"
            );
        },
    });

    activeChangeTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View activeChange test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                contentTypeSelectorView: new Y.View(),
            });
            this.view.render();
            this.contentName = 'Saint-Paul-de-Varax';
            this.locationId = '/st/paul/de/varax';
            this.location = new Y.Base();
            this.contentInfo = new Y.Base();
            this.contentInfo.set('name', this.contentName);
            this.location.set('id', this.locationId);
            this.location.set('contentInfo', this.contentInfo);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should render the selector view when getting active": function () {
            var selectorContainer = this.view.get('container').one('.ez-contenttypeselector-container');

            this.view.set('active', true);

            Assert.areEqual(
                1, selectorContainer.get('children').size(),
                "The selector view should have been rendered in its container"
            );
        },

        "Should reset the view state when getting inactive": function () {
            this.view.set('contentTypeGroups', {});
            this.view.set('active', true);
            this.view._set('step', 'whatever');
            this.view._set('selectedContentType', {});
            this.view._set('selectedParentLocation', this.location);
            this.view.set('active', false);

            Assert.isNull(
                this.view.get('selectedContentType'),
                "The selected Content Type should be null"
            );
            Assert.isNull(
                this.view.get('selectedParentLocation'),
                "The selected Location should be null"
            );
            Assert.isUndefined(
                this.view.get('step'),
                "The step should be resetted to 'contenttype'"
            );
            Assert.isNull(
                this.view.get('contentTypeGroups'),
                "The contentTypeGroups attribute should be null"
            );
        },
    });

    stepTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View step test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                container: '.container',
                contentTypeSelectorView: new Y.View(),
            });
            this.view.render();
            this.view.set('active', true);
            this.contentTypeName = 'Quatrouilles';
            this.contentType = new Y.Base();
            this.contentType.set('names', {'fre-FR': this.contentTypeName});
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getNextButton: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-next');
        },

        _getBackButton: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-back');
        },

        _getContentTypeNameNode: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-contenttype-name');
        },

        _assertStep: function (identifier) {
            Assert.areEqual(
                identifier, this.view.get('step'),
                "The step should be '" + identifier + "'"
            );
            Assert.isTrue(
                this.view.get('container').hasClass('is-step-' + identifier),
                "The container should have the " + identifier + " step class"
            );
        },

        "Should set the step to contenttype": function () {
            this._assertStep('contenttype');
        },

        "Should move to the location step": function () {
            this.view._set('selectedContentType', this.contentType);

            this._getNextButton().simulateGesture('tap', this.next(function () {
                this._assertStep('location');
                Assert.areEqual(
                    this.contentTypeName,
                    this._getContentTypeNameNode().getContent(),
                    "The Content Type name should be displayed in its node"
                );
            }, this));
            this.wait();
        },

        "Should move back to the contenttype step": function () {
            this.view._set('selectedContentType', this.contentType);
            this.view._set('step', 'location');

            this._getBackButton().simulateGesture('tap', this.next(function () {
                this._assertStep('contenttype');
                Assert.areEqual(
                    "", this._getContentTypeNameNode().getContent(),
                    "The Content Type name should be empty"
                );
            }, this));
            this.wait();
        },

        "Should move back the contenttype step when clicking on the content type name": function () {
            this.view._set('selectedContentType', this.contentType);
            this.view._set('step', 'location');

            this._getContentTypeNameNode().simulateGesture('tap', this.next(function () {
                this._assertStep('contenttype');
                Assert.areEqual(
                    "", this._getContentTypeNameNode().getContent(),
                    "The Content Type name should be empty"
                );
            }, this));
            this.wait();
        },
    });

    udwTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View UDW test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                container: '.container',
                contentTypeSelectorView: new Y.View(),
            });
            this.view.render();
            this.contentName = 'Saint-Paul-de-Varax';
            this.locationId = '/st/paul/de/varax';
            this.location = new Y.Base();
            this.contentInfo = new Y.Base();
            this.contentInfo.set('name', this.contentName);
            this.location.set('id', this.locationId);
            this.location.set('contentInfo', this.contentInfo);
        },

        tearDown: function () {
            this.view.destroy();
            this.location.destroy();
            this.contentInfo.destroy();
            delete this.view;
            delete this.location;
            delete this.contentInfo;
        },

        _getPickLocationButton: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-pick-location');
        },

        "Should run the Universal Discovery Widget": function () {
            this.view.on('contentDiscover', this.next(function (e) {
                var config = e.config;

                Assert.isString(
                    config.title,
                    "The title should be defined"
                );
                Assert.isFalse(
                    config.startingLocationId,
                    "The startingLocationId should be false"
                );

            }, this));
            this._getPickLocationButton().simulateGesture('tap');
            this.wait();
        },

        "Should run the Universal Discovery Widget at the starting Location": function () {
            this.view._set('selectedParentLocation', this.location);
            this.view.on('contentDiscover', this.next(function (e) {
                var config = e.config;

                Assert.areEqual(
                    this.locationId,
                    config.startingLocationId,
                    "The startingLocationId should be set with the previously chosen Location id"
                );
            }, this));
            this._getPickLocationButton().simulateGesture('tap');
            this.wait();
        },

        "Should allow only container Content to be selected": function () {
            var containerContentType = new Y.Base(),
                nonContainerContentType = new Y.Base();

            containerContentType.set('isContainer', true);
            nonContainerContentType.set('isContainer', false);

            this.view.on('contentDiscover', this.next(function (e) {
                var isSelectable = e.config.isSelectable;

                Assert.isFalse(
                    isSelectable({contentType: nonContainerContentType}),
                    "non container Content should not be selectable"
                );
                Assert.isTrue(
                    isSelectable({contentType: containerContentType}),
                    "container Content should be selectable"
                );
            }, this));
            this._getPickLocationButton().simulateGesture('tap');
            this.wait();
        },

        "Should store the Location in the selectedParentLocation attribute": function () {
            this.view.on('contentDiscover', this.next(function (e) {
                var config = e.config;

                config.contentDiscoveredHandler({selection: {location: this.location}});

                Assert.areSame(
                    this.location,
                    this.view.get('selectedParentLocation'),
                    "The selected Location should be stored in the selectedParentLocation attribute"
                );
            }, this));
            this._getPickLocationButton().simulateGesture('tap');
            this.wait();
        },
    });

    selectedParentLocationTest = new Y.Test.Case({
        name: "eZ Content Creation Wizard View selectedParentLocation test",

        setUp: function () {
            this.view = new Y.eZ.ContentCreationWizardView({
                contentTypeSelectorView: new Y.View(),
            });
            this.view.render();
            this.contentName = 'Saint-Paul-de-Varax';
            this.locationId = '/st/paul/de/varax';
            this.location = new Y.Base();
            this.contentInfo = new Y.Base();
            this.contentInfo.set('name', this.contentName);
            this.location.set('id', this.locationId);
            this.location.set('contentInfo', this.contentInfo);
            this.contentType = new Y.Base();
            this.contentType.set('names', {'fre-FR': 'Village'});
        },

        tearDown: function () {
            this.view.destroy();
            this.location.destroy();
            this.contentInfo.destroy();
            this.contentType.destroy();
            delete this.view;
            delete this.location;
            delete this.contentInfo;
            delete this.contentType;
        },

        _getContentNameNode: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-content-name');
        },

        _getFinishButton: function () {
            return this.view.get('container').one('.ez-contentcreationwizard-finish');
        },

        "Should add the Location chosen class": function () {
            this.view._set('selectedParentLocation', this.location);

            Assert.isTrue(
                this.view.get('container').hasClass('is-location-chosen'),
                "The Location chosen class should have been added"
            );
        },

        "Should remove the Location chosen class": function () {
            this["Should add the Location chosen class"]();
            this.view._set('selectedParentLocation', null);

            Assert.isFalse(
                this.view.get('container').hasClass('is-location-chosen'),
                "The Location chosen class should have been remove"
            );
        },

        "Should add the Content name": function () {
            this.view._set('selectedParentLocation', this.location);

            Assert.areEqual(
                this.contentName,
                this._getContentNameNode().getContent(),
                "The Content name should be displayed"
            );
        },

        "Should remove the Content name": function () {
            this["Should add the Content name"]();
            this.view._set('selectedParentLocation', null);

            Assert.areEqual(
                "",
                this._getContentNameNode().getContent(),
                "The Content name should be removed"
            );
        },

        "Should enable the finish button": function () {
            this.view._set('selectedContentType', this.contentType);
            this.view._set('selectedParentLocation', this.location);

            Assert.isFalse(
                this._getFinishButton().get('disabled'),
                "The finish button should be enabled"
            );
        },

        "Should disabled the finish button": function () {
            this["Should enable the finish button"]();
            this.view._set('selectedParentLocation', null);

            Assert.isTrue(
                this._getFinishButton().get('disabled'),
                "The finish button should be disabled"
            );
        },
    });

    Y.Test.Runner.setName("eZ Content Creation Wizard View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(closeTest);
    Y.Test.Runner.add(contentTypeGroupsSetterTest);
    Y.Test.Runner.add(selectorViewTest);
    Y.Test.Runner.add(selectedContentTypeTest);
    Y.Test.Runner.add(activeChangeTest);
    Y.Test.Runner.add(stepTest);
    Y.Test.Runner.add(udwTest);
    Y.Test.Runner.add(selectedParentLocationTest);
}, '', {requires: ['test', 'base', 'node-event-simulate', 'ez-contentcreationwizardview']});
