import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/polymer-legacy';
import '@polymer/iron-icons/iron-icons';

import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects';
import '@polymer/app-layout/demo/sample-content';

import '@polymer/paper-item/paper-item';
import '@polymer/paper-material/paper-material';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-progress/paper-progress';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';

import './remote-rooms';
import './remote-devices';
import './remote-settings';

import './vision-events';
import './vision-settings';
import './vision-streams';

class MainDashboard extends PolymerElement {
    static get properties() {
        return {
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

    toggleAccountMenu(event) {
        const accountMenuDisplay = this.$.accountMenu.style.display === 'block';

        if (accountMenuDisplay) {
            this.$.accountMenu.style.display = 'none';
            this.accountMenu = false;
        } else {
            this.$.accountMenu.style.display = 'block';
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
          <app-drawer-layout fullbleed>

            <app-header-layout fullbleed>

              <app-header fixed effects="waterfall" slot="header">
                <app-toolbar>
                  <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                  <div main-title>Replus App</div>
                  <paper-icon-button icon="more-vert" on-click="toggleAccountMenu"></paper-icon-button>
                </app-toolbar>
              </app-header>

              <slot name="app-content"></slot>
              <paper-material id="accountMenu">
                <paper-listbox>
                  <a name='account' href='/account' tabindex='-1'>
                    <paper-item raised>Account</paper-item>
                  </a>
                  <a name='sign-out' href='/' tabindex='-1'>
                    <paper-item raised>Sign Out</paper-item>
                  </a>
                </paper-listbox>
              </paper-material>
            </app-header-layout>

            <app-drawer id="drawer" slot="drawer">
                <iron-pages selected="[[deviceRoute.device]]" attr-for-selected="device-name" fallback-selection="fallback">
                    <iron-pages device-name="vision" selected="[[pageRoute.page]]" attr-for-selected="page-name" fallback-selection="fallback">
                        <div page-name="streams"><vision-streams /></div>
                        <div page-name="events"><vision-events /></div>
                        <div page-name="settings"><vision-settings /></div>
                    </iron-pages>
                    <iron-pages device-name="remote" selected="[[pageRoute.page]]" attr-for-selected="page-name" fallback-selection="fallback">
                        <div page-name="rooms"><remote-rooms /></div>
                        <div page-name="devices"><remote-devices /></div>
                        <div page-name="settings"><remote-settings /></div>
                    </iron-pages>
                </iron-pages>
                <paper-dropdown-menu class="device-dropdown" label="Choose device"  vertical-offset="40" no-label-float noink no-animations>
                    <paper-listbox slot="dropdown-content" selected="{{mapDeviceRoute(deviceRoute.device)}}">
                        <a href='/remote/rooms' tabindex='-1'>
                            <paper-item >Replus Remote</paper-item>
                        </a>
                        <a href='/vision/streams' tabindex='-1'>
                            <paper-item >Replus Vision</paper-item>
                        </a>
                    </paper-listbox>
                </paper-dropdown-menu>
                <template is="dom-if" if="{{isEqualTo(deviceRoute.device, 'vision')}}">
                    <iron-selector
                        class='nav-menu'
                        selected="[[pageRoute.page]]"
                        attr-for-selected='name'
                        on-iron-activate='drawerSelected'>
                        <template is='dom-repeat' items='{{visionMenus}}'>
                        <a name='[[item.name]]' href='/vision/[[item.name]]' tabindex='-1'>
                            <paper-item raised>[[item.title]]</paper-item>
                        </a>
                        </template>
                    </iron-selector>
                </template>
                <template is="dom-if" if="{{isEqualTo(deviceRoute.device, 'remote')}}">
                    <iron-selector
                        class='nav-menu'
                        selected="[[pageRoute.page]]"
                        attr-for-selected='name'
                        on-iron-activate='drawerSelected'>
                        <template is='dom-repeat' items='{{remoteMenus}}'>
                        <a name='[[item.name]]' href='/remote/[[item.name]]' tabindex='-1'>
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
