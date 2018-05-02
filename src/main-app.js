import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import PolymerRedux from 'polymer-redux/polymer-redux.js';

import '@polymer/font-roboto/roboto';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/neon-animation/neon-animations';

import './main-layout';
import './main-auth';
import './main-route';

import './remote-rooms';
import './remote-devices';
import './remote-settings';

import './vision-events';
import './vision-settings';
import './vision-streams';

class ReplusApp extends PolymerElement {
    static get properties() {
        return {
            message: {
                type: String,
                statePath: 'message',
            },
            route: Object,
            subRoute: Object,
            routeData: Object,
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
            a {
              text-decoration: none;
              color: inherit;
              font-size: inherit;
            }

            paper-dropdown-menu.device-dropdown {
                margin: 1em;
                --paper-input-container-underline: {
                   display: none;
                };
            }
          </style>
          <app-location route="{{route}}"></app-location>
            <app-route
                route="{{route}}"
                pattern="/:device"
                data="{{deviceRoute}}"
                tail="{{subroute}}">
            </app-route>
            <app-route
                route="{{subroute}}"
                pattern="/:page"
                data="{{pageRoute}}">
            </app-route>
          <!-- <main-route></main-route> -->
          <!-- <main-auth /> -->
          <main-layout>
            <span slot='app-content'>
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
            </span>
            <span slot='drawer-content'>
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
            </span>
          </main-layout>
    `;
    }
}

customElements.define('main-app', ReplusApp);
