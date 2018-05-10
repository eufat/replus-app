import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {updateMetadata} from 'pwa-helpers/metadata.js';

import {store} from '../store.js';
import {
    navigate,
    updateOffline,
    updateDrawerState,
    updateLayout,
} from '../actions/app.js';

import './main-account.js';
import './remote-rooms.js';
import './remote-devices.js';
import './remote-settings.js';

import './vision-events.js';
import './vision-settings.js';
import './vision-streams.js';

class MainDashboard extends connect(store)(LitElement) {
    _render({appTitle, _page, _drawerOpened, _snackbarOpened, _offline}) {
        return html`
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

    static get properties() {
        return {
            appTitle: String,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _offline: Boolean,
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

    constructor() {
        super();
        // To force all event listeners for gestures to be passive.
        // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
        setPassiveTouchGestures(true);
    }

    _firstRendered() {
        installRouter((location) =>
            store.dispatch(
                navigate(window.decodeURIComponent(location.pathname))
            )
        );
        installOfflineWatcher((offline) =>
            store.dispatch(updateOffline(offline))
        );
        installMediaQueryWatcher(`(min-width: 460px)`, (matches) =>
            store.dispatch(updateLayout(matches))
        );
    }

    _didRender(properties, changeList) {
        if ('_page' in changeList) {
            const pageTitle = properties.appTitle + ' - ' + changeList._page;
            updateMetadata({
                title: pageTitle,
                description: pageTitle,
                // This object also takes an image property, that points to an img src.
            });
        }
    }

    _stateChanged(state) {
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._drawerOpened = state.app.drawerOpened;
    }

    isEqualTo(a, b) {
        return a === b;
    }

    mapDeviceRoute(route) {
        const array = ['remote', 'vision'];
        return array.indexOf(route);
    }

    _stateChanged(state) {}
}

window.customElements.define('main-dashboard', MainDashboard);
