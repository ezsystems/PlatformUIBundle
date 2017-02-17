/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
/* global CKEDITOR, AlloyEditor */
YUI.add('ez-alloyeditor-plugin-paste-tests', function (Y) {
    var definePluginTest, pasteTest,
        Assert = Y.Assert, Mock = Y.Mock;

    definePluginTest = new Y.Test.Case({
        name: "eZ AlloyEditor paste plugin define test",

        setUp: function () {
            this.editor = new Mock();
            Mock.expect(this.editor, {
                method: 'on',
                args: ['paste', Mock.Value.Function],
            });
        },

        tearDown: function () {
            delete this.editor;
        },

        "Should define the paste plugin": function () {
            var plugin = CKEDITOR.plugins.get('ezpaste');

            Assert.isObject(
                plugin,
                "The ezpaste should be defined"
            );
            Assert.areEqual(
                plugin.name,
                "ezpaste",
                "The plugin name should be ezpaste"
            );
        },

        "Should define the paste filter": function () {
            var plugin = CKEDITOR.plugins.get('ezpaste');

            plugin.init(this.editor);
            Assert.isInstanceOf(
                CKEDITOR.filter,
                this.editor.pasteFilter,
                "The paste filter should have been defined"
            );
        },
    });

    pasteTest = new Y.Test.Case({
        name: "eZ AlloyEditor paste test",

        "async:init": function () {
            var startTest = this.callback();

            this.container = Y.one('.container');
            this.editor = AlloyEditor.editable(
                this.container.getDOMNode(), {
                    extraPlugins: AlloyEditor.Core.ATTRS.extraPlugins.value + ',ezpaste',
                }
            );
            this.editor.get('nativeEditor').on('instanceReady', function () {
                startTest();
            });
        },

        destroy: function () {
            this.editor.destroy();
            this.container.setHTML('');
        },

        _testPaste: function (code, expected, message) {
            var editor = this.editor.get('nativeEditor');

            editor.once('paste', function (e) {
                Assert.areEqual(expected, e.data.dataValue, message);
            }, null, null, 10000);

            editor.fire('paste', {
                type: 'html',
                method: 'paste',
                dataValue: code,
            });
        },

        "Should keep the paragraph": function () {
            var code = '<p>Led Zeppelin - Whole Lotta Love</p>';

            this._testPaste(code, code, "The paragraph should be kept");
        },

        "Should keep the heading 1": function () {
            var code = '<h1>Led Zeppelin - Whole Lotta Love</h1>';

            this._testPaste(code, code, "The heading 1 should be kept");
        },

        "Should keep the heading 2": function () {
            var code = '<h2>Led Zeppelin - Whole Lotta Love</h2>';

            this._testPaste(code, code, "The heading 2 should be kept");
        },

        "Should keep the heading 3": function () {
            var code = '<h3>Led Zeppelin - Whole Lotta Love</h3>';

            this._testPaste(code, code, "The heading 3should be kept");
        },

        "Should keep the heading 4": function () {
            var code = '<h4>Led Zeppelin - Whole Lotta Love</h4>';

            this._testPaste(code, code, "The heading 4 should be kept");
        },

        "Should keep the heading 5": function () {
            var code = '<h5>Led Zeppelin - Whole Lotta Love</h5>';

            this._testPaste(code, code, "The heading 5 should be kept");
        },

        "Should keep the heading 6": function () {
            var code = '<h6>Led Zeppelin - Whole Lotta Love</h6>';

            this._testPaste(code, code, "The heading 6 should be kept");
        },

        "Should keep the unordered list": function () {
            var code = '<ul><li>Whole Lotta Love</li><li>Ramble On</li></ul>';

            this._testPaste(code, code, "The unordered list should be kept");
        },

        "Should keep the ordered list": function () {
            var code = '<ol><li>Over the hill and far away</li><li>Ramble On</li></ol>';

            this._testPaste(code, code, "The ordered list should be kept");
        },

        "Should keep the strong element": function () {
            var code = '<p>Led Zeppelin - <strong>Over the hill and far away</strong></p>';

            this._testPaste(code, code, "The strong element should be kept");
        },

        "Should keep the b element": function () {
            var code = '<p>Led Zeppelin - <b>Over the hill and far away</b></p>';

            this._testPaste(code, code, "The b element should be kept");
        },

        "Should keep the em element": function () {
            var code = '<p>Led Zeppelin - <em>Over the hill and far away</em></p>';

            this._testPaste(code, code, "The em element should be kept");
        },

        "Should keep the i element": function () {
            var code = '<p>Led Zeppelin - <i>Over the hill and far away</i></p>';

            this._testPaste(code, code, "The i element should be kept");
        },

        "Should keep the u element": function () {
            var code = '<p>Led Zeppelin - <u>Over the hill and far away</u></p>';

            this._testPaste(code, code, "The u element should be kept");
        },

        "Should keep the link": function () {
            var code = '<p><a href="https://fr.wikipedia.org/wiki/Led_Zeppelin">Led Zeppelin</a></p>';

            this._testPaste(code, code, "The link element should be kept");
        },

        "Should remove anchors": function () {
            var code = '<h2><a name="best-song"></a>Led Zeppelin - Over the hill and far away</h2>',
                expected = '<h2>Led Zeppelin - Over the hill and far away</h2>';

            this._testPaste(code, expected, "The anchor should have been removed");
        },

        "Should remove images": function () {
            var code = '<p>Led Zeppelin<img src="#" alt=""></p>',
                expected = '<p>Led Zeppelin</p>';

            this._testPaste(code, expected, "The image should have been removed");
        },

        "Should remove videos": function () {
            var code = '<p>Led Zeppelin<video src="#"></video></p>',
                expected = '<p>Led Zeppelin</p>';

            this._testPaste(code, expected, "The video should have been removed");
        },

        "Should remove custom classes": function () {
            var code = "<p class='leave-you'>Led Zeppelin - <strong class='leave'>Babe I'm gonna leave you</strong></p>",
                expected = "<p>Led Zeppelin - <strong>Babe I'm gonna leave you</strong></p>";

            this._testPaste(code, expected, "The class should have been removed");
        },

        "Should remove style attributes": function () {
            var code = "<p style='margin: 0;'>Led Zeppelin - <strong style='display: none;'>Babe I'm gonna leave you</strong></p>",
                expected = "<p>Led Zeppelin - <strong>Babe I'm gonna leave you</strong></p>";

            this._testPaste(code, expected, "The style attribute should have been removed");
        },

        "Should remove data attributes": function () {
            var code = "<p data-type='group'>Led Zeppelin</p>",
                expected = "<p>Led Zeppelin</p>";

            this._testPaste(code, expected, "The style attribute should have been removed");
        },

        "Should remove paragraph from list item": function () {
            var code = "<ul><li><p>Over the hill and far away</p></li><li><p><b>Stairway</b> to heaven</p></li></ul>",
                expected = "<ul><li>Over the hill and far away</li><li><b>Stairway</b> to heaven</li></ul>";

            this._testPaste(code, expected, "The paragraphs in list item should have been removed");
        },

        "Should transform div into paragraph": function () {
            var code = '<div><div>Led Zeppelin</div></div>',
                expected = '<p>Led Zeppelin</p>';

            this._testPaste(code, expected, "The div should be transformed into paragraph");
        },

        "Should keep the table": function () {
            var code = '<table><tr><td>Led Zeppelin</td></tr><tr><td>Over the hill and far away</td></tr></table>',
                expected = '<table><tbody><tr><td>Led Zeppelin</td></tr><tr><td>Over the hill and far away</td></tr></tbody></table>';

            this._testPaste(code, expected, "The table should have been kept");
        },

        "Should keep the border attribute on table": function () {
            var code = '<table border="1"><tr><td>Led Zeppelin</td></tr></table>',
                expected = '<table border="1"><tbody><tr><td>Led Zeppelin</td></tr></tbody></table>';

            this._testPaste(code, expected, "The table border attribute should have been kept");
        },

        "Should keep colspan attribute on td": function () {
            var code = '<table border="1"><tr><td colspan="2">Led Zeppelin</td></tr></table>',
                expected = '<table border="1"><tbody><tr><td colspan="2">Led Zeppelin</td></tr></tbody></table>';

            this._testPaste(code, expected, "The table border attribute should have been kept");
        },

        "Should keep colspan attribute on th": function () {
            var code = '<table border="1"><tr><th colspan="2">Led Zeppelin</th></tr></table>',
                expected = '<table border="1"><tbody><tr><th colspan="2">Led Zeppelin</th></tr></tbody></table>';

            this._testPaste(code, expected, "The table border attribute should have been kept");
        },

        "Should keep rowspan attribute on td": function () {
            var code = '<table border="1"><tr><td rowspan="2">Led Zeppelin</td></tr></table>',
                expected = '<table border="1"><tbody><tr><td rowspan="2">Led Zeppelin</td></tr></tbody></table>';

            this._testPaste(code, expected, "The table border attribute should have been kept");
        },

        "Should keep rowspan attribute on th": function () {
            var code = '<table border="1"><tr><th rowspan="2">Led Zeppelin</th></tr></table>',
                expected = '<table border="1"><tbody><tr><th rowspan="2">Led Zeppelin</th></tr></tbody></table>';

            this._testPaste(code, expected, "The table border attribute should have been kept");
        },

        "Should apply the paste filter after pastefromword cleanup": function () {
            var code = '<div>Led Zeppelin - <strong class="MsoNormal">Black mountain side</strong></div>',
                expected = '<p>Led Zeppelin - <strong>Black mountain side</strong></p>';

            this._testPaste(code, expected, "The pasteFilter should have been applied (no div)");
        },
    });

    Y.Test.Runner.setName("eZ AlloyEditor paste plugin tests");
    Y.Test.Runner.add(definePluginTest);
    Y.Test.Runner.add(pasteTest);
}, '', {requires: ['test', 'node', 'ez-alloyeditor-plugin-paste', 'ez-alloyeditor']});
