YUI.add('ez-mycontentblockview', function (Y) {
    'use strict';

    /**
     * Provides the My Content Block View class
     *
     * @module ez-mycontentblockview
     */
    Y.namespace('eZ');

    var COLLAPSED_CLASS = 'is-collapsed',
        TRANSITION_DURATION = 0.4,
        TRANSITION_EASING = 'ease-in-out';

    /**
     * The My Content Block view
     *
     * @namespace eZ
     * @class MyContentBlockView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.MyContentBlockView = Y.Base.create('myContentBlockView', Y.eZ.TemplateBasedView, [Y.eZ.Tabs, Y.eZ.AccordionElement], {
        events : {
            '.header .tab' : {
                'tap' : '_switchTab'
            },
            '.header .btn-toggle' : {
                'tap' : '_toggleContent'
            }
        },
        /**
         * Renders the My Content Block view
         *
         * @method render
         * @return {eZ.MyContentBlockView} the view itself
         */
        render : function () {
            this.get('container').empty().setHTML(this.template({ itemsCount : 0 }));

            this.after('activeChange', function () {
                this.on('update:userdrafts', this._renderDrafts, this);
                this.fire('get:userdrafts', this);
            });

            this.after('draftsListChange', function () {
                this._renderDrafts();
            });

            return this;
        },
        _renderDrafts : function () {
            var that = this,
                drafts = Y.Node.create('<tbody/>'),
                draftsList = this.get('draftsList'),
                tabContent = this.get('container').one('.tab-content[data-tab="drafts"]');

            this.get('container').one('.header .title > span').setHTML(draftsList.size());
            draftsList.each(function (item, index) {
                var row = new Y.eZ.MyContentBlockItemView();

                row.addTarget(that);
                row.set('model', item);

                drafts.append(row.render().get('container'));
            });

            tabContent.all('tbody').remove();
            tabContent.one('table').append(drafts);

            return this;
        },
        /**
         * Switches active tab and displays its content
         *
         * @method _switchTab
         * @protected
         * @return {eZ.MyContentBlockView} the view itself
         */
        _switchTab : function (event) {
            event.preventDefault();

            var container = this.get('container'),
                contentTabPath = '.tab-content[data-tab="' + event.currentTarget.getData('tab') + '"]';

            this._selectTab(
                event.currentTarget,
                contentTabPath,
                container
            );

            container.one('.title > span').setHTML(container.one(contentTabPath).all('tbody > tr').size());

            return this;
        },
        /**
         * Toggles up/down the tabs' content view
         *
         * @method _toggleContent
         * @protected
         * @return {eZ.MyContentBlockView} the view itself
         */
        _toggleContent : function (event) {
            var buttonArrow = event.currentTarget.one('.arrow'),
                content = this.get('container').one('.content');

            this._collapse({
                collapsedClass  : COLLAPSED_CLASS,
                detectElement   : content,
                duration        : TRANSITION_DURATION,
                easing          : TRANSITION_EASING,
                collapseElement : content
            });

            if (buttonArrow.hasClass('down')) {
                buttonArrow.removeClass('down').addClass('up');
            } else {
                buttonArrow.removeClass('up').addClass('down');
            }

            return this;
        }
    }, {
        ATTRS : {
            rowItem : {
                valueFn : function () {
                    return new Y.eZ.MyContentBlockItemView();
                }
            },
            draftsList : {
                valueFn : function () {
                    return new Y.eZ.VersionModelList();
                }
            }
        }
    });
});
