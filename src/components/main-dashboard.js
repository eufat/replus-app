import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-route/app-location';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-pages';
import '@polymer/iron-selector/iron-selector';

import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-material';
import '@polymer/paper-listbox';
import '@polymer/paper-icon-button';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-progress';
import '@polymer/paper-tabs';
import '@polymer/paper-fab';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {connect} from 'pwa-helpers/connect-mixin';
import {installRouter} from 'pwa-helpers/router';
import {installOfflineWatcher} from 'pwa-helpers/network';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query';

import {store} from '../store.js';
import {navigate, updateOffline, updateLayout, deauthenticateUser, showSnackbar, closeBack} from '../actions/app.js';
import {toTitleCase, pageToTitle} from '../utils.js';

const get = _.get;

class MainDashboard extends connect(store)(LitElement) {
    _render({appTitle, _page, _progress, _backable}) {
        return html`
            <style>
                app-header {
                    background-color: #4664ae;
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

                #moreMenu {
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

                paper-tabs {
                    display: block;
                    width: 100%;
                    position: fixed;
                    border-top: 1px solid #ccc;
                    height: 40px;
                    background-color: white;
                    padding-top: 10px;
                    bottom: 0;
                }

                paper-tabs[no-bar] paper-tab.iron-selected {
                    color: #4664ae;
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

                .more-menu-icon {
                    margin-right: 20px;
                }
            </style>
            <div id="body">
              <app-header-layout fullbleed>

                  <!-- Dashboard app bar -->
                  <app-header slot="header">
                      <app-toolbar>
                        ${_backable ? html`<paper-icon-button on-click="${() => this._onBack()}" icon="arrow-back"></paper-icon-button>` : null}
                          <div main-title>${pageToTitle(_page)}</div>
                        <paper-icon-button
                            class="more-button"
                            icon="more-vert"
                            on-click="${() => this._toggleMoreMenu(this.shadowRoot.getElementById('moreMenu'))}"
                        >
                        </paper-icon-button>
                        ${_progress ? html`<paper-progress value="10" indeterminate bottom-item></paper-progress>` : null}
                      </app-toolbar>
                  </app-header>
                  <!-- Dashboard content pages -->
                  <slot></slot>
                  <paper-tabs selected="0" align-bottom no-bar>
                    <paper-tab>
                    <a href="/dashboard/rooms">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:weekend"></iron-icon></div>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/activity">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:view-day"></iron-icon></div>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/metrics">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:timeline"></iron-icon></div>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/account">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:account-circle"></iron-icon></div>
                        </div>
                    </a>
                    </paper-tab>
                    <paper-tab>
                    <a href="/dashboard/settings">
                        <div class="tab-menu">
                            <div class="tab-menu-icon"><iron-icon icon="icons:settings"></iron-icon></div>
                        </div>
                    </a>
                    </paper-tab>
                    </paper-tabs>

                  <!-- Dashboard app bar menu -->
                  <paper-material id="moreMenu">
                      <paper-listbox>
                          <a name='help' href='/dashboard/help' tabindex='-1'>
                          <paper-item raised><iron-icon icon="icons:help" class="more-menu-icon"></iron-icon>Help</paper-item>
                          </a>
                          <a name='sign-out' on-click='${() => this._handleSignOut()}' tabindex='-1'>
                          <paper-item raised><iron-icon icon="icons:exit-to-app" class="more-menu-icon"></iron-icon>Sign Out</paper-item>
                          </a>
                      </paper-listbox>
                  </paper-material>
              </app-header-layout>
            </div>
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
            _backable: Boolean,
        };
    }

    constructor() {
        super();
        setPassiveTouchGestures(true);
    }

    _onBack() {
        history.back();
        store.dispatch(closeBack());
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
        this._backable = get(state, 'app.backable');
        this._snackbarOpened = get(state, 'app.snackbarOpened');
        this._drawerOpened = get(state, 'app.drawerOpened');
    }

    _handleSignOut() {
        store.dispatch(deauthenticateUser());
    }

    _toggleMoreMenu(element) {
        const moreMenuDisplay = element.style.display === 'block';

        if (moreMenuDisplay) {
            element.style.display = 'none';
            this.moreMenu = false;
        } else {
            element.style.display = 'block';
            this.moreMenu = true;
        }

        const body = this.shadowRoot.getElementById('body');
        body.onclick = function(event) {
            if (!event.target.matches('.more-button')) {
                element.style.display = 'none';
                this.moreMenu = false;
            }
        };
    }
}

window.customElements.define('main-dashboard', MainDashboard);
