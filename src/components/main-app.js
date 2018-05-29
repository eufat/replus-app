import {LitElement, html} from '@polymer/lit-element';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {updateMetadata} from 'pwa-helpers/metadata.js';

import {store} from '../store.js';
import {setCurrentUser, authenticateUser, deauthenticateUser} from '../actions/app.js';
import {navigate, updateOffline, updateLayout} from '../actions/app.js';
import {toTitleCase} from '../utils';
import './snack-bar.js';

import './main-help.js';
import './not-found.js';
import './main-account.js';

import './activity-main.js';
import './rooms-main.js';
import './settings-main.js';

class MainApp extends connect(store)(LitElement) {
    _render({appTitle, _page, _drawerOpened, _snackbarOpened, _snackbarText, _offline}) {
        console.log('main-app page:', _page);
        console.log('sbt:', _snackbarText);
        return html`
            <style>
                .page {
                    display: none;
                }

                .page[active] {
                    display: block;
                }
            </style>
            <main class="main-content">
                <main-auth class="page" active?="${_.includes(_page, 'auth')}"></main-auth>
                <main-dashboard class="page" active?="${_.includes(_page, 'dashboard')}">
                    <activity-main class="page" active?="${_.includes(_page, 'activity') || !_.includes(_page, '/')}"></activity-main>
                    <rooms-main class="page" active?="${_.includes(_page, 'rooms')}"></rooms-main>
                    <settings-main class="page" active?="${_.includes(_page, 'settings')}"></settings-main>
                    <main-account class="page" active?="${_.includes(_page, 'account')}"></main-account>
                    <main-help class="page" active?="${_.includes(_page, 'help')}"></main-help>
                </main-dashboard>
            </main>
            <snack-bar active?="${_snackbarOpened}" text="${_snackbarText}"></snack-bar>
    `;
    }

    static get properties() {
        return {
            appTitle: String,
            _page: String,
            _drawerOpened: Boolean,
            _snackbarOpened: Boolean,
            _snackbarText: String,
            _offline: Boolean,
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

        firebase.auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                store.dispatch(authenticateUser());
                store.dispatch(setCurrentUser(firebaseUser));
            } else {
                store.dispatch(deauthenticateUser());
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
        this._page = state.app.page;
        this._offline = state.app.offline;
        this._snackbarOpened = state.app.snackbarOpened;
        this._snackbarText = state.app.snackbarText;
        this._drawerOpened = state.app.drawerOpened;
    }
}

window.customElements.define('main-app', MainApp);
