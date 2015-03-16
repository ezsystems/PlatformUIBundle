/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-selectionfilterview-tests', function (Y) {
    var viewTest, filterDisabledTest, preselectedTest,
        multipleSelectTest, multipleUnselectTest, sourceValidationTest,
        objectSourceTest, sourceChangeTest,
        source = ['Iron Man', 'Hulk', 'Captain America', 'Thor', 'Black Widow', 'Hawkeye', 'Loki', 'Nick Fury'];

    viewTest = new Y.Test.Case({
        name: "eZ Selection Filter View test",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '#input-selection-filter',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _assertDefaultList: function () {
            var items = this.view.get('listNode').all(this.view.ITEM_TAG);

            Y.Assert.areEqual(
                source.length, items.size(),
                "The list should contain as many items as in the source"
            );

            Y.Array.each(source, function (val) {
                var item = this.view.get('listNode').one('[data-text="' + val + '"]');
                Y.Assert.isObject(item, "The item for '" + val + "' is missing");
                Y.Assert.areEqual(
                    val, item.getContent()
                );
            }, this);
        },

        "render should display the list of options": function () {
            this.view.render();
            this._assertDefaultList();
        },

        "destroy() test": function () {
            this.view.render();
            this.view.destroy();

            Y.Assert.areEqual(
                this.initialDOM, this.view.get('container').get('innerHTML'),
                "The DOM should be restored to its initial state after destroy"
            );
        },

        "focus() test": function () {
            this.view.render();

            this.view.focus();
            Y.Assert.areSame(
                Y.config.doc.activeElement, this.view.get('inputNode').getDOMNode(),
                "The input node should get the focus"
            );
        },

        "resetFilter() test": function () {
            var inputNode = this.view.get('inputNode'),
                that = this;

            this.view.render();
            this.view.after('results', function () {
                that.resume(function () {
                    this.view.resetFilter();

                    Y.Assert.areEqual(
                        "", inputNode.get('value'),
                        "The filter input should be empty"
                    );
                    this._assertDefaultList();
                });
            });
            inputNode.simulate('mousedown');
            inputNode.set('value', 'Hulk');
            this.wait();
        },

        "clear event handler should restore the default list": function () {
            var inputNode = this.view.get('inputNode'),
                that = this;

            this.view.render();
            this.view.after('results', function () {
                that.resume(function () {
                    this.view.after('clear', function () {
                        that._assertDefaultList();
                    });
                    this.view.fire('clear');
                });
            });
            inputNode.simulate('mousedown');
            inputNode.set('value', 'Hulk');
            this.wait();
        },

        "mouseover/mouseout an item": function () {
            var listNode = this.view.get('listNode'), item;

            this.view.render();

            item = listNode.one('li[data-text=Loki]');
            item.simulate('mouseover');
            Y.Assert.isTrue(
                item.hasClass('ez-selection-filter-item-active'),
                "The item should have the active class"
            );
            item.simulate('mouseout');
            Y.Assert.isFalse(
                item.hasClass('ez-selection-filter-item-active'),
                "The item should not have the active class"
            );
        },

        "select an item": function () {
            var listNode = this.view.get('listNode'), item,
                choice = 'Black Widow',
                selectEvt = false,
                that = this;

            this.view.render();

            item = listNode.one('li[data-text="' + choice + '"]');
            this.view.on('select', function (e) {
                selectEvt = true;

                Y.Assert.areEqual(
                    choice, e.text,
                    "The event facade should contain the selected value"
                );
                Y.Assert.areSame(
                    item, e.elementNode,
                    "The event facade should contain the selected item node"
                );
            });

            item.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        1, this.view.get('selected').length,
                        "The selected attribute should contain one choice"
                    );
                    Y.Assert.areEqual(
                        choice, this.view.get('selected')[0],
                        "The selected attribute should contain '" + choice + "'"
                    );
                    Y.Assert.isTrue(
                        item.hasClass('ez-selection-filter-item-selected'),
                        "The item should have the selected class"
                    );

                    Y.Assert.isTrue(selectEvt, "The select event should have been fired");

                });
            });
            this.wait();
        },

        "select another item": function () {
            var listNode = this.view.get('listNode'), item, item2,
                choice = 'Black Widow',
                choice2 = 'Iron Man',
                selectEvt = false,
                that = this;

            this.view.render();

            item = listNode.one('li[data-text="' + choice + '"]');
            item2 = listNode.one('li[data-text="' + choice2 + '"]');

            item.simulateGesture('tap', function () {
                that.resume(function () {
                    this.view.on('select', function (e) {
                        selectEvt = true;

                        Y.Assert.areEqual(
                            choice2, e.text,
                            "The event facade should contain the selected value"
                        );
                        Y.Assert.areSame(
                            item2, e.elementNode,
                            "The event facade should contain the selected item node"
                        );
                    });

                    item2.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.areEqual(
                                1, this.view.get('selected').length,
                                "The selected attribute should contain one choice"
                            );
                            Y.Assert.areEqual(
                                choice2, this.view.get('selected')[0],
                                "The selected attribute should contain '" + choice2 + "'"
                            );

                            Y.Assert.isTrue(
                                item2.hasClass('ez-selection-filter-item-selected'),
                                "The item should have the selected class"
                            );
                            Y.Assert.isFalse(
                                item.hasClass('ez-selection-filter-item-selected'),
                                "The previously selected item should not have the selected class"
                            );
                        });
                    });
                    this.wait();
                });
            });
            this.wait();
        },
    });

    filterDisabledTest = new Y.Test.Case({
        name: "eZ Selection Filter View test without filter",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '.container input',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                filter: false,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "The input node should be disabled": function () {
            var inputNode = this.view.get('inputNode');

            this.view.render();
            Y.Assert.isTrue(
                inputNode.get('disabled'),
                "The input node should be disabled"
            );

            Y.Assert.isTrue(
                inputNode.hasClass('ez-selection-filter-off'),
                "The input node should have the 'off' class"
            );
        },

        "focus() test": function () {
            this.view.render();

            this.view.get('container').focus();
            this.view.focus();
            Y.Assert.areNotSame(
                Y.config.doc.activeElement, this.view.get('inputNode').getDOMNode(),
                "The input node should not get the focus"
            );
        },

        "destroy() test": function () {
            this.view.render();
            this.view.destroy();

            Y.Assert.areEqual(
                this.initialDOM, this.view.get('container').get('innerHTML'),
                "The DOM should be restored to its initial state after destroy"
            );
        },
    });

    preselectedTest = new Y.Test.Case({
        name: "eZ Selection Filter View test with a pre selected value",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();
            this.selected = 'Iron Man';

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '.container input',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                selected: [this.selected]
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _assertDefaultList: viewTest._assertDefaultList,

        "selected element should be visually selected": function () {
            var listNode = this.view.get('listNode'),
                item;

            this.view.render();
            item = listNode.one('li[data-text="' + this.selected + '"]');

            Y.Assert.isTrue(
                item.hasClass('ez-selection-filter-item-selected'),
                "The selected element should have the selected class"
            );

        },

        "resetFilter() test": function () {
            this.view.render();
            this.view.resetFilter();
            this._assertDefaultList();
        },
    });

    multipleSelectTest = new Y.Test.Case({
        name: "eZ Selection Filter view test with the multiple flag",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '.container input',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                isMultiple: true,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getItem: function (value) {
            return this.view.get('listNode').one('li[data-text="' + value + '"]');
        },

        "should allow selecting several items": function () {
            var that = this,
                selectEvt = 0, selectEvtValues = [],
                sels = ['Black Widow', 'Hulk', 'Loki'];

            this.view.render();
            this.view.on('select', function (e) {
                selectEvt++;
                selectEvtValues.push(e.text);
            });
            this._getItem(sels[0]).simulateGesture('tap', function () {
                that.resume(function () {
                    this._getItem(sels[1]).simulateGesture('tap', function () {
                        that.resume(function () {
                            this._getItem(sels[2]).simulateGesture('tap', function () {
                                that.resume(function () {
                                    var items = this.view.get('listNode').all('.ez-selection-filter-item-selected');

                                    Y.Assert.areEqual(
                                        sels.length, selectEvt,
                                        "The select event should have been fired " + sels.length + " times"
                                    );
                                    Y.Assert.areEqual(
                                        sels.length, that.view.get('selected').length,
                                        sels.length + " elements should be selected"
                                    );
                                    Y.Array.each(selectEvtValues, function (val, i) {
                                        Y.Assert.areEqual(sels[i], val);
                                    });
                                    items.each(function (item) {
                                        Y.Assert.isTrue(
                                            sels.indexOf(item.getAttribute('data-text')) !== -1,
                                            item.getAttribute('data-text') + " should not be selected"
                                        );
                                        sels = Y.Array.reject(sels, function (val) {
                                            return val === item.getAttribute('data-text');
                                        });
                                    });

                                    Y.Assert.areEqual(
                                        0, sels.length,
                                        "All values were not selected"
                                    );
                                });
                            });
                            this.wait();
                        });
                    });
                    this.wait();
                });
            });
            this.wait();
        },
    });

    multipleUnselectTest = new Y.Test.Case({
        name: "eZ Selection Filter view unselect test with the multiple flag",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '.container input',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                isMultiple: true,
                selected: ['Loki', 'Iron Man']
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "tap on a selected item should unselect it": function () {
            var that = this, listNode = this.view.get('listNode'),
                unselectEvt = false,
                unselect = this.view.get('selected')[0], item;

            this.view.on('unselect', function (e) {
                unselectEvt = true;
                Y.Assert.areEqual(
                    unselect, e.text,
                    "The unselect event facade should contain the unselected text"
                );
            });
            this.view.render();
            item = listNode.one('li[data-text="' + unselect + '"]');
            item.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.isTrue(unselectEvt, "The unselect event should have been fired");
                    Y.Assert.isFalse(
                        item.hasClass('ez-selection-filter-item-selected'),
                        "The item should not have the selected class"
                    );
                });
            });
            this.wait();
        },

        "unselect() test": function () {
            var sel = this.view.get('selected');

            this.view.render();
            Y.Array.each(sel, function (val) {
                this.view.unselect(val);
            }, this);

            Y.Assert.areEqual(
                0, this.view.get('selected'),
                "The selection should be empty"
            );

            Y.Assert.areEqual(
                0, this.view.get('listNode').all('.ez-selection-filter-item-selected').size(),
                "The selection should be empty"
            );
        },

        "unselect() when value is not in the filter options test": function () {
            var sel = ['Loki', 'Iron Man', 'ultron'];

            this.view.render();
            Y.Array.each(sel, function (val) {
                this.view.unselect(val);
            }, this);

            Y.Assert.areEqual(
                0, this.view.get('selected'),
                "The selection should be empty"
            );

            Y.Assert.areEqual(
                0, this.view.get('listNode').all('.ez-selection-filter-item-selected').size(),
                "The selection should be empty"
            );
        },
    });

    sourceValidationTest = new Y.Test.Case({
        name: "eZ Selection Filter view source validation tests",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
        },

        "Should not allow source other than an array": function () {
            var view = new Y.eZ.SelectionFilterView({
                    container: '.container',
                    inputNode: '.container input',
                    listNode: '.container ul',
                    source: "source",
                });

            Y.Assert.areEqual(
                "array", view.get('source').type,
                "the source attribute should be an empty array"
            );
            view.destroy();
        },
    });

    objectSourceTest = new Y.Test.Case({
        name: "eZ Selection Filter view source validation tests",

        setUp: function () {
            var that = this, i = 0;

            this.source = [];
            Y.Array.each(source, function (element) {
                that.source.push({
                    text: element,
                    length: element.length,
                    id: i++,
                });
            });
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this._resultTextLocator = function (elt) {
                return elt.text + "(length: " + elt.length + ")";
            };
            this._resultAttributesFormatter = function (elt) {
                return {
                    text: elt.text,
                    length: elt.length,
                    position: elt.id + 1,
                };
            };
            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '.container input',
                listNode: '.container ul',
                source: this.source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
                resultAttributesFormatter: this._resultAttributesFormatter,
                resultTextLocator: this._resultTextLocator,
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _assertDefaultList: function () {
            var items = this.view.get('listNode').all(this.view.ITEM_TAG);

            Y.Assert.areEqual(
                source.length, items.size(),
                "The list should contain as many items as in the source"
            );

            Y.Array.each(this.source, function (val) {
                var item = this.view.get('listNode').one('[data-text="' + val.text + '"]'),
                    expectedAttrs = this._resultAttributesFormatter(val);

                Y.Assert.isObject(item, "The item for '" + val + "' is missing");
                Y.Assert.areEqual(
                    this._resultTextLocator(val), item.getContent(),
                    "The visible value should be the result of the resultTextLocator function"
                );
                Y.Object.each(expectedAttrs, function (attrValue, key) {
                    Y.Assert.areEqual(
                        attrValue, item.getAttribute('data-' + key),
                        "The item should have a data-" + key + " attribute with the value " + attrValue
                    );
                });
            }, this);
        },

        "render should display the list of options": function () {
            this.view.render();
            this._assertDefaultList();
        },

        "destroy() test": function () {
            this.view.render();
            this.view.destroy();

            Y.Assert.areEqual(
                this.initialDOM, this.view.get('container').get('innerHTML'),
                "The DOM should be restored to its initial state after destroy"
            );
        },

        "focus() test": function () {
            this.view.render();

            this.view.focus();
            Y.Assert.areSame(
                Y.config.doc.activeElement, this.view.get('inputNode').getDOMNode(),
                "The input node should get the focus"
            );
        },

        "resetFilter() test": function () {
            var inputNode = this.view.get('inputNode'),
                that = this;

            this.view.render();
            this.view.after('results', function () {
                that.resume(function () {
                    this.view.resetFilter();

                    Y.Assert.areEqual(
                        "", inputNode.get('value'),
                        "The filter input should be empty"
                    );
                    this._assertDefaultList();
                });
            });
            inputNode.simulate('mousedown');
            inputNode.set('value', 'Hulk');
            this.wait();
        },

        "clear event handler should restore the default list": function () {
            var inputNode = this.view.get('inputNode'),
                that = this;

            this.view.render();
            this.view.after('results', function () {
                that.resume(function () {
                    this.view.after('clear', function () {
                        that._assertDefaultList();
                    });
                    this.view.fire('clear');
                });
            });
            inputNode.simulate('mousedown');
            inputNode.set('value', 'Hulk');
            this.wait();
        },

        "mouseover/mouseout an item": function () {
            var listNode = this.view.get('listNode'), item;

            this.view.render();

            item = listNode.one('li[data-text=Loki]');
            item.simulate('mouseover');
            Y.Assert.isTrue(
                item.hasClass('ez-selection-filter-item-active'),
                "The item should have the active class"
            );
            item.simulate('mouseout');
            Y.Assert.isFalse(
                item.hasClass('ez-selection-filter-item-active'),
                "The item should not have the active class"
            );
        },

        "select an item": function () {
            var listNode = this.view.get('listNode'), item,
                choice = 'Black Widow',
                selectEvt = false,
                that = this;

            this.view.render();

            item = listNode.one('li[data-text="' + choice + '"]');
            this.view.on('select', function (e) {
                selectEvt = true;

                Y.Assert.areEqual(
                    choice, e.text,
                    "The event facade should contain the selected value"
                );
                Y.Assert.areSame(
                    item, e.elementNode,
                    "The event facade should contain the selected item node"
                );
            });

            item.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        1, this.view.get('selected').length,
                        "The selected attribute should contain one choice"
                    );
                    Y.Assert.areEqual(
                        choice, this.view.get('selected')[0],
                        "The selected attribute should contain '" + choice + "'"
                    );
                    Y.Assert.isTrue(
                        item.hasClass('ez-selection-filter-item-selected'),
                        "The item should have the selected class"
                    );

                    Y.Assert.isTrue(selectEvt, "The select event should have been fired");

                });
            });
            this.wait();
        },

        "select another item": function () {
            var listNode = this.view.get('listNode'), item, item2,
                choice = this.source[4],
                choice2 = this.source[0],
                selectEvt = false,
                that = this;

            this.view.render();

            item = listNode.one('li[data-text="' + choice.text + '"]');
            item2 = listNode.one('li[data-text="' + choice2.text + '"]');

            item.simulateGesture('tap', function () {
                that.resume(function () {
                    this.view.on('select', function (e) {
                        var expectedAttributes = that._resultAttributesFormatter(choice2);

                        selectEvt = true;

                        Y.Assert.areEqual(
                            choice2.text, e.text,
                            "The event facade should contain the selected value"
                        );
                        Y.Assert.areSame(
                            item2, e.elementNode,
                            "The event facade should contain the selected item node"
                        );
                        Y.Assert.isObject(
                            e.attributes,
                            "The event facade should provide the attributes of the selected element"
                        );
                        Y.Assert.areEqual(
                            Y.Object.keys(expectedAttributes).length,
                            Y.Object.keys(e.attributes).length,
                            "The event facade should contain the attributes returned by the attributes formater"
                        );
                        Y.Object.each(e.attributes, function (value, key) {
                            Y.Assert.areEqual(
                                expectedAttributes[key], value,
                                "The attribute " + key + " should have the value " + value
                            );
                        });
                    });

                    item2.simulateGesture('tap', function () {
                        that.resume(function () {
                            Y.Assert.areEqual(
                                1, this.view.get('selected').length,
                                "The selected attribute should contain one choice"
                            );
                            Y.Assert.areEqual(
                                choice2.text, this.view.get('selected')[0],
                                "The selected attribute should contain '" + choice2 + "'"
                            );

                            Y.Assert.isTrue(
                                item2.hasClass('ez-selection-filter-item-selected'),
                                "The item should have the selected class"
                            );
                            Y.Assert.isFalse(
                                item.hasClass('ez-selection-filter-item-selected'),
                                "The previously selected item should not have the selected class"
                            );
                        });
                    });
                    this.wait();
                });
            });
            this.wait();
        },
    });

    sourceChangeTest = new Y.Test.Case({
        name: "eZ Selection Filter View test",

        setUp: function () {
            this.initialDOM = '<input type="text" id="input-selection-filter" class=""><ul class=""></ul>';
            Y.one('.container').setHTML(this.initialDOM);
            Y.config.doc.documentElement.focus();

            this.view = new Y.eZ.SelectionFilterView({
                container: '.container',
                inputNode: '#input-selection-filter',
                listNode: '.container ul',
                source: source,
                resultFilters: 'startsWith',
                resultHighlighter: 'startsWith',
            });
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _assertDefaultList: function (source) {
            var items = this.view.get('listNode').all(this.view.ITEM_TAG);

            Y.Assert.areEqual(
                source.length, items.size(),
                "The list should contain as many items as in the source"
            );

            Y.Array.each(source, function (val) {
                var item = this.view.get('listNode').one('[data-text="' + val + '"]');
                Y.Assert.isObject(item, "The item for '" + val + "' is missing");
                Y.Assert.areEqual(
                    val, item.getContent()
                );
            }, this);
        },

        "Should render itself when the source array changes": function () {
            var newSource = ['Foo Fighters', 'Led Zeppelin', 'AC/DC'];

            this.view.render();
            this.view.set('source', newSource);
            this._assertDefaultList(newSource);
        },
    });


    Y.Test.Runner.setName("eZ Selection Filter View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(filterDisabledTest);
    Y.Test.Runner.add(preselectedTest);
    Y.Test.Runner.add(multipleSelectTest);
    Y.Test.Runner.add(multipleUnselectTest);
    Y.Test.Runner.add(sourceValidationTest);
    Y.Test.Runner.add(objectSourceTest);
    Y.Test.Runner.add(sourceChangeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-selectionfilterview']});
