/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-processable-tests', function (Y) {
    var addProcessorTest, removeProcessorTest, processorTest,
        processEvent = 'whateverEvent',
        TestView = Y.Base.create('testView', Y.View, [Y.eZ.Processable], {
            initializer: function () {
                this._processEvent = processEvent;
            },
        }),
        Assert = Y.Assert, Mock = Y.Mock;

    addProcessorTest = new Y.Test.Case({
        name: "eZ Processable extension addProcessor tests",

        setUp: function () {
            this.view = new TestView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getProcessor: function () {
            var processor = new Mock();

            Mock.expect(processor, {
                method: 'process',
            });
            return processor;
        },

        "Should add the processor to the list": function () {
            var processor = this._getProcessor(),
                priority = 10,
                list;

            this.view.addProcessor(processor, priority);

            list = this.view.get('processors');

            Assert.isArray(list, "The list should be an array");
            Assert.areEqual(1, list.length, "The list should have one entry");
            Assert.areEqual(
                list[0].priority, priority,
                "The priority should be stored"
            );
            Assert.areSame(
                list[0].processor, processor,
                "The processor should have been added to the list"
            );
        },

        "Should keep the list sorted by priority": function () {
            var processor1 = this._getProcessor(),
                processor2 = this._getProcessor(),
                list;

            this.view.addProcessor(processor1, 10);
            this.view.addProcessor(processor2, 250);

            list = this.view.get('processors');

            Assert.areEqual(2, list.length, "The list should have 2 entries");
            Assert.areSame(
                list[0].processor, processor2,
                "The processors should sorted by priority"
            );
            Assert.areSame(
                list[1].processor, processor1,
                "The processors should sorted by priority"
            );
        },

        _should: {
            error: {
                "Should throw if the processor is not valid": "Processor must have a process method",
            }
        },

        "Should throw if the processor is not valid": function () {
            this.view.addProcessor({});
        },
    });

    removeProcessorTest = new Y.Test.Case({
        name: "eZ Processable extension removeProcessor tests",

        setUp: function () {
            this.view = new TestView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getProcessor: function () {
            var processor = new Mock();

            Mock.expect(processor, {
                method: 'process',
            });
            return processor;
        },

        "Should remove the matching processor": function () {
            var processor1 = this._getProcessor(),
                processor2 = this._getProcessor(),
                list;

            this.view.addProcessor(processor1, 10);
            this.view.addProcessor(processor2, 250);

            this.view.removeProcessor(function (info) {
                return info.processor === processor1;
            });

            list = this.view.get('processors');
            Assert.areEqual(1, list.length, "The list should have 1 entry");
            Assert.areSame(
                list[0].processor, processor2,
                "The processors should sorted by priority"
            );
        },
    });

    processorTest = new Y.Test.Case({
        name: "eZ Processable extension removeProcessor tests",

        setUp: function () {
            this.view = new TestView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getProcessor: function (eventParams) {
            var processor = new Mock();

            Mock.expect(processor, {
                method: 'process',
                args: [this.view, Mock.Value.Object],
                run: function (view, eventFacade) {
                    Assert.areSame(
                        eventParams.processParam,
                        eventFacade.processParam,
                        "The initial event facade property should be passed to the processors"
                    );
                },
            });
            return processor;
        },

        "Should execute the processors": function () {
            var eventParams = {processParam: {}},
                processor1 = this._getProcessor(eventParams),
                processor2 = this._getProcessor(eventParams);

            this.view.addProcessor(processor1, 10);
            this.view.addProcessor(processor2, 250);
            this.view.fire(processEvent, eventParams);

            Mock.verify(processor1);
            Mock.verify(processor2);
        },
    });

    Y.Test.Runner.setName("eZ Processable extension tests");
    Y.Test.Runner.add(addProcessorTest);
    Y.Test.Runner.add(removeProcessorTest);
    Y.Test.Runner.add(processorTest);
}, '', {requires: ['test', 'ez-processable']});
