/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-serversideview-tests', function (Y) {
    var viewTest, tabTest, formTest, confirmBoxTest, formSerializeTest,
        Assert = Y.Assert;

    viewTest = new Y.Test.Case({
        name: "eZ Server Side view tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "getTitle should return the title": function () {
            var title = 'Love Illumination';

            this.view.set('title', title);
            Y.Assert.areSame(title, this.view.getTitle());
        },

        "should set the html as the content of the container": function () {
            var html = '<p>What are you looking for ?</p>',
                container = this.view.get('container');

            this.view.set('html', html);
            this.view.render();

            Y.Assert.areEqual(container.getHTML(), html);
        },

        "should set the server side class on the container": function () {
            var container = this.view.get('container');

            this.view.render();
            Y.Assert.isTrue(container.hasClass('ez-view-serversideview'));
        },

        "should track the html attribute change to rerender the view": function () {
            var html = 'Changed!';

            this.view.render();
            this.view.set('active', true);
            this.view.set('html', html);

            Assert.areEqual(
                html,
                this.view.get('container').getContent(),
                "The view should have been rerendered"
            );
        },
    });

    tabTest = new Y.Test.Case({
        name: "eZ Server Side view tabs tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.tab-test-container')
            });
        },

        _selectTab: function (linkSelector, labelId) {
            var that = this, c = this.view.get('container'),
                target = c.one(linkSelector),
                initialHash;

            initialHash = Y.config.win.location.hash;
            target.simulateGesture('tap', function () {
                that.resume(function () {
                    Y.Assert.areEqual(
                        labelId, c.one('.is-tab-selected').get('id'),
                        "The last label should have been selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-list .is-tab-selected').size(), 1,
                        "Only one label should be selected"
                    );

                    Y.Assert.areEqual(
                        c.all('.ez-tabs-panels .is-tab-selected').size(), 1,
                        "Only one panel should be selected"
                    );

                    Y.Assert.areEqual(
                        target.getAttribute('href').replace(/^#/, ''),
                        c.one('.ez-tabs-panels .is-tab-selected').get('id'),
                        "The panel indicated by the label link should be selected"
                    );

                    Y.Assert.areEqual(
                        initialHash, Y.config.win.location.hash,
                        "The location hash should be intact (tap event is prevented)"
                    );
                });
            });
            this.wait();
        },

        "Should select label on tap": function () {
            this._selectTab('#last-label a', 'last-label');
        },

        "Should not change selection, when already selected label is tapped": function () {
            this._selectTab('#first-label a', 'first-label');
        },

        tearDown: function () {
            this.view.destroy();
        },
    });

    formTest = new Y.Test.Case({
        name: "eZ Server Side view form tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.form-test-container'),
                html: '<form method="post" action=""><input type="submit" value="Go!"></form>'
            });
        },

        "Should handle the form submit": function () {
            var c = this.view.get('container'),
                form, submitFormEvent = false;

            this.view.on('submitForm', function (e) {
                submitFormEvent = true;
                Assert.isObject(
                    e.originalEvent,
                    "The original submit event should be provided"
                );
                Assert.areSame(
                    form, e.form,
                    "The form should be provided"
                );
                Assert.isObject(
                    e.formData,
                    "The form should be serialzed"
                );
                e.originalEvent.preventDefault();
            });
            this.view.render();

            form = c.one('form');
            form.one('input').simulate('click');
            Assert.isTrue(submitFormEvent, "The submitForm should have been fired");
        },

        tearDown: function () {
            this.view.destroy();
        },
    });

    confirmBoxTest =  new Y.Test.Case({
        name: "eZ Server Side view confirmBox tests",
        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.form-test-container'),
            });
        },

        tearDown: function () {
            this.view.destroy();
        },

        "Should launch a confirm box if the submit element has '.ez-confirm-action' class": function () {
            var c = this.view.get('container'),
                html,
                confirmBoxEvent = false;

            html = '<form method="post" action="">';
            html += '<button class="ez-confirm-action" type="submit" name="submit">Submit!</button>';
            html += '</form>';

            this.view.set('html', html);
            this.view.on('confirmBoxOpen', function (e) {
                confirmBoxEvent = true;
            });

            this.view.render();
            c.one('form button[type="submit"]').focus();
            c.one('form button[type="submit"]').simulate('click');

            Assert.isTrue(confirmBoxEvent, "The confirmBox should have been fired");
        },

        "Should submit the form after confirming action with the confirmBox": function () {
            var c = this.view.get('container'),
                html,
                submitFormEvent = false;

            html = '<form method="post" action="">';
            html += '<button class="ez-confirm-action" type="submit" name="submit">Submit!</button>';
            html += '</form>';

            this.view.set('html', html);
            this.view.on('submitForm', function (e) {
                submitFormEvent = true;
            });
            this.view.on('confirmBoxOpen', function (e) {
                e.config.confirmHandler.call(this);
            });

            this.view.render();
            c.one('form button[type="submit"]').focus();
            c.one('form button[type="submit"]').simulate('click');

            Assert.isTrue(submitFormEvent, "The submitForm should have been fired");
        },

        "Should NOT launch a confirm box if the submit element has NOT '.ez-confirm-action' class": function () {
            var c = this.view.get('container'),
                html,
                confirmBoxEvent = false,
                submitFormEvent = false;

            html = '<form method="post" action="">';
            html += '<button class="ez-not-confirm-action" type="submit" name="submit">Submit!</button>';
            html += '</form>';

            this.view.set('html', html);
            this.view.on('submitForm', function (e) {
                submitFormEvent = true;

                e.originalEvent.preventDefault();
            });

            this.view.render();
            c.one('form button[type="submit"]').focus();
            c.one('form button[type="submit"]').simulate('click');

            Assert.isFalse(confirmBoxEvent, "The confirmBox should NOT have been fired");
            Assert.isTrue(submitFormEvent, "The submitForm should have been fired");
        },

        "Should take the title and the details from the markup": function () {
            var c = this.view.get('container'),
                html,
                title = "Do you really want to remove this content type?",
                details = '<p>The <b>34</b> this content type instances will be permanently removed by this operation.</p>';

            html = '<form method="post" action="">';
            html += '<button class ="ez-confirm-action" ' +
            'data-confirmbox-title ="Do you really want to remove this content type?" ' +
            'data-confirmbox-details-selector =".ez-confirmbox-content-type-removal-details" ' +
            'type="submit" name="submit">Submit!</button>';
            html += '</form>';
            html += '<div class="ez-confirmbox-content-type-removal-details">';
            html += details;
            html += '</div>';

            this.view.set('html', html);
            this.view.on('confirmBoxOpen', function (e) {
                Assert.areSame(
                    e.config.details,
                    details,
                    'The details should appears in the confirmBox'
                );
                Assert.areSame(
                    e.config.title,
                    title,
                    'The title should appear in the confirmBox'
                );
            });
            this.view.render();
            c.one('form button[type="submit"]').focus();
            c.one('form button[type="submit"]').simulate('click');
        },

        "Should handle missing details": function () {
            var c = this.view.get('container'),
                html;

            html = '<form method="post" action="">';
            html += '<button class ="ez-confirm-action" ' +
            'data-confirmbox-title ="Do you really want to remove this content type?" ' +
            'type="submit" name="submit">Submit!</button>';
            html += '</form>';

            this.view.set('html', html);
            this.view.on('confirmBoxOpen', function (e) {
                Assert.areSame(
                    e.config.details,
                    '',
                    'The details should be an empty string'
                );
            });
            this.view.render();
            c.one('form button[type="submit"]').focus();
            c.one('form button[type="submit"]').simulate('click');
        },
    });

    formSerializeTest = new Y.Test.Case({
        name: "eZ Server Side view serialize form tests",

        setUp: function () {
            this.view = new Y.eZ.ServerSideView({
                container: Y.one('.form-test-container'),
            });
        },

        "Should serialize the text inputs": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="text" value="1" name="one">';
            html += '<input type="text" value="2" name="two">';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"one": "1", "two": "2"}, 'form input[type="submit"]');
        },

        "Should serialize the textareas": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<textarea name="one">1</textarea>';
            html += '<textarea name="two">two</textarea>';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"one": "1", "two": "two"}, 'form input[type="submit"]');
        },

        "Should serialize the select": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<select name="one"><option value="1" selected>really 1</option>';
            html += '<option value="2">2</option></select>';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"one": "1"}, 'form input[type="submit"]');
        },

        "Should serialize the multiple select without selection": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<select name="one" multiple><option value="1">really 1</option>';
            html += '<option value="2">2</option></select>';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {}, 'form input[type="submit"]');
        },

        "Should serialize the multiple select": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<select name="multiple[]" multiple><option value="1" selected>really 1</option>';
            html += '<option value="2" selected>2</option>';
            html += '<option value="3">3</option></select>';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"multiple[]": ["1", "2"]}, 'form input[type="submit"]');
        },

        "Should serialize the checkbox input": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="checkbox" value="1" name="one" checked>';
            html += '<input type="checkbox" value="2" name="two">';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"one": "1"}, 'form input[type="submit"]');
        },

        "Should serialize the radio input": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="radio" value="1" name="one" checked>';
            html += '<input type="radio" value="2" name="two">';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {"one": "1"}, 'form input[type="submit"]');
        },

        "Should ignore buttons": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="button" value="1" name="one" checked>';
            html += '<input type="reset" value="2" name="two">';
            html += '<input type="image" value="2" name="two">';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {}, 'form input[type="submit"]');
        },

        "Should serialize the used input button": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="submit" value="Submit" name="submit">';
            html += '</form>';

            this._serializeTest(html, {"submit": ""}, 'form input[type="submit"]', this._forceActiveElement);
        },

        "Should serialize the used 'image' input button": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="image" value="Submit" name="submit">';
            html += '</form>';

            this._serializeTest(html, {"submit": ""}, 'form input[type="image"]', this._forceActiveElement);
        },

        "Should serialize the used button": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<button type="submit" name="submit">Submit!</button>';
            html += '</form>';

            this._serializeTest(html, {"submit": ""}, 'form button[type="submit"]', this._forceActiveElement);
        },

        "Should ignore the used input button without a name": function () {
            var html;

            html = '<form method="post" action="">';
            html += '<input type="submit" value="Submit">';
            html += '</form>';

            this._serializeTest(html, {}, 'form input[type="submit"]', this._forceActiveElement);
        },

        _forceActiveElement: function (submit) {
            submit.focus();
        },

        _serializeTest: function (html, expectedData, submitSelector, preTestFunc) {
            var c = this.view.get('container'),
                that = this,
                submit, submitFormEvent = false;

            this.view.set('html', html);
            this.view.on('submitForm', function (e) {
                e.originalEvent.preventDefault();
                submitFormEvent = true;

                Assert.isObject(
                    e.formData,
                    "The form should be serialzed"
                );
                that._assertFormData(e.formData, expectedData);
            });
            this.view.render();
            submit = c.one(submitSelector);
            if ( preTestFunc ) {
                preTestFunc.call(this, submit);
            }
            submit.simulate('click');
            Assert.isTrue(submitFormEvent, "The submitForm should have been fired");
        },

        _assertFormData: function (formData, expected) {
            var expectedLength = Y.Object.keys(expected).length;

            Assert.areEqual(
                Y.Object.keys(formData).length,
                expectedLength,
                "The formData should have " + expectedLength + " entries"
            );
            Y.Object.each(formData, function (data, key) {
                if ( Y.Lang.isArray(expected[key]) ) {
                    Assert.areEqual(
                        expected[key].length, data.length,
                        "The " + key + " entry should have '" + expected[key].length + "' entries"
                    );
                    Y.Array.each(data, function (entry, i) {
                        Assert.areEqual(
                            expected[key][i], entry,
                            "The " + key + "[" + i + "] entry should  '" + expected[key][i] + "'"
                        );
                    });
                } else {
                    Assert.areSame(
                        expected[key], data,
                        "The " + key + " entry should be '" + expected[key] + "'"
                    );
                }
            });
        },

        tearDown: function () {
            this.view.destroy();
        },
    });

    Y.Test.Runner.setName("eZ Server Side View tests");
    Y.Test.Runner.add(viewTest);
    Y.Test.Runner.add(tabTest);
    Y.Test.Runner.add(formTest);
    Y.Test.Runner.add(confirmBoxTest);
    Y.Test.Runner.add(formSerializeTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-serversideview']});
