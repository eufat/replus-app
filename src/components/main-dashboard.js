import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';

import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-material/paper-material.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
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
    updateLayout,
    deauthenticateUser,
} from '../actions/app.js';

import './main-help.js';
import './not-found.js';
import './main-account.js';

import './activity-main.js';
import './rooms-main.js';
import './settings-main.js';

class MainDashboard extends connect(store)(PolymerElement) {
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
                    --paper-input-container-underline:  {
                        display: none;
                    };
                }
            </style>
            <app-route
                route="[[route]]"
                pattern="/:page"
                data="{{containerRoute}}"
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
                      <div container-name="account"><main-account /></div>
                      <div container-name="help"><main-help /></div>
                      <div container-name="account"><main-account /></div>
                      <div container-name="activity"><activity-main /></div>
                      <div container-name="rooms"><rooms-main /></div>
                      <div container-name="settings"><settings-main /></div>
                      <div container-name="fallback"><activity-main /></div>
                  </iron-pages>

                  <!-- Dashboard app bar menu -->
                  <paper-material id="accountMenu">
                      <paper-listbox>
                          <a name='account' href='/dashboard/account' tabindex='-1'>
                          <paper-item raised>Account</paper-item>
                          </a>
                          <a name='account' href='/dashboard/help' tabindex='-1'>
                          <paper-item raised>Help</paper-item>
                          </a>
                          <a name='sign-out' on-tap='handleSignOut' tabindex='-1'>
                          <paper-item raised>Sign Out</paper-item>
                          </a>
                      </paper-listbox>
                  </paper-material>
              </app-header-layout>

              <app-drawer id="drawer" slot="drawer">
                    <iron-selector
                        class='nav-menu'
                        selected="[[pageRoute.page]]"
                        attr-for-selected='name'
                        on-iron-activate='drawerSelected'
                    >
                        <a name='activity' href='/dashboard/activity' tabindex='-1'>
                            <paper-item raised>Activity</paper-item>
                        </a>
                        <a name='rooms' href='/dashboard/rooms' tabindex='-1'>
                            <paper-item raised>Rooms</paper-item>
                        </a>
                        <a name='settings' href='/dashboard/settings' tabindex='-1'>
                            <paper-item raised>Settings</paper-item>
                        </a>
                        <a name='help' href='/dashboard/help' tabindex='-1'>
                            <paper-item raised>Help</paper-item>
                        </a>
                    </iron-selector>
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
        };
    }

    constructor() {
        super();
        // To force all event listeners for gestures to be passive.
        // See https://www.polymer-project.org/2.0/docs/devguide/gesture-events#use-passive-gesture-listeners
        setPassiveTouchGestures(true);
    }

    ready() {
        super.ready();

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

    handleSignOut() {
        store.dispatch(deauthenticateUser());
    }

    isEqualTo(a, b) {
        return a === b;
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

    mapDeviceRoute(route) {
        const array = ['remote', 'vision'];
        return array.indexOf(route);
    }
}

window.customElements.define('main-dashboard', MainDashboard);
