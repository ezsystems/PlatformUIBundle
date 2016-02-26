/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-userprofileview', function (Y) {
    'use strict';
    /**
     * Provides the User Profile View class
     *
     * @module ez-userprofileview
     */
    Y.namespace('eZ');

    var MENU_DISPLAYED = 'is-menu-displayed';

    /**
     * The User Profile View
     *
     * @namespace eZ
     * @class UserProfileView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.eZ.UserProfileView = Y.Base.create('userProfileView', Y.eZ.TemplateBasedView, [], {
        events: {
            '.ez-user-profile': {
                'tap': '_toggleUserMenu'
            }
        },

        initializer: function () {
            /**
             * The click outside user menu event handler
             *
             * @property _clickOutsideUserMenuHandler
             * @protected
             */
            this._clickOutsideUserMenuHandler = this.get('container').on('clickoutside', this._hideMenu, this);

            this.after('userMenuView:displayedChange', function (e) {
                var container = this.get('container');

                if ( e.newVal ) {
                    container.addClass(MENU_DISPLAYED);
                } else {
                    container.removeClass(MENU_DISPLAYED);
                }
            });
        },

        /**
        * Renders the user profile view
        *
        * @method render
        * @return {eZ.UserProfileView} the view itself
        */
        render: function () {
            var container = this.get('container'),
                userAvatar = this.get('userAvatar') ? this.get('userAvatar').uri : this.get('defaultAvatarImage');

            container.setHTML(this.template({
                user: this.get('user').toJSON(),
                avatarAltText: this.get('avatarAltText'),
                userAvatar: userAvatar
            }));
       
            this._renderUserMenu();

            return this;
        },

        destructor: function () {
            this._clickOutsideUserMenuHandler.detach();
        },

        /**
         * Hides the user menu
         *
         * @method _hideMenu
         * @protected
         */
        _hideMenu: function () {
            this.get('userMenuView').hide();
        },

        /**
        * Renders the user menu view
        *
        * @method _renderUserMenu
        */
        _renderUserMenu: function () {
            var view = this.get('userMenuView');

            this.get('container').append(view.render().get('container'));
        },

        /**
         * Toggle the user menu. 
         *
         * @method _toggleUserMenu
         * @protected
         */
        _toggleUserMenu: function () {
            this.get('userMenuView').toggleDisplayed();
        }
    }, {
        ATTRS: {
            /**
             * Contains data about current user
             *
             * @attribute user
             * @type {eZ.User}
             */
            user: {},

            /**
             * Contains the alternative text for the user's avatar
             *
             * @attribute avatarAltText
             * @type {String}
             * @default: 'User\'s avatar'
             */
            avatarAltText: {
                value: 'User\'s avatar'
            },

            /**
             * Contains the default users avatar image
             *
             * @attribute defaultAvatarImage
             * @type {String}
             */
            defaultAvatarImage: {
                value:  'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0' +
                'd2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZW' +
                'dpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6' +
                'bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMz' +
                'o0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJk' +
                'Zi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy' +
                '5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5' +
                'cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3' +
                'VtZW50SUQ9InhtcC5kaWQ6QTQxQjAyNkFEMTVGMTFFNUI4OUY5NjJDMzAzMzJGMDgiIHhtcE1NOkluc3RhbmNlSUQ9' +
                'InhtcC5paWQ6QTQxQjAyNjlEMTVGMTFFNUI4OUY5NjJDMzAzMzJGMDgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUG' +
                'hvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0i' +
                'eG1wLmlpZDo3Qzc2NkFFRkQxNUMxMUU1Qjc1MDgyN0Q0MkJBREMwOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZD' +
                'o3Qzc2NkFGMEQxNUMxMUU1Qjc1MDgyN0Q0MkJBREMwOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8' +
                'L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pia2oyUAAAHoSURBVHjaYvz//z/DYAZMDIMcjDpw1IGjDhx14E' +
                'h3IAuMsWbNGnLNEADifCAOBGJZqNgjIN4AxBOB+AM5hoaEhKA6kExgDvIbEMugiQsBsQEQp4DsAuKTAxHFpkB8AIvj' +
                'kAFIbj8QGw2EAycAMQcR6jihaunqQB8gtiJBvS0Q+9LTgTZk6HGgpwM1yNAjT08HviNDzxd6OvAIGXqO0tOB24H4DQ' +
                'nqQWq30NOBz4G4nQT1TVA9dC0H+4C4l0h1kweqsVACxIZAPB0tyl8D8TSoXPFAtmZkoTl6JRDfQxK/BxV7j9SAoKw1' +
                'QwJghjYA4qGFLyeORsRBKPs7tD5eBG1Y/KVlCIKqq1tAvAKIPXE4Dltd7AXVc5vUKo9YB3IB8Vog3gTEShTEmCLUDF' +
                'BIclPLgSBDLwFxEBUbysFAfBFqNkUOVAbiY1Ca2gBk5nEgViHXgXxAvBGIJWjY5RCHJh1uchwIKtu06dAv0gPiWaQ6' +
                'MByIo+jYeYuC2kmUA0HlXOUA9DAroXYTdCAot+oPgAP1obmboAOjB7CfHkXIgaBC2GkAHeiEXhEwodUW9kDMO4AO5I' +
                'VWocLYHAjK7saDYDjGGOoWDAcaQVshAw00kGsX5OYWGxD/hzaPPg2AwxihtRfI7l8wQYAAAwDwG0iKoNe3wAAAAABJRU5ErkJggg=='
            },

            /**
             * The user menu view
             *
             * @attribute userMenuView
             * @type {eZ.UserMenuView}
             */
            userMenuView: {
                valueFn: function () {
                    return new Y.eZ.UserMenuView({
                        bubbleTargets: this
                    });
                }
            },
        }
    });
});
