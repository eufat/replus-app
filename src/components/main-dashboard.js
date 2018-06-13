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
import '@polymer/paper-tabs';
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

                paper-tabs {
                    display: block;
                    width: 100%;
                    position: fixed;
                    border-top: 1px solid #ccc;
                    height: 50px;
                    background-color: white;
                    padding-top: 10px;
                    bottom: 0;
                }

                paper-tabs[no-bar] paper-tab.iron-selected {
                    color: #304ffe;
                }

                .tab-menu {
                    display: flex;
                    flex-direction: column;
                    text-align: center;
                }

                .tab-menu p {
                    margin: 0;
                }

                .tab-menu-icon {
                    width: 100%;
                    text-align: center;
                }
            </style>

              <app-header-layout fullbleed>

                  <!-- Dashboard app bar -->
                  <app-header fixed effects="waterfall" slot="header">
                      <app-toolbar>
                          <div main-title>Replus App</div>
                        <paper-icon-button
                            class="more-button"
                            icon="more-vert"
                            on-click="${() => this._toggleAccountMenu(this.shadowRoot.getElementById('accountMenu'))}"
                        >
                        </paper-icon-button>
                        ${_progress ? html`<paper-progress value="10" indeterminate bottom-item></paper-progress>` : null}
                      </app-toolbar>
                  </app-header>

                  <!-- Dashboard content pages -->
                  <slot></slot>
                  <paper-tabs selected="0" align-bottom no-bar>
                    <paper-tab>
                    <a href="/dashboard/activity">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:view-day"></iron-icon></div>
                            <p>Activity</p>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/rooms">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:weekend"></iron-icon></div>
                            <p>Rooms</p>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/settings">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:settings"></iron-icon></div>
                            <p>Settings</p>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/help">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:help"></iron-icon></div>
                            <p>Help</p>
                        </div>
                    </a>
                    </paper-tab>
                    </paper-tabs>

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

        const body = this.shadowRoot.getElementById('body');
        body.onclick = function(event) {
            if (!event.target.matches('.more-button')) {
                element.style.display = 'none';
                this.accountMenu = false;
            }
        };
    }
}

window.customElements.define('main-dashboard', MainDashboard);
