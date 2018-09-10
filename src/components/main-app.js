import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings';

import {connect} from 'pwa-helpers/connect-mixin';
import {installRouter} from 'pwa-helpers/router';
import {installOfflineWatcher} from 'pwa-helpers/network';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query';
import {updateMetadata} from 'pwa-helpers/metadata';

import firebase from '../firebase';
import {store} from '../store';
import {setCurrentUser, authenticateUser, deauthenticateUser} from '../actions/app';
import {navigate, updateOffline, updateLayout} from '../actions/app';
import {toTitleCase, log, pushLocationTo} from '../utils';
import './snack-bar';

import './main-help';
import './main-auth';
import './not-found';
import './main-activity';
import './main-metrics';
import './main-rooms';
import './main-settings';
import './settings-vision';
import './settings-remote';

import './remote-ac';
import './remote-tv';
import './remote-vision';

import './room-schedule';
import './room-location';

const includes = _.includes;
const isEmpty = _.isEmpty;

class MainApp extends connect(store)(LitElement) {
    static get properties() {
        return {
            appTitle: String,
            loaded: Boolean,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _snackbarText: String,
            _offline: Boolean,
            _isAuthenticated: Boolean,
            _activeRemote: Object,
            _activeRoom: Object,
        };
    }

    constructor() {
        super();
        setPassiveTouchGestures(true);
        this.loaded = false;
    }

    _firstRendered() {
        installRouter((location) => store.dispatch(navigate(window.decodeURIComponent(location.pathname))));
        installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
        installMediaQueryWatcher(`(min-width: 460px)`, (matches) => store.dispatch(updateLayout(matches)));

        const setLoaded = () => {
            this.loaded = true;
        };

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                store.dispatch(authenticateUser(setLoaded));
                store.dispatch(setCurrentUser(firebaseUser));
            } else {
                store.dispatch(deauthenticateUser(setLoaded));
            }
        });
    }

    _didRender(properties, changeList) {
        if ('_page' in changeList) {
            const pageTitle = properties.appTitle + ' - ' + toTitleCase(changeList._page.split('/').join(' '));
            updateMetadata({
                title: pageTitle,
                description: pageTitle,
                // This object also takes an image property, that points to an img src.
            });
        }
    }

    _stateChanged(state) {
        log(state);
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._snackbarText = state.app.snackbarText;
        this._drawerOpened = state.app.drawerOpened;
        this._isAuthenticated = state.app.isAuthenticated;
        this._activeRemote = state.remote.activeRemote;
        this._activeRoom = state.remote.activeRoom;
    }

    _render({_page, _snackbarOpened, _snackbarText}) {
        const onIndex = (parent) => {
            if (_page) {
                // Check if it is only parent. ex: 'dashboard' is only parent.
                const onlyParent = includes(_page, parent) && !includes(_page, '/');

                let paths = _page.split('/');
                paths = paths.filter((item) => item !== '');

                // Check either multilevel or not. ex: 'dashboard/test' is multilevel.
                const notMultilevel = !(paths.length > 1);

                // If only the parent and slash. ex: 'dashboard/' is only parent with slash.
                const onlyParentAndSlash = includes(_page, parent) && notMultilevel;
                return onlyParent || onlyParentAndSlash;
            }
        };

        if ((includes(_page, 'remote-ac') || includes(_page, 'remote-tv')) && isEmpty(this._activeRemote)) {
            pushLocationTo('/dashboard');
        }

        if ((includes(_page, 'room-schedule') || includes(_page, 'room-location')) && isEmpty(this._activeRoom)) {
            pushLocationTo('/dashboard');
        }

        return html`
            <style>
                .page {
                    display: none;
                }

                .page[active] {
                    display: block;
                }

                .center {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
            </style>
            <main class="main-content">
                ${
                    this.loaded
                        ? html`
                            ${
                                this._isAuthenticated
                                    ? html`
                                        <main-dashboard>
                                            <main-rooms class="page" active?="${includes(_page, 'rooms') || onIndex('dashboard')}"></main-rooms>
                                            <room-schedule class="page" active?="${includes(_page, 'room-schedule')}"></room-schedule>
                                            <room-location class="page" active?="${includes(_page, 'room-location')}"></room-location>
                                            <remote-ac class="page" active?="${includes(_page, 'remote-ac')}"></remote-ac>
                                            <remote-tv class="page" active?="${includes(_page, 'remote-tv')}"></remote-tv>
                                            <remote-vision class="page" active?="${includes(_page, 'remote-vision')}"></remote-vision>
                                            <main-activity class="page" active?="${includes(_page, 'activity')}"></main-activity>
                                            <main-metrics class="page" active?="${includes(_page, 'metrics')}"></main-metrics>
                                            <main-settings class="page" active?="${includes(_page, 'settings')}"></main-settings>
                                            <settings-vision class="page" active?="${includes(_page, 'setting-vision')}"></settings-vision>
                                            <settings-remote class="page" active?="${includes(_page, 'setting-remote')}"></settings-remote>
                                            <main-help class="page" active?="${includes(_page, 'help')}"></main-help>
                                        </main-dashboard>
                                    `
                                    : html`
                                        <main-auth></main-auth>
                                    `
                            }
                        `
                        : html`
                            <div class="center">
                                <paper-spinner active></paper-spinner>
                            </div>
                        `
                }
            </main>
            <snack-bar active?="${_snackbarOpened}" text="${_snackbarText}"></snack-bar>
    `;
    }
}

window.customElements.define('main-app', MainApp);
