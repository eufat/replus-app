import {
    PolymerElement,
    html,
} from '/node_modules/@polymer/polymer/polymer-element.js';
import PolymerRedux from '/node_modules/polymer-redux/polymer-redux.js';

import '/node_modules/@polymer/polymer/polymer-legacy.js';
import '/node_modules/@polymer/iron-icons/iron-icons.js';

import '/node_modules/@polymer/app-layout/app-header/app-header.js';
import '/node_modules/@polymer/app-layout/app-toolbar/app-toolbar.js';
import '/node_modules/@polymer/app-layout/app-drawer/app-drawer.js';
import '/node_modules/@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '/node_modules/@polymer/app-layout/app-header-layout/app-header-layout.js';
import '/node_modules/@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '/node_modules/@polymer/app-layout/demo/sample-content.js';

import '/node_modules/@polymer/paper-item/paper-item.js';
import '/node_modules/@polymer/paper-material/paper-material.js';
import '/node_modules/@polymer/paper-listbox/paper-listbox.js';
import '/node_modules/@polymer/paper-progress/paper-progress.js';
import '/node_modules/@polymer/paper-checkbox/paper-checkbox.js';
import '/node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '/node_modules/@polymer/paper-dropdown-menu/paper-dropdown-menu.js';

import store from './store.js';
import actions from './main-actions.js';
const ReduxMixin = PolymerRedux(store);

import './main-account.js';
import './remote-rooms.js';
import './remote-devices.js';
import './remote-settings.js';

import './vision-events.js';
import './vision-settings.js';
import './vision-streams.js';

class MainDashboard extends ReduxMixin(PolymerElement) {
    static get actions() {
        return actions;
    }
    static get properties() {
        return {
            route: Object,
            subRoute: Object,
            remoteMenus: {
                type: Array,
                value() {
                    return [
                        {
                            name: 'rooms',
                            title: 'Rooms',
                        },
                        {
                            name: 'devices',
                            title: 'Devices',
                        },
                        {
                            name: 'settings',
                            title: 'Settings',
                        },
                    ];
                },
            },
            visionMenus: {
                type: Array,
                value() {
                    return [
                        {
                            name: 'events',
                            title: 'Events',
                        },
                        {
                            name: 'streams',
                            title: 'Streams',
                        },
                        {
                            name: 'settings',
                            title: 'Settings',
                        },
                    ];
                },
            },
        };
    }

    handleSignOut() {
        this.dispatch('deauthenticateUser');
    }

    toggleAccountMenu(event) {
        const accountMenuDisplay =
            this.$.accountMenu.style.display === 'block.js';

        if (accountMenuDisplay) {
            this.$.accountMenu.style.display = 'none.js';
            this.accountMenu = false;
        } else {
            this.$.accountMenu.style.display = 'block.js';
            this.accountMenu = true;
        }
    }

    isEqualTo(a, b) {
        return a === b;
    }

    mapDeviceRoute(route) {
        const array = ['remote', 'vision'];
        return array.indexOf(route);
    }

    static get template() {
        return html`
            <style>
                app-header {
                    background-color: #4285f4;
                    color: #fff;
                }

                app-header paper-icon-button {
                    --paper-icon-button-ink-color: white;
                }

                app-drawer-layout:not([narrow]) [drawer-toggle] {
                    display: none;
                }

                a {
                    text-decoration: none;
                    color: inherit;
                    font-size: inherit;
                }

                #accountMenu {
                    margin: 0;
                    right: 0;
                    top: auto;
                    position: fixed;
                    display: none;
                    min-width: 200px;
                }

                paper-dropdown-menu.device-dropdown {
                    margin: 1em;
                    --paper-input-container-underline: {
                        display: none;
                    };
                }
            </style>
            <app-route
                route="[[route]]"
                pattern="/:page"
                data="{{containerRoute}}"
                tail="{{subroute}}">
            </app-route>
            <app-route
                route="{{subroute}}"
                pattern="/:page"
                data="{{pageRoute}}">
            </app-route>

            <app-drawer-layout fullbleed>

                <app-header-layout fullbleed>

                    <!-- Dashboard app bar -->
                    <app-header fixed effects="waterfall" slot="header">
                        <app-toolbar>
                            <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                            <div main-title>Replus App</div>
                            <paper-icon-button icon="more-vert" on-tap="toggleAccountMenu"></paper-icon-button>
                        </app-toolbar>
                    </app-header>

                    <!-- Dashboard content pages -->
                    <iron-pages selected="[[containerRoute.page]]" attr-for-selected="container-name" fallback-selection="fallback">
                        <iron-pages container-name="vision" selected="[[pageRoute.page]]" attr-for-selected="page-name" fallback-selection="fallback">
                            <div page-name="streams"><vision-streams /></div>
                            <div page-name="events"><vision-events /></div>
                            <div page-name="settings"><vision-settings /></div>
                        </iron-pages>
                        <iron-pages container-name="remote" selected="[[pageRoute.page]]" attr-for-selected="page-name" fallback-selection="fallback">
                            <div page-name="rooms"><remote-rooms /></div>
                            <div page-name="devices"><remote-devices /></div>
                            <div page-name="settings"><remote-settings /></div>
                        </iron-pages>
                        <div container-name="account"><main-account /></div>
                    </iron-pages>

                    <!-- Dashboard app bar menu -->
                    <paper-material id="accountMenu">
                        <paper-listbox>
                            <a name='account' href='/dashboard/account' tabindex='-1'>
                            <paper-item raised>Account</paper-item>
                            </a>
                            <a name='sign-out' on-tap='handleSignOut' tabindex='-1'>
                            <paper-item raised>Sign Out</paper-item>
                            </a>
                        </paper-listbox>
                    </paper-material>
                </app-header-layout>

                <app-drawer id="drawer" slot="drawer">

                    <!-- Dashboard drawer -->
                    <paper-dropdown-menu class="device-dropdown" label="Choose device"  vertical-offset="40" no-label-float noink no-animations>
                        <paper-listbox slot="dropdown-content" selected="{{mapDeviceRoute(containerRoute.page)}}">
                            <a href='/dashboard/remote/rooms' tabindex='-1'>
                                <paper-item >Replus Remote</paper-item>
                            </a>
                            <a href='/dashboard/vision/events' tabindex='-1'>
                                <paper-item >Replus Vision</paper-item>
                            </a>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <template is="dom-if" if="{{isEqualTo(containerRoute.page, 'vision')}}">
                        <iron-selector
                            class='nav-menu'
                            selected="[[pageRoute.page]]"
                            attr-for-selected='name'
                            on-iron-activate='drawerSelected'>
                            <template is='dom-repeat' items='{{visionMenus}}'>
                            <a name='[[item.name]]' href='/dashboard/vision/[[item.name]]' tabindex='-1'>
                                <paper-item raised>[[item.title]]</paper-item>
                            </a>
                            </template>
                        </iron-selector>
                    </template>
                    <template is="dom-if" if="{{isEqualTo(containerRoute.page, 'remote')}}">
                        <iron-selector
                            class='nav-menu'
                            selected="[[pageRoute.page]]"
                            attr-for-selected='name'
                            on-iron-activate='drawerSelected'>
                            <template is='dom-repeat' items='{{remoteMenus}}'>
                            <a name='[[item.name]]' href='/dashboard/remote/[[item.name]]' tabindex='-1'>
                                <paper-item raised>[[item.title]]</paper-item>
                            </a>
                            </template>
                        </iron-selector>
                    </template>

                </app-drawer>

            </app-drawer-layout>
    `;
    }
}

customElements.define('main-dashboard', MainDashboard);
