import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-route/app-location.js';
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
import '@polymer/paper-progress/paper-progress.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';

import {store} from '../store.js';
import {navigate, updateOffline, updateLayout, deauthenticateUser, showSnackbar} from '../actions/app.js';
import {toTitleCase} from '../utils';

const get = _.get;

class MainDashboard extends connect(store)(LitElement) {
    _render({appTitle, _page, _progress}) {
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

                paper-progress {
                    display: block;
                    width: 100%;
                    --paper-progress-active-color: rgba(255, 255, 255, 0.5);
                    --paper-progress-container-color: transparent;
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

                .page {
                    display: none;
                }

                .page[active] {
                    display: block;
                }
            </style>
            <app-drawer-layout fullbleed>

              <app-header-layout fullbleed>

                  <!-- Dashboard app bar -->
                  <app-header fixed effects="waterfall" slot="header">
                      <app-toolbar>
                          <paper-icon-button icon="menu" drawer-toggle></paper-icon-button>
                          <div main-title>Replus App</div>
                        <paper-icon-button
                            icon="more-vert"
                            on-click="${() => this._toggleAccountMenu(this.shadowRoot.getElementById('accountMenu'))}"
                        >
                        </paper-icon-button>
                        ${_progress ? html`<paper-progress value="10" indeterminate bottom-item></paper-progress>` : null}
                      </app-toolbar>
                  </app-header>

                  <!-- Dashboard content pages -->
                  <slot></slot>

                  <!-- Dashboard app bar menu -->
                  <paper-material id="accountMenu">
                      <paper-listbox>
                          <a name='account' href='/dashboard/account' tabindex='-1'>
                          <paper-item raised>Account</paper-item>
                          </a>
                          <a name='account' href='/dashboard/help' tabindex='-1'>
                          <paper-item raised>Help</paper-item>
                          </a>
                          <a name='sign-out' on-click='${() => this._handleSignOut()}' tabindex='-1'>
                          <paper-item raised>Sign Out</paper-item>
                          </a>
                      </paper-listbox>
                  </paper-material>
              </app-header-layout>

              <app-drawer id="drawer" slot="drawer">
                    <iron-selector
                        class='nav-menu'
                        attr-for-selected='name'
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
            _displayName: String,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _offline: Boolean,
            _progress: Boolean,
        };
    }

    constructor() {
        super();
        setPassiveTouchGestures(true);
    }

    _firstRendered() {
        installRouter((location) => store.dispatch(navigate(window.decodeURIComponent(location.pathname))));
        installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
        installMediaQueryWatcher(`(min-width: 460px)`, (matches) => store.dispatch(updateLayout(matches)));
        store.dispatch(showSnackbar(`Hello ${this._displayName ? toTitleCase(this._displayName) : 'there'}.`));
    }

    _stateChanged(state) {
        this._displayName = get(state, 'app.currentUser.displayName');
        this._page = get(state, 'app.page');
        this._offline = get(state, 'app.offline');
        this._progress = get(state, 'app.progressOpened');
        this._snackbarOpened = get(state, 'app.snackbarOpened');
        this._drawerOpened = get(state, 'app.drawerOpened');
    }

    _handleSignOut() {
        store.dispatch(deauthenticateUser());
    }

    _toggleAccountMenu(element) {
        const accountMenuDisplay = element.style.display === 'block';

        if (accountMenuDisplay) {
            element.style.display = 'none';
            this.accountMenu = false;
        } else {
            element.style.display = 'block';
            this.accountMenu = true;
        }
    }
}

window.customElements.define('main-dashboard', MainDashboard);
